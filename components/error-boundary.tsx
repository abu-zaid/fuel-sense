'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isChunkError: boolean;
}

/**
 * Error Boundary to catch and handle runtime errors,
 * especially chunk loading errors from dynamic imports
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk loading error
    const isChunkError = 
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module');

    return {
      hasError: true,
      error,
      isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);

    // If it's a chunk loading error, try to reload after a delay
    if (this.state.isChunkError) {
      console.log('Chunk loading error detected. The page will reload in 3 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, isChunkError: false });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              {this.state.isChunkError ? 'Update Available' : 'Something went wrong'}
            </h2>
            
            <p className="text-stone-600 mb-6">
              {this.state.isChunkError
                ? 'A new version of the app is available. The page will reload automatically in a few seconds.'
                : 'An unexpected error occurred. Please try refreshing the page.'}
            </p>

            {this.state.isChunkError ? (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Reloading...</span>
              </div>
            ) : (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-6 py-2 bg-stone-200 text-stone-900 rounded-lg hover:bg-stone-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-xs font-mono text-red-800 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
