# ReloCompass — Infrastructure

## Proxy Routes (Caddy)
| Path | Type | Target |
|------|------|--------|
| `/` | reverse_proxy | localhost:3000 (Next.js production server) |

## Background Services
| Name | Command | Description |
|------|---------|-------------|
| `relocompass-web` | `npm run start -- -p 3000` | Next.js production server on port 3000 |

## Environment Variables
All stored via backend env-key system (NEVER hardcoded):

| Key | Tag/Value | File |
|-----|-----------|------|
| `DATABASE_URL` | `mysql://USER:PASS@HOST:PORT/DB` | `/workspace/.env` |
| `NEXTAUTH_URL` | `https://{{DOMAIN}}` | `/workspace/.env` |
| `NEXTAUTH_SECRET` | static (generated) | `/workspace/.env` |
| `OPENAI_API_KEY` | static (from create_openai_api_key) | `/workspace/.env` |
| `OPENAI_BASE_URL` | static (from create_openai_api_key) | `/workspace/.env` |

## Ports
- 3000: Next.js production server

## Setup Script
1. `npm ci --production` (or `npm install`)
2. `npx prisma generate`
3. `npx prisma migrate deploy`
4. `npx prisma db seed` (if seeders exist)
5. `npm run build`
