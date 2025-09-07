# Vercel Deployment Guide

This guide will help you deploy the Tinder for Work application to Vercel.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. A Firebase project (free tier is sufficient)
3. Node.js 16.x or later installed locally
4. Git installed locally

## 1. Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update the following environment variables in `.env.local` with your Firebase project details:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

## 2. Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Run the following command in the project root:
   ```bash
   vercel
   ```

3. Follow the prompts to log in and link your project.

4. When asked "Set up and deploy?", choose `Y`.

5. For the remaining questions, use the default options.

### Option B: Using GitHub, GitLab, or Bitbucket

1. Push your code to a repository on GitHub, GitLab, or Bitbucket.

2. Go to [Vercel Dashboard](https://vercel.com/dashboard).

3. Click "New Project" and import your repository.

4. Configure your project:
   - Framework Preset: `Vite`
   - Root Directory: (leave empty)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `vite`

5. Add all the environment variables from your `.env.local` file to Vercel's environment variables.

6. Click "Deploy".

## 3. Configure Firebase Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/).

2. Select your project.

3. Go to Authentication > Sign-in method.

4. Enable the sign-in methods you want to use (Email/Password, Google, etc.).

5. Add your Vercel domain to the authorized domains in Firebase Authentication settings.

## 4. Configure Firebase Storage

1. Go to the [Firebase Console](https://console.firebase.google.com/).

2. Select your project.

3. Go to Storage > Rules.

4. Update the security rules as needed. Here's a basic example:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 5. Test Your Deployment

1. After deployment, test the following:
   - User registration and login
   - File uploads to Firebase Storage
   - Offline functionality
   - PWA installation

## 6. Set Up Custom Domain (Optional)

1. In the Vercel dashboard, go to your project.

2. Click on "Settings" > "Domains".

3. Add your custom domain and follow the instructions to verify it.

## 7. Enable Automatic Deployments (Optional)

1. In the Vercel dashboard, go to your project.

2. Click on "Git" in the left sidebar.

3. Connect your Git provider if you haven't already.

4. Enable "Automatically deploy from this Git branch" and select your main branch.

## Troubleshooting

- **Build Fails**: Check the build logs in the Vercel dashboard for specific errors.
- **Environment Variables**: Ensure all required environment variables are set in Vercel.
- **CORS Issues**: Make sure your Firebase Storage and Authentication domains are properly configured.
- **PWA Not Working**: Check the service worker registration in the browser's developer tools.

## Support

If you encounter any issues, please refer to the [Vercel Documentation](https://vercel.com/docs) or [Firebase Documentation](https://firebase.google.com/docs).
