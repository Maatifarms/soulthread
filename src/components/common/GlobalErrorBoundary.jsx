import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: 'var(--color-background)', minHeight: '100vh', color: 'var(--color-text-primary)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧘</div>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '24px', marginBottom: '10px' }}>Breathe in, breathe out...</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>Something unexpected happened. We've notified our team.</p>
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                        <button 
                            onClick={() => window.location.href = '/'}
                            style={{ padding: '12px 24px', borderRadius: '25px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Return Home
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            style={{ padding: '12px 24px', borderRadius: '25px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text-primary)', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Try Again
                        </button>
                    </div>

                    <details style={{ textAlign: 'left', whiteSpace: 'pre-wrap', padding: '15px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', opacity: 0.7, fontSize: '12px', maxWidth: '500px', margin: '0 auto' }}>
                        <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: '600' }}>Error Technical Details</summary>
                        <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                        <p><strong>Component Stack:</strong> {this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
