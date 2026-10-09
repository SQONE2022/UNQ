# Stockline

Size-level inventory + job order tracker. Node.js (Express) backend, plain HTML/JS front end.

## Run locally

```bash
npm install
ADMIN_USER=admin ADMIN_PASS=your-password npm start
# open http://localhost:3000
```

Without env vars the login is `admin` / `admin123` (a warning is printed). Change it before deploying.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/stockline.git
git push -u origin main
```

## Deploy

GitHub stores the code, but **GitHub Pages cannot run Node.js** (static files only).
Connect the GitHub repo to a Node host instead, e.g. Render, Railway, or Fly.io:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `ADMIN_USER`, `ADMIN_PASS`
- Data is saved to `data/stockline.json`. On free tiers the disk is often wiped on redeploy;
  attach a persistent disk and set `DATA_DIR` to its mount path (e.g. `/var/data`).
