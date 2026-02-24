import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You could also log the error to an error reporting service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-rose-500" size={40} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                            We encountered an unexpected error while rendering this page.
                            Don't worry, your data is safe.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                            >
                                <RefreshCw size={18} /> Refresh Application
                            </button>

                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full py-3.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-[0.98]"
                            >
                                Try Again
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 p-4 bg-black/40 rounded-xl text-left overflow-auto max-h-40 border border-slate-800/50">
                                <p className="text-[10px] font-mono text-rose-400 uppercase tracking-widest mb-2 font-bold">Error Details</p>
                                <pre className="text-xs text-slate-500 font-mono">
                                    {this.state.error.toString()}
                                </pre>
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
