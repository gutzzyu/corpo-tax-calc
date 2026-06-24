# Base44 Tax Calculator

A professional Philippine tax calculator for income, estate, and stocks processing.

## Vercel Deployment

This project is configured for easy deployment on Vercel.

### Prerequisites

- A Vercel account
- [Vercel CLI](https://vercel.com/download) (for manual deployment)

### Deployment Steps

1. **GitHub/GitLab/Bitbucket Integration**: 
   Push this project to a repository and link it to a Vercel project. Vercel will automatically detect the Vite configuration.
2. **Environment Variables**:
   Ensure you set `VITE_GEMINI_KEY` in your Vercel Project Settings if you wish to override the default key.
3. **Routing**:
   The `vercel.json` file is included to handle Single Page Application (SPA) routing transitions.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The output will be in the `dist/` folder.
