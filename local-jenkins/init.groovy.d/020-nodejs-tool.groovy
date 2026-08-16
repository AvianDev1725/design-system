// Registers the "node22" tool the Jenkinsfile's `tools { nodejs 'node22' }`
// block expects — pointed at the system Node installed in the
// Dockerfile, not the plugin's network auto-installer.
import jenkins.model.*
import jenkins.plugins.nodejs.tools.NodeJSInstallation

def instance = Jenkins.get()
def descriptor = instance.getDescriptor(NodeJSInstallation.class)

def install = new NodeJSInstallation("node22", "/usr", [])
descriptor.setInstallations(install)
descriptor.save()
