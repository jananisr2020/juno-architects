import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean; incidentId: string };

/** Privacy-first boundary: report a generic incident ID, never send the exception or project inputs anywhere. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, incidentId: '' };

  static getDerivedStateFromError(): State {
    return { failed: true, incidentId: `JA-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}` };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Intentionally no remote telemetry and no console dump of project/user data.
  }

  render() {
    if (this.state.failed) {
      const report = {
        product: 'Juno Architects',
        incidentId: this.state.incidentId,
        occurredAt: new Date().toISOString(),
        appVersion: '0.1.0',
        category: 'client-render-error',
        personalDataIncluded: false,
        note: 'This report contains no stack trace, account data, address, budget, project payload or browser storage.',
      };
      return <main className="error-screen" role="alert">
        <div className="error-screen-card">
          <p className="eyebrow">JUNO ARCHITECTS · RECOVERY</p>
          <h1>We couldn't display this view.</h1>
          <p>Your project details have not been sent to a monitoring service. Reload the page to try again. If the issue repeats, share the privacy-safe incident report with support.</p>
          <button className="primary-button" onClick={() => window.location.reload()}>Reload page</button>
          <button className="secondary-button" onClick={() => {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a'); link.href = url; link.download = `juno-diagnostic-${this.state.incidentId}.json`; link.click();
            URL.revokeObjectURL(url);
          }}>Download privacy-safe diagnostic</button>
          <p className="field-hint">Incident ID: {this.state.incidentId}</p>
        </div>
      </main>;
    }
    return this.props.children;
  }
}
