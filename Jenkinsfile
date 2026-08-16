// Avian Dev shared pipeline shape: lint -> test -> SonarQube quality
// gate -> build. This file is the template the other 9 repos copy.
//
// Ownership split with .github/workflows/deploy.yml: this Jenkinsfile
// validates (lint/test/a11y/SonarQube/build) on every push; GitHub
// Actions owns deployment (Vercel dev/staging/prod) and npm publish.
// That split is deliberate, not incidental — SonarCloud only wants one
// source of analysis per project (we hit that exact conflict wiring
// this up: "You are running manual analysis while Automatic Analysis
// is enabled"), so Sonar stays exclusively here rather than duplicated
// into the deploy workflow too. If you're adapting this template for a
// repo that doesn't use GitHub Actions for deploy, the removed
// Deploy/Approval/Publish stages are in this file's git history.
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

  // Deliberately NOT a pipeline-global `environment {}` block: Declarative
  // Pipeline resolves `credentials(...)` bindings before `agent` even
  // allocates a node, so if this were global, a single missing Jenkins
  // credential would fail the build before Install/Lint/Test ever ran —
  // confirmed by hitting exactly that while first standing this pipeline
  // up. Each credential is scoped to only the stage that needs it.
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
        //
        // Deliberately NOT `--with-deps`: that flag apt-get installs
        // Chromium's OS-level shared libraries, which needs root — the
        // Jenkins agent user doesn't have it, confirmed by hitting a
        // `sudo`/`su` auth failure here on a real run. Those system
        // packages belong baked into the CI agent's Docker image once
        // (`npx playwright install-deps chromium`, run as root at
        // image-build time — see this repo's local demo Jenkins image
        // for an example), not reinstalled by every build as a
        // non-root user. This line only fetches the browser binary
        // itself, which doesn't need root.
        sh 'npx playwright install chromium'
        sh 'npm run test:storybook'
      }
    }

    stage('SonarQube Quality Gate') {
      environment {
        SONAR_TOKEN = credentials('avian-dev-sonar-token')
      }
      steps {
        withSonarQubeEnv('avian-dev-sonarqube') {
          sh 'npx sonar-scanner -Dsonar.login=$SONAR_TOKEN'
        }
      }
    }
    stage('Wait for Quality Gate') {
      steps {
        // Fails the build if SonarQube's gate fails — don't let a red
        // gate get built anyway.
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
  }

  post {
    always {
      cleanWs()
    }
  }
}
