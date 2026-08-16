// Creates a Pipeline job reading the Jenkinsfile straight from a repo's
// main branch over anonymous HTTPS (works for a public repo — a
// private one would need a credential added here too).
//
// SEED_REPO_URL / SEED_JOB_NAME are read from the environment so this
// same image works for any of the 10 Avian Dev repos — pass them via
// `docker run -e`, see local-jenkins/README.md. Defaults point at this
// repo (design-system) so it works out of the box with zero flags.
import jenkins.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import hudson.plugins.git.GitSCM
import hudson.plugins.git.BranchSpec
import hudson.plugins.git.UserRemoteConfig

def instance = Jenkins.get()
def repoUrl = System.getenv("SEED_REPO_URL") ?: "https://github.com/AvianDev1725/design-system.git"
def jobName = System.getenv("SEED_JOB_NAME") ?: "design-system"

if (instance.getItem(jobName) == null) {
  def job = instance.createProject(WorkflowJob.class, jobName)

  def remotes = [new UserRemoteConfig(repoUrl, null, null, null)]
  def branches = [new BranchSpec("*/main")]
  def scm = new GitSCM(remotes, branches, null, null, Collections.emptyList())

  def def_ = new CpsScmFlowDefinition(scm, "Jenkinsfile")
  def_.setLightweight(true)
  job.setDefinition(def_)
  job.save()
}
