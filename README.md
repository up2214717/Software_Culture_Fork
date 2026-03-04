# House-Sharing-App

Can edit

## Docker

- Build locally: `docker build -t house-sharing-app .`
- Run locally: `docker run --rm -p 8080:8080 house-sharing-app`

## GitHub Container Registry Publish (on merge to `master`)

- Workflow file: `.github/workflows/publish-docker.yml`
- Trigger: every push to `master` (includes merged pull requests)
- Published image (latest): `ghcr.io/<owner>/<repo>:latest`
- Published image (commit): `ghcr.io/<owner>/<repo>:sha-<commit>`

### One-time repository setting

- In your GitHub repo, go to: `Settings` -> `Actions` -> `General`
- Ensure workflow permissions allow: `Read and write permissions`

The workflow uses `secrets.GITHUB_TOKEN` automatically (no extra secret required).
