import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center h-full text-red-400 bg-red-900/10 border border-red-500/20 rounded-xl p-6">
                    <AlertTriangle className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">3D Engine Failed</h3>
                    <p className="text-sm text-center mb-6 max-w-xs opacity-80">
                        {this.state.error?.message || 'A critical error occurred while loading the graph.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors font-semibold"
                    >
                        <RefreshCw className="w-4 h-4" /> Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
