import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Crashed:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 bg-bg0 text-text0">
          <p className="font-semibold text-lg">Something broke on this screen.</p>
          <p className="text-text2 text-sm max-w-md">{String(this.state.error.message || this.state.error)}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="mt-2 px-5 py-2.5 rounded-s bg-text0 text-bg0 text-sm font-semibold"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
