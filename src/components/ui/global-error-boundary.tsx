import React, { Component, ReactNode } from 'react';
import Error500 from '@/pages/Error500';
import { captureError } from '@/utils/errorReporting';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }

  render() {
    if (this.state.hasError) {
      return <Error500 error={this.state.error} />;
    }

    return this.props.children;
  }
}

export const GlobalErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundaryClass>
      {children}
    </ErrorBoundaryClass>
  );
};