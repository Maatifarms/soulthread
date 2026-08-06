import React from 'react';

/**
 * Global Error Boundary to catch render crashes.
 * Prevents the entire React tree from unmounting into a blank white screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service like Sentry
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred in the UI.'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '8px 16px', marginTop: '16px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
