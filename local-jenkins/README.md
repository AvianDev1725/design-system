# Local Jenkins (demo/dev only)

A disposable, fully-scripted Jenkins — no manual setup wizard, no
clicking through the UI — for seeing this repo's `Jenkinsfile` actually
run without a real Jenkins server. Built and verified while first
standing up this pipeline; reuse it as-is for the other 9 Avian Dev
repos (see "Using this for another repo" below).

**Local-only. Never point this at a real network.** The admin
credentials below are hardcoded and the security model is
"one admin account, nothing else" — fine for `127.0.0.1:8080` on your
own machine, not fine for anything reachable by anyone else.

## What's actually configured

- **Security**: single admin account (`admin` / `avian-dev-demo`),
  setup wizard skipped entirely (`010-security.groovy`).
- **Node 22 tool** named `node22`, matching the Jenkinsfile's
  `tools { nodejs 'node22' }` — pointed at a system Node install baked
  into the image, not the NodeJS plugin's network auto-installer
  (`020-nodejs-tool.groovy`).
- **Chromium's OS-level libraries**, pre-installed as root at
  image-build time (`npx playwright install-deps chromium` in the
  Dockerfile) — this is what lets the "Test: Accessibility
  (Playwright)" stage's `npx playwright install chromium` (browser
  binary only, no root needed) actually work as the non-root Jenkins
  user.
- **A seeded Pipeline job** pointed at this repo's `main` branch over
  anonymous HTTPS (`030-seed-job.groovy`).
- **Plugins**: git, workflow-aggregator (Pipeline), nodejs,
  credentials-binding, pipeline-stage-view, timestamper, sonar,
  ws-cleanup — exactly what this repo's `Jenkinsfile` needs to _parse_
  (not necessarily to fully succeed — SonarQube/Vercel/npm still need
  real credentials, see below).

## What it can't do without more setup

`Install` → `Lint` → `Test` → `Test: Accessibility (Playwright)` all
run and pass with **zero** additional configuration — none of those
stages touch real infrastructure.

The SonarQube **server** (name `avian-dev-sonarqube`, pointed at
`https://sonarcloud.io`) is pre-configured (`040-sonarqube-server.groovy` —
set `SONARQUBE_URL` to point at a different server, e.g. a local
SonarQube instead of SonarCloud). What's still missing on a fresh
container is the **credentials** themselves — nothing here can
generate these for you, they come from your own accounts:

- `avian-dev-sonar-token` — SonarCloud → My Account → Security →
  Generate Token
- `avian-dev-npm-token` — npmjs.com → Profile → Access Tokens →
  Generate New Token (type: **Automation**)
- `avian-dev-vercel-token` — vercel.com → Account Settings → Tokens
- `avian-dev-vercel-org-id` / `avian-dev-vercel-project-id` — from
  `.vercel/project.json` after running `vercel link` in the repo root,
  or Vercel's project Settings page

Add each as **Manage Jenkins → Credentials → System → Global
credentials → Add Credentials → Secret text**, using the exact ID
above (must match — that's what the Jenkinsfile's `credentials(...)`
calls and `040-sonarqube-server.groovy`'s `credentialsId` look up).

## Running it

Needs Docker. If Docker Desktop's cask install fails on a `sudo`
prompt you can't answer non-interactively (it did, here), use
[Colima](https://github.com/abiosoft/colima) instead — a plain
Homebrew formula, no privileged installer:

```bash
brew install colima docker
colima start --cpu 2 --memory 4 --disk 20
```

Then, from this directory:

```bash
docker build -t avian-dev-jenkins:local .
docker volume create jenkins_home
docker run -d --name jenkins \
  -p 127.0.0.1:8080:8080 -p 127.0.0.1:50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  avian-dev-jenkins:local
```

Open **http://localhost:8080**, log in as `admin` / `avian-dev-demo`,
open the `design-system` job, **Build Now**.

Tear down:

```bash
docker rm -f jenkins && docker volume rm jenkins_home
colima stop   # if you don't want the VM running in the background
```

## Using this for another repo

The seed job reads its target from environment variables, so the same
image works for any of the 10 repos:

```bash
docker run -d --name jenkins \
  -p 127.0.0.1:8080:8080 -p 127.0.0.1:50000:50000 \
  -v jenkins_home_<repo>:/var/jenkins_home \
  -e SEED_REPO_URL=https://github.com/AvianDev1725/<repo>.git \
  -e SEED_JOB_NAME=<repo> \
  avian-dev-jenkins:local
```

Use a **different named volume per repo** (`jenkins_home_<repo>`) —
the seed job only runs once per fresh volume (`if (job doesn't exist
already)`), so reusing `jenkins_home` would just keep the first repo's
job around.
