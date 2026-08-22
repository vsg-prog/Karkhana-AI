/**
 * Realtime Nitya — voice toggle + live state indicator (card rt-3, Phase 1).
 *
 * A reusable mic button for the god/orchestrator agent ("Nitya"). It consumes the
 * already-built `useRealtimeNitya()` voice-loop hook (a shared module-level singleton —
 * see realtime/session.ts) and exposes a single start/stop control plus a live indicator
 * of the loop's status.
 *
 * Web Speech API Fallback:
 * If no BYOK OpenAI key is present (`hasOpenAiKey === false`), the button seamlessly uses
 * native Web Speech API (`window.speechSynthesis` and `window.webkitSpeechRecognition` / `SpeechRecognition`)
 * for speech input and text-to-speech feedback.
 */
import { useEffect, useRef, useState, useCallback, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { PixelButton } from './PixelButton';
import { Icon } from './Icon';
import { useStore } from '@/store/store';
import { useRealtimeNitya, type RealtimeStatus } from '@/realtime/session';

/** Per-status presentation: button variant, short label, dot color, and (optional)
 *  animation for the live-state indicator dot. Maps hook.status → visuals. */
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
    help: 'Talk to Nitya — start the voice session'
  },
  connecting: {
    variant: 'secondary',
    label: '…',
    dot: 'var(--cth-lemon)',
    anim: 'cth-blink 700ms steps(2, end) infinite',
    help: 'Connecting to Nitya…'
  },
  listening: {
    variant: 'primary',
    label: 'listening',
    dot: 'var(--cth-mint)',
    anim: 'cth-pulse 1000ms steps(2, end) infinite',
    help: 'Listening — Nitya is hearing you (click to stop)',
    activeBg: 'var(--cth-mint)'
  },
  responding: {
    variant: 'primary',
    label: 'speaking',
    dot: 'var(--cth-sky)',
    anim: 'cth-pulse 600ms steps(2, end) infinite',
    help: 'Nitya is speaking (click to stop)',
    activeBg: 'var(--cth-sky)'
  },
  working: {
    variant: 'destructive',
    label: 'working',
    dot: 'var(--cth-coral)',
    anim: 'cth-blink 500ms steps(2, end) infinite',
    help: 'Nitya is running a tool — mic muted (click to stop)'
  }
};

export interface RealtimeNityaToggleProps {
  /** Compact form for the fullscreen header / tight rows — hides the text label. */
  compact?: boolean;
}

