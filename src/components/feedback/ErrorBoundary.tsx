import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/app.config';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global application Error Boundary preventing white-screen crashes in clinical environments.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[${appConfig.app.name}] Uncaught UI Error:`, error, errorInfo);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-lg p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-900">
                Une erreur inattendue est survenue
              </h1>
              <p className="text-xs text-slate-500">
                Vos données enregistrées sont préservées. Vous pouvez recharger l&apos;interface en toute sécurité.
              </p>
            </div>
            {this.state.error?.message && (
              <pre className="text-[11px] bg-slate-100 text-slate-700 p-3 rounded-lg overflow-x-auto text-left">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReload} className="w-full">
              <RefreshCw className="w-4 h-4 me-2" />
              Recharger l&apos;application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
