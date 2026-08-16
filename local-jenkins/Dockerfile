FROM jenkins/jenkins:lts

USER root
# System Node 22, for the "node22" Jenkins tool to point at directly
# (a fixed path, not the NodeJS plugin's auto-installer) — avoids a
# network call inside every pipeline run just to fetch Node.
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && node -v && npm -v
# Chromium's OS-level shared libraries, baked in as root at build time
# — this is what the Jenkinsfile's a11y stage comment refers to. Pinned
# to the same Playwright version the design-system project uses so the
# installed libs actually match the browser build it'll download.
RUN npx --yes playwright@1.62.1 install-deps chromium
USER jenkins

ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/
