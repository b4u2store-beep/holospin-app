import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black text-white">
          <h2 className="text-xl font-bold mb-4">Something went wrong.</h2>
          <button
            className="px-4 py-2 bg-[#00b4d8] rounded-xl text-white font-bold uppercase text-xs"
            onClick={() => window.location.reload()}
          >
            Reload App
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
