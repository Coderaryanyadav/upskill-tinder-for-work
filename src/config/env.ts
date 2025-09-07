interface EnvConfig {
  // Firebase
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  
  // App
  app: {
    env: 'development' | 'staging' | 'production';
    name: string;
    version: string;
    url: string;
    description: string;
    isProduction: boolean;
    isDevelopment: boolean;
  };
  
  // API
  api: {
    baseUrl: string;
    useMock: boolean;
    cacheTtl: number;
  };
  
  // Features
  features: {
    analytics: boolean;
    performanceMonitoring: boolean;
    logging: boolean;
    serviceWorker: boolean;
    precaching: boolean;
    emailAuth: boolean;
    googleAuth: boolean;
    facebookAuth: boolean;
  };
  
  // Auth
  auth: {
    googleClientId?: string;
    facebookAppId?: string;
    tokenExpiry: number;
  };
  
  // Performance
  performance: {
    assetCacheTtl: number;
  };
}

const config: EnvConfig = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
    name: import.meta.env.VITE_APP_NAME || 'Tinder for Work',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Connect with your next career opportunity',
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
    isDevelopment: import.meta.env.VITE_APP_ENV !== 'production',
  },
  
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    useMock: import.meta.env.VITE_USE_MOCK_API === 'true',
    cacheTtl: parseInt(import.meta.env.VITE_API_CACHE_TTL || '300', 10),
  },
  
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    performanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
    logging: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
    serviceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER !== 'false',
    precaching: import.meta.env.VITE_ENABLE_PRECACHING !== 'false',
    emailAuth: import.meta.env.VITE_ENABLE_EMAIL_AUTH !== 'false',
    googleAuth: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true',
    facebookAuth: import.meta.env.VITE_ENABLE_FACEBOOK_AUTH === 'true',
  },
  
  auth: {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID,
    tokenExpiry: parseInt(import.meta.env.VITE_AUTH_TOKEN_EXPIRY || '3600', 10),
  },
  
  performance: {
    assetCacheTtl: parseInt(import.meta.env.VITE_ASSET_CACHE_TTL || '31536000', 10),
  },
};

// Validate required environment variables in production
if (config.app.isProduction) {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export default config;
