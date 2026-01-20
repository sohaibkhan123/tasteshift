
import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-6 max-w-sm">
            We encountered an unexpected error in the kitchen.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-brand-orange text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition"
            >
              Return Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg text-left text-xs font-mono overflow-auto max-w-xl w-full">
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return (this.props as any).children;
  }
}

export default ErrorBoundary;