export function RealtimeNityaToggle({ compact = false }: RealtimeNityaToggleProps) {
  const hasOpenAiKey = useStore((s) => s.hasOpenAiKey);
  const { status: rtcStatus, error: rtcError, connect, disconnect } = useRealtimeNitya();

  // Web Speech API fallback state
  const [webSpeechStatus, setWebSpeechStatus] = useState<RealtimeStatus>('off');
  const [webSpeechError, setWebSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const [hint, setHint] = useState<{ left: number; top: number } | null>(null);
  const hintRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hintOpen = hint !== null;

  const noKey = !hasOpenAiKey;

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

  const startWebSpeech = useCallback(() => {
    setWebSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setWebSpeechError('Web Speech API not supported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

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

          if (window.speechSynthesis) {
            const replyText = `Nitya received: "${transcript}"`;
            const utterance = new SpeechSynthesisUtterance(replyText);
            utterance.lang = 'en-IN';

            const voices = window.speechSynthesis.getVoices();
            const indicVoice = voices.find(
              (v) => v.lang.startsWith('hi') || v.lang.includes('IN') || v.lang.includes('India')
            );
            if (indicVoice) utterance.voice = indicVoice;

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
  }, [stopWebSpeech, webSpeechStatus]);

  useEffect(() => {
    return () => {
      stopWebSpeech();
    };
  }, [stopWebSpeech]);

  const activeStatus = noKey ? webSpeechStatus : rtcStatus;
  const activeError = noKey ? webSpeechError : rtcError;
  const view = STATE_VIEW[activeStatus];

  const title = noKey
    ? activeError
      ? `Web Speech API Fallback error: ${activeError}`
      : 'Talk to Nitya using Web Speech API Native Fallback (Add OpenAI key in Settings for Realtime Voice)'
    : activeError
      ? `${view.help} — ${activeError}`
      : view.help;

  const onClick = () => {
    if (noKey) {
      if (webSpeechStatus === 'off') {
        startWebSpeech();
      } else {
        stopWebSpeech();
      }
    } else {
      if (rtcStatus === 'off') void connect();
      else void disconnect();
    }
  };

  const openKeySettings = (e: MouseEvent): void => {
    e.stopPropagation();
    setHint(null);
    window.dispatchEvent(
      new CustomEvent('cth:open-settings', { detail: { section: 'Voice' } })
    );
  };

  const HINT_W = 210;
  const HINT_GAP = 8;

  const toggleHint = (e: MouseEvent): void => {
    e.stopPropagation();
    if (hint) { setHint(null); return; }
    const r = iconRef.current?.getBoundingClientRect();
    if (!r) return;
    const estH = 78;
    const above = r.top - HINT_GAP - estH;
    const top = above >= 8 ? above : Math.min(r.bottom + HINT_GAP, window.innerHeight - estH - 8);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - HINT_W - 8));
    setHint({ left, top: Math.max(8, top) });
  };

  useEffect(() => {
    if (!hintOpen) return;
    const onDown = (ev: globalThis.MouseEvent): void => {
      const t = ev.target as Node;
      if (hintRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setHint(null);
    };
    const onKey = (ev: KeyboardEvent): void => { if (ev.key === 'Escape') setHint(null); };
    const onReflow = (): void => setHint(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [hintOpen]);

  return (
    <span
      title={title}
      className="cth-titlebar-nodrag"
      style={{ display: 'inline-flex', gap: 6, alignItems: 'center', minWidth: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <PixelButton
        variant={view.variant}
        size="sm"
        onClick={onClick}
        disabled={false}
        style={view.activeBg ? { background: view.activeBg, color: 'var(--cth-ink-900)' } : undefined}
      >
        <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              flexShrink: 0,
              background: view.dot,
              boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)',
              animation: view.anim
            }}
          />
          <Icon name="mic" />
          {!compact && (
            <span style={{ fontFamily: 'var(--cth-font-ui)' }}>
              {view.label}
            </span>
          )}
        </span>
      </PixelButton>

      {noKey && (
        <span ref={hintRef} style={{ display: 'inline-flex', flexShrink: 0 }}>
          <button
            ref={iconRef}
            type="button"
            aria-label="Web Speech API Fallback active. Click to configure OpenAI Key."
            aria-expanded={hintOpen}
            onClick={toggleHint}
            style={{
              border: 'none', background: 'none', padding: 0, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center',
              opacity: hintOpen ? 1 : 0.75
            }}
          >
            <Icon name="info" />
          </button>

          {hint && createPortal(
            <div
              ref={panelRef}
              role="dialog"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                left: hint.left,
                top: hint.top,
                zIndex: 460,
                width: HINT_W,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                boxSizing: 'border-box',
                background: 'var(--cth-cream-100)',
                boxShadow: 'inset 0 0 0 1.5px var(--cth-ink-500), 4px 4px 0 rgba(26,19,32,0.25)',
                fontFamily: 'var(--cth-font-ui)',
                fontSize: 11,
                lineHeight: '15px',
                color: 'var(--cth-ink-900)',
                textAlign: 'left',
                whiteSpace: 'normal'
              }}
            >
              <span>Using <strong>Web Speech API Fallback</strong>. Configure an <strong>OpenAI API Key</strong> for full WebRTC Realtime voice.</span>
              <button
                type="button"
                onClick={openKeySettings}
                style={{
                  border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--cth-font-ui)', fontSize: 11, lineHeight: '15px',
                  color: 'var(--cth-ink-900)', textDecoration: 'underline'
                }}
              >
                set OpenAI key
              </button>
            </div>,
            document.body
          )}
        </span>
      )}
    </span>
  );
}
