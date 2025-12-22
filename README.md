# MockupGen

## Local Development
1. Install dependencies once: `npm install`.
2. Start the app (Express screenshot service + Vite) with `npm run dev`.
   - Express listens on `http://localhost:3001`.
   - Vite serves the UI on `http://localhost:5173`.
3. Optional Flask helper: `python3 app.py` (serves `/readme` on port 5000).

If either dev server refuses to start because a port is busy, free the port (e.g., `lsof -nP -iTCP:3001 -sTCP:LISTEN`) or adjust the port in `server.js`/`vite.config.js`.

## Production (Domain Deploy)
1. Build the frontend once: `npm run build`.
2. Start the server (serves `dist/` + `/api/screenshot`): `npm run start`.

### Security / Middleware
The Express server includes basic hardening (Helmet, compression, rate limiting) and URL validation to reduce abuse/SSRF risk.

Env vars you can set:
- `PORT` (default `3001`)
- `CORS_ORIGIN` (comma-separated allowlist; default is **disabled**)
- `SCREENSHOT_RATE_LIMIT_PER_MIN` (default `30`)
- `RATE_LIMIT_PER_MIN` (global limiter; default `300`)
- `ALLOW_PRIVATE_URLS` (`true`/`false`; default is `false` in production)
- `TRUST_PROXY` (default `1`, useful behind nginx/Cloudflare)

## Ngrok Tunnels
1. Authenticate ngrok on this machine: `ngrok config add-authtoken <your-token>`.
2. Use the provided `ngrok.yml`, which already exposes:
   - `web`: Express screenshot API on port 3001.
   - `api`: Flask helper on port 5000.
3. Start both tunnels from the project root:
   ```
   ngrok start --config=ngrok.yml web api
   ```
4. ngrok prints public URLs for each tunnel; share those URLs to let others hit the local services.

Need to expose the Vite UI as well? Either add another block to `ngrok.yml` pointing to port 5173 or run `ngrok http 5173`.
