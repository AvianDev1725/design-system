// Avian Dev shared pipeline shape: lint -> test -> SonarQube quality gate
// -> build -> deploy. This file is the template the other 9 repos copy;
// what's specific to *this* repo is the Deploy stage's content — a
// design system has no runnable app, so "deploy" means two things:
//   1. Publish the package to npm (main branch only, via Changesets)
//   2. Publish the Storybook static build to Vercel, as the suite's
//      living style guide
//
// Branch -> environment mapping (develop -> dev, staging -> preprod,
// main -> prod) is driven from here via the Vercel CLI + token, not
// Vercel's own git integration — that's a deliberate choice: it keeps
// the prod approval gate in Jenkins (see the `input` step below) rather
// than split across two systems. If you'd rather let Vercel's git
// integration own preview deploys and only use Jenkins for the prod
// gate, that's a reasonable alternative — see the README's flagged
// decisions.
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '30'))
  }

  tools {
    nodejs 'node22' // matches .nvmrc — configure this tool name in Jenkins Global Tool Configuration
  }

  environment {
    NPM_TOKEN = credentials('avian-dev-npm-token')
    SONAR_TOKEN = credentials('avian-dev-sonar-token')
    VERCEL_TOKEN = credentials('avian-dev-vercel-token')
    VERCEL_ORG_ID = credentials('avian-dev-vercel-org-id')
    VERCEL_PROJECT_ID = credentials('avian-dev-vercel-project-id')
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
        sh 'npm run format:check'
        sh 'npm run typecheck'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test:coverage'
      }
      post {
        always {
          // Coverage report consumed by the SonarQube stage below.
          archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
        }
      }
    }

    stage('Test: Accessibility (Playwright)') {
      steps {
        // Real-browser pass: catches color-contrast and other a11y
        // violations the jsdom-based 'Test' stage structurally can't
        // (see README, "Accessibility approach"). Needs actual browser
        // binaries, unlike the stage above.
        sh 'npx playwright install --with-deps chromium'
        sh 'npm run test:storybook'
      }
    }

    stage('SonarQube Quality Gate') {
      steps {
        withSonarQubeEnv('avian-dev-sonarqube') {
          sh 'npx sonar-scanner -Dsonar.login=$SONAR_TOKEN'
        }
      }
    }
    stage('Wait for Quality Gate') {
      steps {
        // Fails the build if SonarQube's gate fails — don't let a red
        // gate get built/deployed anyway.
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'            // package: dist/
        sh 'npm run build-storybook'  // style guide: storybook-static/
      }
    }

    stage('Deploy: Storybook (preview envs)') {
      when {
        anyOf { branch 'develop'; branch 'staging' }
      }
      steps {
        script {
          def env = (env.BRANCH_NAME == 'develop') ? 'dev' : 'preprod'
          sh """
            npx vercel deploy storybook-static \
              --token=\$VERCEL_TOKEN \
              --env=DEPLOY_ENV=${env} \
              --yes
          """
        }
      }
    }

    stage('Approval: Production') {
      when { branch 'main' }
      steps {
        // Manual gate before anything reaches prod — required by the
        // suite-wide pipeline contract, not optional per-repo.
        input message: 'Deploy @avian-dev/design-system to production?', ok: 'Deploy'
      }
    }

    stage('Deploy: Storybook (prod)') {
      when { branch 'main' }
      steps {
        sh '''
          npx vercel deploy storybook-static \
            --token=$VERCEL_TOKEN \
            --prod \
            --yes
        '''
      }
    }

    stage('Publish: npm') {
      when { branch 'main' }
      steps {
        sh 'echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc'
        // No-ops if there's nothing in .changeset/ pending — Changesets
        // is the version authority; this stage never manually bumps
        // package.json version itself.
        sh 'npx changeset publish'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
