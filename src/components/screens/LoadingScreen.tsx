'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS, LOADING_STEPS, SceneId } from '@/lib/constants';
import { Screen, BigButton, BlobDeco } from '../ui';

interface LoadingScreenProps {
  photo: string;
  photos?: string[];
  mode?: 'solo' | 'group';
  scene: SceneId;
  onDone: (resultImage: string) => void;
  onError: (error: string) => void;
}

export default function LoadingScreen({ photo, photos, mode = 'solo', scene, onDone, onError }: LoadingScreenProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const apiDone = useRef(false);
  const resultRef = useRef<string | null>(null);

  const startTransform = useCallback(async () => {
    setFailed(false);
    apiDone.current = false;
    resultRef.current = null;
    setProgress(0);
    setStep(0);

    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'group'
            ? { photos, scene, mode: 'group' }
            : { photo, scene, mode: 'solo' }
        ),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Generatie mislukt');
      }
      resultRef.current = data.image;
      apiDone.current = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Er ging iets mis';
      setFailed(true);
      onError(msg);
    }
  }, [photo, photos, mode, scene, onError]);

  useEffect(() => {
    startTransform();
  }, [startTransform]);

  useEffect(() => {
    const start = performance.now();
    const slowPhase = 15000;
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;

      if (apiDone.current && resultRef.current) {
        setProgress(1);
        setStep(LOADING_STEPS.length - 1);
        setTimeout(() => onDone(resultRef.current!), 400);
        return;
      }

      if (failed) return;

      const t = Math.min(0.88, elapsed / slowPhase);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 0.88);

      const s = Math.min(LOADING_STEPS.length - 1, Math.floor(eased * LOADING_STEPS.length));
      setStep(s);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone, failed]);

  return (
    <Screen bg={COLORS.paper}>
      <BlobDeco />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 36 }}>
          {['🎨', '✨', '🛵'].map((e, i) => (
            <div key={i} style={{
              fontSize: 56,
              animation: failed ? 'none' : `bounce 1s ease-in-out ${i * 0.15}s infinite`,
              filter: 'drop-shadow(0 6px 8px rgba(31,37,64,0.15))',
              opacity: failed ? 0.4 : 1,
              transition: 'opacity .3s ease',
            }}>{e}</div>
          ))}
        </div>

        <div style={{ height: 70, position: 'relative', width: '100%', textAlign: 'center' }}>
          {failed ? (
            <div style={{
              fontFamily: '"Fredoka", system-ui', fontWeight: 600,
              fontSize: 20, color: '#CC3333', letterSpacing: -0.4,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>😥</div>
              Oeps, dat ging mis...
            </div>
          ) : (
            LOADING_STEPS.map((s, i) => (
              <div key={i} style={{
                position: 'absolute', inset: 0,
                opacity: step === i ? 1 : 0,
                transform: `translateY(${step === i ? 0 : 8}px)`,
                transition: 'opacity .4s ease, transform .4s ease',
                fontFamily: '"Fredoka", system-ui', fontWeight: 600,
                fontSize: 22, color: COLORS.ink, letterSpacing: -0.4,
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.e}</div>
                {s.t}
              </div>
            ))
          )}
        </div>

        <div style={{
          width: 260, height: 16, borderRadius: 999,
          background: '#fff', boxShadow: 'inset 0 2px 4px rgba(31,37,64,0.08)',
          overflow: 'hidden', marginTop: 28,
        }}>
          <div style={{
            width: `${progress * 100}%`, height: '100%',
            background: failed
              ? '#E0A0A0'
              : `linear-gradient(90deg, ${COLORS.mint}, ${COLORS.blue})`,
            borderRadius: 999,
            transition: 'width .3s linear',
            position: 'relative',
            boxShadow: failed ? 'none' : `0 0 12px ${COLORS.mint}88`,
          }}>
            {!failed && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                animation: 'shimmer 1.2s linear infinite',
              }} />
            )}
          </div>
        </div>
        <div style={{
          marginTop: 14, fontFamily: '"Fredoka", system-ui',
          fontSize: 14, color: failed ? '#CC3333' : COLORS.inkSoft, fontWeight: 500,
        }}>{failed ? 'Mislukt' : `${Math.round(progress * 100)}%`}</div>

        {failed && (
          <div style={{ marginTop: 24, width: '100%', maxWidth: 260 }}>
            <BigButton onClick={() => { setFailed(false); startTransform(); }}>
              🔄 Probeer opnieuw
            </BigButton>
          </div>
        )}
      </div>
    </Screen>
  );
}
