# Deploying the Next.js Frontend to Vercel

This guide explains how to deploy the Weiqi.com Next.js frontend to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) (optional, but recommended)
- Git repository with your Next.js project

## Deployment Options

### Option 1: Using the Vercel Dashboard (Recommended for first deployment)

1. **Sign in to Vercel**:

   - Go to [vercel.com](https://vercel.com/) and sign in with your account.

2. **Import your Git repository**:

   - Click "Add New..." → "Project"
   - Connect your Git provider (GitHub, GitLab, or Bitbucket)
   - Select the weiqi.com repository

3. **Configure project**:

   - Vercel will automatically detect that it's a Next.js project
   - Set the root directory to `goweb` if your Next.js code is in that subdirectory
   - Configure environment variables:
     - `NEXT_PUBLIC_API_URL`: URL of your backend API (e.g., `https://api.weiqi.com`)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Using the Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Navigate to your Next.js project directory**:

   ```bash
   cd goweb
   ```

4. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   For production deployment:

   ```bash
   vercel --prod
   ```

## Environment Variables

Configure these environment variables in the Vercel dashboard or in a `.env.production` file:

- `NEXT_PUBLIC_API_URL`: URL of your backend API
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL (if using Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (if using Supabase)

## Custom Domain Setup

1. **Add your domain in the Vercel dashboard**:

   - Go to your project settings
   - Navigate to "Domains"
   - Add your domain (e.g., `weiqi.com`)

2. **Configure DNS**:

   - Option 1: Use Vercel as your nameserver
   - Option 2: Add DNS records to your existing DNS provider:
     - Add a CNAME record for `www` pointing to `cname.vercel-dns.com`
     - Add an A record for the apex domain (`@`) pointing to Vercel's IP addresses

3. **Verify domain ownership**:
   - Follow Vercel's instructions to verify domain ownership

## Automatic Deployments

Vercel automatically deploys your application when you push changes to your Git repository:

- **Production deployments**: When you push to the main branch
- **Preview deployments**: When you create a pull request

## Monitoring and Logs

- View deployment status, logs, and analytics in the Vercel dashboard
- Set up integrations with monitoring tools like Sentry for error tracking

## Rollbacks

If a deployment causes issues:

1. Go to the "Deployments" tab in the Vercel dashboard
2. Find a previous working deployment
3. Click the three dots (⋮) and select "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/solutions/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
