// Local-only demo instance (bound to 127.0.0.1, ephemeral container) —
// a single admin account is enough here. Never reuse this pattern for
// a real, network-reachable Jenkins.
import jenkins.model.*
import hudson.security.*

def instance = Jenkins.get()

def realm = new HudsonPrivateSecurityRealm(false)
realm.createAccount("admin", "avian-dev-demo")
instance.setSecurityRealm(realm)

def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

instance.save()
