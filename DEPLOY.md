# Deployment Guide: Nexus Project

This document outlines the standard procedure for deploying updates to the Nexus platform.

## Stack Overview
- **Frontend**: Vite (React + TypeScript)
- **Backend**: Express.js (Node.js)
- **Process Manager**: PM2 (for backend persistence)
- **Web Server**: Nginx (Reverse proxy & static file serving)
- **Database**: SQLite (Local file-based)

---

## Step 1: Frontend Build & Validation
Before deploying, the production bundle must be generated.

```bash
cd /Users/vin/nexus
npm run build
```

**Critical**: 
- The build will fail if there are any TypeScript errors.
- Always fix errors locally before attempting to deploy.
- Environment variables (like `VITE_DEEPSEEK_API_KEY`) are **baked into the bundle** at this step. Ensure `.env` is correct.

## Step 2: Deploy Frontend to VPS
Use `rsync` to sync the local `dist/` folder with the VPS.

```bash
rsync -avz --delete dist/ root@187.127.156.138:/var/www/nexus/dist/
```

**Why `--delete`?**
Vite generates hashed filenames (e.g., `index-BDqm_Puo.js`). Without `--delete`, old files from previous builds would accumulate on the server, wasting space and potentially causing caching confusion.

## Step 3: Backend Deployment (If Needed)
For UI-only changes, this step is usually skipped. If logic in `server/` changes:
1. SSH into the VPS.
2. Pull changes or rsync the `server/` directory.
3. Restart the process: `pm2 restart nexus-api`.

---

## Critical Maintenance Notes
1. **Database Safety**: Never overwrite the production SQLite database file (`data/nexus.db`) with a local version. The production DB contains live student progress.
2. **Security**: Deployment uses SSH key-based authentication. Ensure your key is added to the VPS `authorized_keys`.
3. **API Keys**: If you change the DeepSeek API key, you **must** rebuild (Step 1) and redeploy (Step 2).

---

## Verification
After deployment, check the live site:
**URL**: [https://nexus.vin.sh](https://nexus.vin.sh)
**Test**: Open Chat, toggle "Create Mode", and verify the "Topic name to create..." placeholder appears.
