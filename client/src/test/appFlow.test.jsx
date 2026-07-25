import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

function mockFetchSequence(responses) {
  let call = 0;
  global.fetch = vi.fn(() => {
    const r = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return Promise.resolve({
      ok: r.ok !== false,
      json: () => Promise.resolve(r.body),
    });
  });
}

describe('InterVue AI full app flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('walks from landing through setup, permissions, a full interview, to the report', async () => {
    const user = userEvent.setup();

    mockFetchSequence([
      { body: { sessionId: 'test-session-1', message: 'What is a closure?', done: false } }, // /start
      { body: { message: 'Good. Follow-up question?', teaching: '', teachingConcept: '', verdict: 'correct', done: false } }, // /answer 1
      { body: { message: 'Thanks, that wraps up the interview.', done: true, stats: { qCount: 2, topics: ['closures'], weakTopics: [], verdictCounts: { correct: 1 } } } }, // /answer 2 -> done
      { body: { report: { technicalScore: 80, communicationScore: 75, confidenceScore: 70, problemSolvingScore: 78, strengths: ['Good grasp of closures'], weaknesses: [], topicsToImprove: [], overallSummary: 'Solid performance.', fallback: false } } }, // /report
    ]);

    render(<App />);

    // Landing
    expect(screen.getByText(/Practice Real Interviews/i)).toBeInTheDocument();
    await user.click(screen.getAllByText(/Start Interview/i)[0]);

    // Setup form
    expect(await screen.findByText(/Set up your interview/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/e.g. Harshita/i), 'Test Candidate');
    await user.click(screen.getByText(/Continue to camera/i));

    // Permissions — getUserMedia is mocked to resolve
    expect(await screen.findByText(/Camera & microphone check/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Start interview/i)).not.toBeDisabled());
    await user.click(screen.getByText(/Start interview/i));

    // Interview — intro questions (local, no network)
    expect(await screen.findByText(/thanks for joining/i)).toBeInTheDocument();
    const answerBox = () => screen.getByPlaceholderText(/Speak, or type/i);
    await waitFor(() => expect(answerBox()).not.toBeDisabled());
    await user.type(answerBox(), 'I work on React apps.');
    await user.click(screen.getByText(/Send now/i));

    await waitFor(() => expect(screen.getByText(/What made you interested/i)).toBeInTheDocument());
    await waitFor(() => expect(answerBox()).not.toBeDisabled());
    await user.type(answerBox(), 'I like solving hard problems.');
    await user.click(screen.getByText(/Send now/i));

    // Now hands off to the real (mocked) Gemini-backed engine
    await waitFor(() => expect(screen.getByText(/What is a closure/i)).toBeInTheDocument());
    await waitFor(() => expect(answerBox()).not.toBeDisabled());
    await user.type(answerBox(), 'A function that remembers its scope.');
    await user.click(screen.getByText(/Send now/i));

    await waitFor(() => expect(screen.getByText(/Follow-up question/i)).toBeInTheDocument());
    await waitFor(() => expect(answerBox()).not.toBeDisabled());
    await user.type(answerBox(), 'Sure, here is my answer.');
    await user.click(screen.getByText(/Send now/i));

    // Interview complete
    await waitFor(() => expect(screen.getByText(/Interview complete/i)).toBeInTheDocument());
    await user.click(screen.getByText(/View report/i));

    // Report renders with real data from the (mocked) /report call
    await waitFor(() => expect(screen.getByText(/Interview Report/i)).toBeInTheDocument());
    expect(screen.getByText(/Good grasp of closures/i)).toBeInTheDocument();
    expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
  }, 20000);

  it('shows a real error state (not a silent failure) when the Gemini call fails', async () => {
    const user = userEvent.setup();
    mockFetchSequence([{ ok: false, body: { error: 'Gemini request failed: 403 Forbidden' } }]);

    render(<App />);
    await user.click(screen.getAllByText(/Start Interview/i)[0]);
    await user.type(screen.getByPlaceholderText(/e.g. Harshita/i), 'Test');
    await user.click(screen.getByText(/Continue to camera/i));
    await waitFor(() => expect(screen.getByText(/Start interview/i)).not.toBeDisabled());
    await user.click(screen.getByText(/Start interview/i));

    const answerBox = () => screen.getByPlaceholderText(/Speak, or type/i);
    await waitFor(() => expect(answerBox()).not.toBeDisabled());
    await user.type(answerBox(), 'answer 1');
    await user.click(screen.getByText(/Send now/i));
    await waitFor(() => expect(answerBox()).not.toBeDisabled());
    await user.type(answerBox(), 'answer 2');
    await user.click(screen.getByText(/Send now/i));

    await waitFor(() => expect(screen.getByText(/^Gemini request failed: /i)).toBeInTheDocument());
  }, 20000);
});
