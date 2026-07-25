import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';
import { matchConceptKey } from '../teachingVisuals/matchConcept.js';
import { CONCEPTS } from '../teachingVisuals/config.js';

describe('Resume upload flow', () => {
  it('uploads a resume, shows the parsing state, then reaches permissions with the summary attached', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/resume')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ resumeSummary: 'Skills: React, Node.js.' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<App />);
    await user.click(screen.getAllByText(/Start Interview/i)[0]);
    await user.type(screen.getByPlaceholderText(/e.g. Harshita/i), 'Test Candidate');

    const file = new File(['dummy pdf content'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]');
    await user.upload(fileInput, file);
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();

    await user.click(screen.getByText(/Continue to camera/i));

    // parsing state shows, then resolves to permissions
    await waitFor(() => expect(screen.getByText(/Camera & microphone check/i)).toBeInTheDocument());
    expect(screen.queryByText(/Couldn't read your resume/i)).not.toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/interview/resume', expect.objectContaining({ method: 'POST' }));
  });

  it('rejects an unsupported file type client-side before ever hitting the network', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<App />);
    await user.click(screen.getAllByText(/Start Interview/i)[0]);
    await user.type(screen.getByPlaceholderText(/e.g. Harshita/i), 'Test');

    const badFile = new File(['x'], 'resume.exe', { type: 'application/octet-stream' });
    const fileInput = document.querySelector('input[type="file"]');
    // real browsers filter the file picker by `accept`, so this path is
    // normally unreachable via click-to-browse — but it IS reachable via
    // drag-and-drop, which isn't filtered, so the app's own validation
    // still needs to catch it. applyAccept:false bypasses the picker-level
    // filtering to test that validation directly.
    await userEvent.upload(fileInput, badFile, { applyAccept: false });

    expect(await screen.findByText(/Please upload a PDF, DOC\/DOCX, or TXT file/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('continues the interview flow (doesn\'t block) if resume parsing fails server-side', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'No extractable text found' }) }));
    render(<App />);
    await user.click(screen.getAllByText(/Start Interview/i)[0]);
    await user.type(screen.getByPlaceholderText(/e.g. Harshita/i), 'Test');
    const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
    await user.upload(document.querySelector('input[type="file"]'), file);
    await user.click(screen.getByText(/Continue to camera/i));

    expect(await screen.findByText(/Couldn't read your resume/i)).toBeInTheDocument();
    // still lands on permissions, not stuck
    expect(screen.getByText(/Camera & microphone check/i)).toBeInTheDocument();
  });
});

describe('Teaching visual concept matching', () => {
  it('matches exact and aliased concept strings for every built visual', () => {
    for (const key of Object.keys(CONCEPTS)) {
      expect(matchConceptKey(key)).toBe(key);
    }
  });

  it('falls back to null (text-only) for an unrecognized concept, not a crash or wrong diagram', () => {
    expect(matchConceptKey('quantum_entanglement')).toBeNull();
    expect(matchConceptKey('')).toBeNull();
    expect(matchConceptKey(undefined)).toBeNull();
  });
});
