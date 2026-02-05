# Environment Setup - E-Vote System

Dokumentasi lengkap untuk setup environment variables dan dependencies.

---

## 1. Environment Variables

### File: `.env.local`

```bash
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================

# Supabase Project URL
# Get from: Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon/Public Key
# Get from: Supabase Dashboard > Settings > API > anon public
# Safe to expose in client-side code
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (SECRET!)
# Get from: Supabase Dashboard > Settings > API > service_role
# NEVER expose this in client-side code
# Only use in Server Actions or API Routes
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================

# Application URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development

# ===========================================
# OPTIONAL: ANALYTICS & MONITORING
# ===========================================

# Google Analytics (optional)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry DSN (optional, for error tracking)
# NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# ===========================================
# OPTIONAL: EMAIL NOTIFICATIONS
# ===========================================

# If you want to send email notifications
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# ===========================================
# OPTIONAL: REDIS CACHE
# ===========================================

# For rate limiting or caching (production)
# REDIS_URL=redis://localhost:6379
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token
```

### File: `.env.example`

Template untuk sharing (tanpa sensitive values):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Add your custom variables below
```

### File: `.env.production`

Production-specific (untuk Vercel/deployment):

```bash
# Set these in Vercel Dashboard > Settings > Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## 2. Getting Supabase Credentials

### Step-by-Step:

1. **Login to Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Login atau buat akun baru

2. **Create Project**
   - Click "New Project"
   - Pilih organization
   - Isi project details:
     - Name: `irma-evote`
     - Database Password: (generate strong password)
     - Region: Choose closest to users
   - Click "Create new project"
   - Wait ~2 minutes untuk setup

3. **Get API Keys**
   - Navigate to: `Settings > API`
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

4. **Save to `.env.local`**
   ```bash
   # Create file
   touch .env.local
   
   # Edit and paste values
   nano .env.local
   ```

---

## 3. Package Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    
    "lucide-react": "^0.344.0",
    "recharts": "^2.12.0",
    
    "zod": "^3.22.4",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "class-variance-authority": "^0.7.0",
    
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

### Install Commands

```bash
# Install all at once
npm install next@latest react@latest react-dom@latest

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI Libraries
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-toast

# Icons & Charts
npm install lucide-react recharts

# Utilities
npm install zod clsx tailwind-merge class-variance-authority

# Tailwind
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate

# Types
npm install -D @types/node @types/react @types/react-dom
```

---

## 4. Configuration Files

### `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Enable experimental features if needed
  experimental: {
    // serverActions: true, // Already enabled by default in Next.js 14
  },
}

export default nextConfig
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### `components.json` (shadcn/ui config)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### `.gitignore`

```bash
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Supabase
supabase/.branches
supabase/.temp
```

---

## 5. Development Setup Checklist

### Initial Setup

- [ ] Node.js v18+ installed
- [ ] npm or pnpm installed
- [ ] Git configured
- [ ] VS Code (recommended IDE)

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Project Setup

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in Supabase credentials
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:3000`

---

## 6. Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "rm -rf .next node_modules",
    "supabase:types": "supabase gen types typescript --project-id your-project-id > types/database.ts"
  }
}
```

---

## 7. Supabase Local Development (Optional)

If you want to develop with local Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Generate types
supabase gen types typescript --local > types/database.ts
```

Update `.env.local`:
```bash
# For local development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

---

## 8. Vercel Deployment Setup

### Prerequisites

- Vercel account
- GitHub repository

### Steps

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Select project
   - Settings > Environment Variables
   - Add all from `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Automatic Deployment

Push to `main` branch auto-deploys to production.

---

## 9. Environment Variable Validation

Create `lib/env.ts` untuk validasi:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
})
```

Use in code:
```typescript
import { env } from '@/lib/env'

const url = env.NEXT_PUBLIC_SUPABASE_URL
```

---

## 10. Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection fails

**Solution:**
1. Check `.env.local` values
2. Verify Supabase project is active
3. Check API keys are correct
4. Restart dev server: `npm run dev`

### Issue: TypeScript errors

**Solution:**
```bash
npm run type-check
# Fix reported errors
```

### Issue: Tailwind classes not working

**Solution:**
```bash
# Verify tailwind.config.ts content paths
# Check globals.css imports Tailwind
# Restart dev server
```

---

## 11. Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use `.env.example` for templates
- ✅ Keep service role key secret
- ✅ Use different keys for dev/prod
- ✅ Rotate keys periodically

### Code

- ✅ Validate all user inputs (use Zod)
- ✅ Use Server Actions for mutations
- ✅ Enable RLS on all tables
- ✅ Sanitize error messages
- ✅ Implement rate limiting

---

## 12. Quick Start Command

```bash
# One-liner setup (after cloning repo)
cp .env.example .env.local && \
npm install && \
echo "✅ Setup complete! Edit .env.local with your Supabase credentials, then run: npm run dev"
```

---

**Environment setup complete! 🎉**

Next: Proceed to [implementation-steps.md](doc/implementation-steps.md) untuk mulai development.
