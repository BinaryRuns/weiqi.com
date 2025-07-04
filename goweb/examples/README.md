# Environment Configuration

This directory contains example environment files for different deployment scenarios.

## Local Development

Copy `env.local.example` to the root of the project as `.env.local`:

```bash
cp examples/env.local.example ../.env.local
```

Then edit `.env.local` to add your Supabase anon key.

## Production Deployment

For production deployment on your EC2 instance, copy `env.production.example` to the root as `.env.production`:

```bash
cp examples/env.production.example ../.env.production
```

## Vercel Deployment

When deploying to Vercel, you need to add the environment variables from `env.vercel.example` to your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable from the example file

## Required Environment Variables

| Variable                        | Description                          | Example                                              |
| ------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL            | `https://sieeuzkzaujoepqjzag.supabase.co`            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key          | `eyJhbGciOiJIUzI1NiIsInR5...`                        |
| `NEXT_PUBLIC_API_URL`           | URL to your backend API              | `http://34.238.220.156` or `https://api.weiqi.com`   |
| `NEXT_PUBLIC_WS_URL`            | WebSocket URL for your backend       | `ws://34.238.220.156/ws` or `wss://api.weiqi.com/ws` |
| `NODE_ENV`                      | Environment (development/production) | `production`                                         |

## Important Notes

- Never commit `.env` files to your repository
- For production, always use HTTPS/WSS when possible
- Update the EC2 IP address in the examples to match your actual instance
