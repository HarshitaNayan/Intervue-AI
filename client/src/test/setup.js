import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom implements none of these — mock realistically enough that the
// real hooks (useMediaDevices, useSpeechRecognition, useSpeechSynthesis)
// exercise their actual code paths instead of short-circuiting.

class MockMediaStream {
  getTracks() { return [{ stop: vi.fn() }]; }
}

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
  },
});

class MockSpeechRecognition {
  constructor() { this.continuous = false; this.interimResults = false; this.lang = ''; }
  start() { this.onstart?.(); }
  stop() { this.onend?.(); }
}
global.window.SpeechRecognition = MockSpeechRecognition;
global.window.webkitSpeechRecognition = MockSpeechRecognition;

global.window.speechSynthesis = {
  getVoices: () => [{ name: 'Test Voice', lang: 'en-US' }],
  speak: vi.fn((utterance) => {
    utterance.onstart?.();
    // fire a boundary event then end, same shape the real API produces
    utterance.onboundary?.();
    setTimeout(() => utterance.onend?.(), 0);
  }),
  cancel: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
global.window.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; }
};

// jsdom doesn't implement HTMLMediaElement.play — video elements throw otherwise
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();
