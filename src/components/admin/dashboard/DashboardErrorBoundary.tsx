import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(`Dashboard widget error [${this.props.widgetName || 'Widget'}]:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#103858]">
              Unable to load this dashboard widget.
            </h4>
            {this.props.widgetName && (
              <p className="text-xs text-slate-400">
                {this.props.widgetName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="text-xs font-semibold text-[#103858] hover:text-[#CCA02E] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry widget</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
