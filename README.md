# Digital Art Marketplace — starter skeleton

Matches project P43. Node.js + Express backend, React (Vite) frontend, wired for Azure SQL Database and Azure Blob Storage.

## Folder structure
```
backend/    Express API (SQL + Blob Storage)
frontend/   React app (browse + upload artworks)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your real values:
- `DB_SERVER` — from Azure Portal → your SQL server → Overview → "Server name" (looks like `digitalartmarket.database.windows.net`)
- `DB_NAME` — `ArtMarketplaceDB`
- `DB_USER` / `DB_PASSWORD` — the admin login you set when creating the server
- `AZURE_STORAGE_CONNECTION_STRING` — from Azure Portal → your Storage Account → **Access keys** → copy "Connection string"

Run the SQL schema (provided earlier in chat) in the Azure Query Editor first, then start the server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`. Test it: open `http://localhost:5000/api/health` — should return `{"status":"ok"}`.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:3000`, proxying `/api` calls to the backend on port 5000.

## 3. Test the flow
1. Add a test artist via a POST request to `/api/users` (use Postman or curl) with `{ "name": "Test Artist", "email": "artist@test.com", "role": "artist" }`, note the returned `UserId`.
2. In the app, click "List artwork", fill the form using that artist ID, pick two image files (original + preview), submit.
3. Click "Browse" — your artwork should appear, loading its preview image directly from Blob Storage.

## Next steps (once this works locally)
- Deploy backend to the Azure VM (or App Service) once created
- Point the preview container through Azure CDN instead of the raw Blob URL
- Add Azure Functions for payment-triggered transactions + royalty calculation
- Add Azure AD B2C for real authentication (currently artist/buyer IDs are manually entered — fine for testing, not production)
