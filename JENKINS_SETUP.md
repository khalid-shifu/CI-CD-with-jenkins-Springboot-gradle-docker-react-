# Jenkins Setup Notes

Manual/UI steps done outside the code — for redoing this setup from scratch.

## 1. Run Jenkins

Initial run (before Docker access was needed):
```
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts
```

Get the first-time admin password:
```
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

At `localhost:8080`, used that password to unlock, then chose **"Install suggested plugins"**, then created the admin user through the setup wizard.

## 2. GitHub Personal Access Token (PAT)

GitHub → profile → Settings → Developer settings → Personal access tokens → **Tokens (classic)** (not fine-grained — simpler, avoids plugin compatibility issues).

Scope selected: **`repo`** only.

Copied the generated token (shown once).

## 3. Jenkins Credentials

Manage Jenkins → Credentials → **System** → **Global** domain → Add Credentials, twice:

**Credential 1 — GitHub access**
- Kind: `Username with password`
- Username: GitHub account username
- Password: the PAT from step 2
- Treat username as secret: unchecked (username isn't sensitive)
- ID: `github-pat`
- Description: `GitHub PAT for repo access`

**Credential 2 — MySQL password**
- Kind: `Secret text`
- Secret: `root` (matches local `.env`'s `MYSQL_ROOT_PASSWORD`)
- ID: `mysql-root-password`
- Description: `MySQL root password for pipeline`

## 4. Pipeline job

Jenkins dashboard → **New Item** → name it → select **Pipeline** → OK.

**General**
- Checked **GitHub project**, pasted the repo URL (cosmetic only — adds a link/icon in the UI)

**Build Triggers**
- Checked **"GitHub hook trigger for GITScm polling"** (this is what lets a webhook actually kick off a build later — not yet wired up to an actual webhook)

**Pipeline**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: repo URL (again — this one is what Jenkins actually clones from, separate from the cosmetic "GitHub project" field)
- Credentials: `github-pat`
- Branches to build: `*/main`
- Script Path: `Jenkinsfile` (default — file lives at repo root)
- Repository browser: `Auto`

Saved.

## 5. Push code

Pushed the project to a **private** GitHub repo (private by default choice, not a functional requirement — public would also work).

Manually triggered builds with **Build Now** (webhook still not connected — GitHub can't reach `localhost:8080` on this machine without something like `ngrok`; that's still pending).

## 6. Giving Jenkins access to Docker

Base `jenkins/jenkins:lts` has no Docker CLI and no access to the host's Docker daemon. Fixed by:

- Writing a custom image at `jenkins/Dockerfile` (base image + `docker.io` + `docker compose` plugin binary + added `jenkins` user to the `root` group so it can read `/var/run/docker.sock`)
- Recreating the container from that image, this time with:
  - a named volume (`jenkins_home`) mounted to `/var/jenkins_home`, so job config/credentials survive future container recreation
  - the host's Docker socket mounted in (`/var/run/docker.sock`), so Jenkins can run `docker build`/`docker run` against the host's Docker

Because the very first container had no volume, recreating it lost the original setup — steps 1, 3, and 4 were redone against the new container (this file reflects the final/current setup, not the discarded first pass).

## Still pending

- Webhook not connected yet (needs Jenkins to be publicly reachable — `ngrok` or similar)
- No deploy stage yet, pipeline currently just builds images and runs the 3 containers locally
