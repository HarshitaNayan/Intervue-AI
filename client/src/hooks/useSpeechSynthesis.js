import { useCallback, useEffect, useRef, useState } from 'react';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

/**
 * Wraps SpeechSynthesis. speak(text, onDone) resolves onDone when
 * playback actually finishes (or on error), not on a fixed timer.
 *
 * Also exposes `mouthLevel` (0-1), driven by the utterance's real
 * `boundary` events (fired at each spoken word/sentence boundary by the
 * browser's TTS engine) rather than a random flicker — this is what the
 * avatar's mouth animation is keyed to, so it's timed to actual speech,
 * not decorative.
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [mouthLevel, setMouthLevel] = useState(0);
  const isSupported = !!synth;
  const decayTimeout = useRef(null);

  useEffect(() => {
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, []);

  const pickVoice = useCallback(() => {
    return (
      voices.find((v) => /en-US/.test(v.lang) && /Google|Natural|Neural/i.test(v.name)) ||
      voices.find((v) => /en-US/.test(v.lang)) ||
      voices.find((v) => /^en/.test(v.lang)) ||
      voices[0]
    );
  }, [voices]);

  const speak = useCallback((text, onDone) => {
    if (!synth) { onDone?.(); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.pitch = 1;
    const v = pickVoice();
    if (v) utter.voice = v;

    let gotBoundary = false;
    let fallbackStartTimer = null;
    let fallbackInterval = null;
    let settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      cleanupMouth();
      clearTimeout(safetyTimer);
      setIsSpeaking(false);
      setMouthLevel(0);
      onDone?.();
    }

    utter.onstart = () => {
      setIsSpeaking(true);
      // Fallback: Chrome and several voices never fire `boundary` events
      // at all, which would leave the mouth static for the whole
      // utterance. If none arrives shortly after speech starts, drive a
      // lightweight synthetic flap instead so the lips always move.
      fallbackStartTimer = setTimeout(() => {
        if (gotBoundary) return;
        fallbackInterval = setInterval(() => {
          setMouthLevel(0.2 + Math.random() * 0.6);
        }, 90 + Math.random() * 60);
      }, 300);
    };

    // Real speech-timing signal: bump mouth openness on each word
    // boundary the browser reports, then let it decay until the next
    // one. Falls back gracefully — some voices/browsers don't fire
    // boundary events at all, in which case mouthLevel just stays flat
    // and the avatar shows a gentler idle-while-speaking motion instead.
    utter.onboundary = () => {
      gotBoundary = true;
      if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; }
      setMouthLevel(0.55 + Math.random() * 0.45);
      clearTimeout(decayTimeout.current);
      decayTimeout.current = setTimeout(() => setMouthLevel(0.15), 140);
    };

    function cleanupMouth() {
      clearTimeout(fallbackStartTimer);
      clearInterval(fallbackInterval);
    }

    utter.onend = settle;
    utter.onerror = settle;

    // Chrome has a known, long-standing bug where `onend` (and every
    // other event) can simply never fire for an utterance — the audio
    // plays once and the whole app is then stuck waiting forever for a
    // signal that never comes. This is exactly what froze the demo and
    // the interview after the first line. A hard timeout, sized to the
    // text length with generous padding, guarantees forward progress
    // either way.
    const estimatedMs = Math.max(2500, text.length * 90);
    const safetyTimer = setTimeout(settle, estimatedMs);

    function fire() {
      // Chrome can get stuck with the engine internally "paused" (e.g.
      // after the tab lost focus) — speak() then silently queues the
      // utterance forever without ever playing it, no error thrown.
      if (synth.paused) synth.resume();
      synth.speak(utter);
    }

    if (synth.speaking || synth.pending) {
      // Calling speak() immediately after cancel() is a known Chrome
      // race that can silently drop the new utterance entirely. A short
      // delay after cancel avoids it.
      synth.cancel();
      setTimeout(fire, 60);
    } else {
      fire();
    }
  }, [pickVoice]);

  const cancel = useCallback(() => {
    synth?.cancel();
    setIsSpeaking(false);
    setMouthLevel(0);
  }, []);

  useEffect(() => () => { synth?.cancel(); clearTimeout(decayTimeout.current); }, []);

  return { speak, cancel, isSpeaking, isSupported, mouthLevel };
}
