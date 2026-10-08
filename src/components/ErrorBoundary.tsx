import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e1a1f] text-[#d9e2e3] flex flex-col items-center justify-center p-6 text-center font-sans">
          <h2 className="text-2xl font-bold text-[#ef6a5b] mb-4">Something went wrong</h2>
          <pre className="text-xs bg-black/30 p-4 rounded-xl max-w-lg overflow-auto text-[#9fb2b6]">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.replace("/")}
            className="mt-6 px-6 py-3 rounded-full bg-[#e8a24a] text-[#0e1a1f] font-semibold hover:opacity-90 transition-opacity"
          >
            Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
