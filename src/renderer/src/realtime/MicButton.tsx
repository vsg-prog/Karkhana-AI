/**
 * MicButton — Realtime Voice Mic Button with native Web Speech API fallback.
 *
 * Primary mode: OpenAI WebRTC Realtime Session (via `useRealtimeNitya()`) when OpenAI API key is configured.
 * Fallback mode: Native Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition` and `window.speechSynthesis`)
 * when no OpenAI key is set, enabling seamless voice input/output on English and Indic languages.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { PixelButton } from '../components/PixelButton';
import { Icon } from '../components/Icon';
import { useStore } from '@/store/store';
import { getLocalizedCharacterName } from '../scene/office/cast';
import { useRealtimeNitya, type RealtimeStatus } from './session';

export interface MicButtonProps {
  compact?: boolean;
  className?: string;
  onTranscript?: (text: string) => void;
}

const STATE_VIEW: Record<
  RealtimeStatus,
  {
    variant: 'primary' | 'secondary' | 'destructive';
    label: string;
    dot: string;
    anim?: string;
    help: string;
    activeBg?: string;
  }
> = {
  off: {
    variant: 'secondary',
    label: 'talk',
    dot: 'var(--cth-ink-300)',
    help: 'Talk to Nitya — start voice session'
  },
  connecting: {
    variant: 'secondary',
    label: '…',
    dot: 'var(--cth-lemon)',
    anim: 'cth-blink 700ms steps(2, end) infinite',
    help: 'Connecting voice…'
  },
  listening: {
    variant: 'primary',
    label: 'listening',
    dot: 'var(--cth-mint)',
    anim: 'cth-pulse 1000ms steps(2, end) infinite',
    help: 'Listening — speak now (click to stop)',
    activeBg: 'var(--cth-mint)'
  },
  responding: {
    variant: 'primary',
    label: 'speaking',
    dot: 'var(--cth-sky)',
    anim: 'cth-pulse 600ms steps(2, end) infinite',
    help: 'Nitya speaking (click to stop)',
    activeBg: 'var(--cth-sky)'
  },
  working: {
    variant: 'destructive',
    label: 'working',
    dot: 'var(--cth-coral)',
    anim: 'cth-blink 500ms steps(2, end) infinite',
    help: 'Processing voice request (click to stop)'
  }
};

export function MicButton({ compact = false, className = '', onTranscript }: MicButtonProps) {
  const hasOpenAiKey = useStore((s) => s.hasOpenAiKey);
  const { status: rtcStatus, error: rtcError, connect: rtcConnect, disconnect: rtcDisconnect } = useRealtimeNitya();

  // Web Speech API fallback state
  const [webSpeechStatus, setWebSpeechStatus] = useState<RealtimeStatus>('off');
  const [webSpeechError, setWebSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const stopWebSpeech = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setWebSpeechStatus('off');
  }, []);

  const selectedLanguage = useStore((s) => s.selectedLanguage) || 'English (EN)';

  const getSpeechLang = useCallback((langStr: string) => {
    const l = langStr.toLowerCase();
    if (l.includes('hindi') || l.includes('हिंदी') || l === 'hi') return 'hi-IN';
    if (l.includes('tamil') || l.includes('தமிழ்') || l === 'ta') return 'ta-IN';
    if (l.includes('telugu') || l.includes('తెలుగు') || l === 'te') return 'te-IN';
    if (l.includes('bengali') || l.includes('বাংলা') || l === 'bn') return 'bn-IN';
    if (l.includes('assamese') || l.includes('অसमীয়া') || l === 'as') return 'as-IN';
    return 'en-IN';
  }, []);

  const startWebSpeech = useCallback(() => {
    setWebSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setWebSpeechError('Web Speech API not supported in this browser environment');
      return;
    }

    try {
      const targetLang = getSpeechLang(selectedLanguage);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = targetLang;

      recognition.onstart = () => {
        setWebSpeechStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (event.results[0]?.isFinal) {
          setWebSpeechStatus('responding');
          if (onTranscript) onTranscript(transcript);

          // Speak back acknowledgment using native Web Speech Synthesis fallback
          if (window.speechSynthesis) {
            const nityaLocalized = getLocalizedCharacterName('nitya', selectedLanguage);
            const replyText = `${nityaLocalized}: "${transcript}"`;
            const utterance = new SpeechSynthesisUtterance(replyText);
            utterance.lang = targetLang;

            const voices = window.speechSynthesis.getVoices();
            const prefix = targetLang.split('-')[0];
            const matchingVoice = voices.find(
              (v) => v.lang.startsWith(prefix) || v.lang.includes('IN') || v.lang.includes('India')
            );
            if (matchingVoice) utterance.voice = matchingVoice;

            utterance.onend = () => {
              setWebSpeechStatus('off');
            };
            utterance.onerror = () => {
              setWebSpeechStatus('off');
            };
            window.speechSynthesis.speak(utterance);
          } else {
            setWebSpeechStatus('off');
          }
        }
      };

      recognition.onerror = (err: any) => {
        setWebSpeechError(err.error || 'Speech recognition error');
        stopWebSpeech();
      };

      recognition.onend = () => {
        if (webSpeechStatus === 'listening') {
          setWebSpeechStatus('off');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setWebSpeechError(e?.message || 'Failed to start Web Speech');
      stopWebSpeech();
    }
  }, [onTranscript, stopWebSpeech, webSpeechStatus]);

  useEffect(() => {
    return () => {
      stopWebSpeech();
    };
  }, [stopWebSpeech]);

  // Determine active mode & status
  const useFallback = !hasOpenAiKey;
  const currentStatus = useFallback ? webSpeechStatus : rtcStatus;
  const currentError = useFallback ? webSpeechError : rtcError;

  const view = STATE_VIEW[currentStatus];

  const handleClick = () => {
    if (useFallback) {
      if (webSpeechStatus === 'off') {
        startWebSpeech();
      } else {
        stopWebSpeech();
      }
    } else {
      if (rtcStatus === 'off') {
        void rtcConnect();
      } else {
        void rtcDisconnect();
      }
    }
  };

  const title = currentError
    ? `${view.help} — (${currentError})`
    : useFallback
    ? `${view.help} (Web Speech API Native Fallback)`
    : view.help;

  return (
    <PixelButton
      variant={view.variant}
      size="sm"
      onClick={handleClick}
      title={title}
      style={view.activeBg ? { backgroundColor: view.activeBg } : undefined}
    >
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{
            backgroundColor: view.dot,
            animation: view.anim
          }}
        />
        <Icon name="mic" />
        {!compact && <span>{view.label}</span>}
      </span>
    </PixelButton>
  );
}
