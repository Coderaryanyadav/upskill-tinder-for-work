
# Tinder for Work App (Community) [![PWA Ready](https://img.shields.io/badge/PWA-Ready-673ab8.svg)](https://web.dev/progressive-web-apps/) [![Vite](https://img.shields.io/badge/vite-4.4.0-646CFF.svg)](https://vitejs.dev/) [![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)

Company Vision : Ma
Company Mission : Helping open Skill 
scroll platform no swipe
Mission: To create a trusted platform that connects individuals seeking work with verified short-term employment opportunities, while enabling businesses to access reliable, on-demand talent with efficiency and transparency.

Vision: To become India’s leading open-skill workforce network, transforming the way millions earn and businesses hire by building a scalable, inclusive, and trusted ecosystem for flexible work.
A modern Progressive Web Application (PWA) for job matching, built with React, TypeScript, and Vite. This app provides a Tinder-like interface for job seekers and employers to connect.

✨ **Key Features**
- 🚀 Blazing fast performance with Vite
- 📱 Fully responsive and mobile-first design
- 🔄 Offline-first with service workers
- 📦 Optimized asset loading and code splitting
- 🎨 Beautiful UI with Radix UI components
- 🔒 Secure authentication with Firebase
- 📱 Installable on mobile devices

## 🌟 PWA Features

- **Offline Support**: Works without an internet connection after initial load
- **Installable**: Can be installed on your device's home screen
- **Fast Loading**: Optimized assets and caching strategies
- **App-like Experience**: Full-screen mode and native app feel
- **Push Notifications**: Stay updated with new job matches

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your Firebase configuration

### Development

Start the development server:
```bash
npm run dev
```

### Building for Production

Create an optimized production build with PWA support:
```bash
# Standard production build
npm run build

# Analyze bundle size (requires ANALYZE=true)
ANALYZE=true npm run build

# Build with bundle analysis report
npm run analyze
```

### Preview Production Build

To preview the production build locally:
```bash
# Start a local server to preview the production build
npm run preview

# Or preview with host flag to make it accessible on your local network
npm run preview:prod
```

### Development Mode

Start the development server with hot module replacement (HMR):
```bash
# Start development server
npm run dev

# Start with bundle analysis
ANALYZE=true npm run dev
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import your repository into Vercel
3. Vercel will automatically detect the Vite configuration and deploy your app
4. Set up the following environment variables in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

### Firebase Hosting

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Build your project:
   ```bash
   npm run build
   ```
4. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Follow the prompts to install

### Mobile (Android/Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots) and select "Add to Home screen"
3. Confirm the installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the share button (box with arrow)
3. Select "Add to Home Screen"
4. Confirm the installation

## 🔧 Development

### Code Style

This project uses ESLint and Prettier for code formatting. Run the following commands to check and fix code style:

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint:fix

# Format code with Prettier
npm run format
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📦 Dependencies

### Main Dependencies
- React 18
- React DOM
- React Router DOM
- Firebase (Auth, Firestore, Storage)
- Radix UI Components
- Vite
- TypeScript

### Development Dependencies
- @types/node
- @types/react
- @types/react-dom
- @vitejs/plugin-react-swc
- eslint
- prettier
- typescript
- vite
- vite-plugin-pwa

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Figma Design](https://www.figma.com/design/sStfCbnARgqcJ7Tvnll1ku/Tinder-for-Work-App--Community-)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Radix UI](https://www.radix-ui.com/)

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase (if not already done):
   ```bash
   firebase init
   ```
4. Build your project:
   ```bash
   npm run build
   ```
5. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## 📦 Build Optimization

The project is configured with:
- Code splitting for better load performance
- Lazy loading of routes
- PWA support for offline functionality
- Bundle analysis with rollup-plugin-visualizer

## 🔧 Troubleshooting

- If you encounter module resolution issues, try:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- For TypeScript errors, ensure all dependencies are properly installed

## 📄 License

This project is licensed under the MIT License.# SIHOpskl
