// Registers the SonarQube server the Jenkinsfile's
// `withSonarQubeEnv('avian-dev-sonarqube')` step looks up by name.
// Points at SonarCloud (API-compatible with the same Jenkins plugin) —
// change SONARQUBE_URL if you're running SonarQube locally instead.
//
// Deliberately references a credential ID (`avian-dev-sonar-token`)
// that doesn't need to exist yet: this only configures *where* the
// token should come from, not the token itself — add that credential
// separately via Manage Jenkins -> Credentials once you have a real
// SonarCloud token.
import jenkins.model.*
import hudson.plugins.sonar.SonarGlobalConfiguration
import hudson.plugins.sonar.SonarInstallation
import hudson.plugins.sonar.model.TriggersConfig

def serverUrl = System.getenv("SONARQUBE_URL") ?: "https://sonarcloud.io"
def credentialsId = System.getenv("SONARQUBE_CREDENTIALS_ID") ?: "avian-dev-sonar-token"

def config = SonarGlobalConfiguration.get()
def installation = new SonarInstallation(
  "avian-dev-sonarqube",
  serverUrl,
  credentialsId,
  null,          // serverAuthenticationToken (deprecated legacy field — credentialsId above replaces it)
  null,          // webhookSecretId
  null,          // mojoVersion
  "",            // additionalProperties
  "",            // additionalAnalysisProperties
  new TriggersConfig()
)
config.setInstallations(installation)
config.save()
