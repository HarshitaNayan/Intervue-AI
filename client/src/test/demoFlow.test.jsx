import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

describe('Watch Demo flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('plays the full scripted demo end to end and lands on a sample report', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText(/Watch Demo/i));
    expect(await screen.findByText(/WATCH DEMO/i)).toBeInTheDocument();

    // Script has multiple AI/user turns with real (mocked) TTS between them —
    // wait for it to run all the way through to the sample report.
    await waitFor(
      () => expect(screen.getByText('SAMPLE REPORT — generated from the scripted demo, not a live-scored interview.')).toBeInTheDocument(),
      { timeout: 15000 }
    );

    // real report UI, not a stub
    expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/back to start/i)).toBeInTheDocument();

    // exiting mid-flow / from report returns to landing, not a dead end
    await user.click(screen.getByText(/back to start/i));
    expect(await screen.findByText(/Practice Real Interviews/i)).toBeInTheDocument();
  }, 20000);

  it('exit demo button works mid-playback, not just at the end', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText(/Watch Demo/i));
    expect(await screen.findByText(/exit demo/i)).toBeInTheDocument();
    await user.click(screen.getByText(/exit demo/i));
    expect(await screen.findByText(/Practice Real Interviews/i)).toBeInTheDocument();
  });
});
