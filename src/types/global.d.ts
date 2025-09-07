// Extend the Window interface to include our custom properties
declare global {
  interface Window {
    // Local storage files
    _localStorageFiles?: Record<string, {
      name: string;
      type: string;
      size: number;
      lastModified: number;
      data: string;
      path: string;
      uploadedAt: string;
    }>;

    // Google Analytics
    gtag: (
      command: string, 
      eventName: string, 
      eventParams?: Record<string, any>
    ) => void;

    // Sentry error tracking
    Sentry?: {
      captureException: (error: Error, context?: any) => void;
      configureScope: (callback: (scope: any) => void) => void;
      withScope: (callback: (scope: any) => void) => void;
    };
  }
}

export {}; // This file needs to be a module
