// Catches a page that fails to load or render, so the site shows a way back
// instead of going blank.
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('[nte-team-builder] page error:', error);
  }

  componentDidUpdate(prev) {
    // Moving to another page clears the error.
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page page-error" role="alert">
        <h2 className="page__title">Something went wrong</h2>
        <p className="muted">
          This page didn’t load, often because the site was just updated. Reloading gets the newest version; your teams
          and progress are kept.
        </p>
        <p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload the page
          </button>{' '}
          <a className="btn btn--quiet" href="#builder">
            Back to Team Builder
          </a>
        </p>
      </div>
    );
  }
}
