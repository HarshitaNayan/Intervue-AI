import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Requests camera + microphone access and exposes a live MediaStream.
 * status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
 */
export function useMediaDevices() {
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const streamRef = useRef(null);

  const request = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      setErrorMessage('This browser does not support camera/microphone access.');
      return;
    }
    setStatus('requesting');
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;
      setStatus('granted');
    } catch (err) {
      setStatus('denied');
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera/mic access was denied. Please allow access in your browser settings and try again.'
          : err.name === 'NotFoundError'
          ? 'No camera or microphone was found on this device.'
          : `Could not access camera/mic: ${err.message}`
      );
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // stop tracks on unmount so the browser's rec indicator clears
  useEffect(() => () => stop(), [stop]);

  return { status, errorMessage, stream: streamRef.current, request, stop };
}
