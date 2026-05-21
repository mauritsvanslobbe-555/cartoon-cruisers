'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS } from '@/lib/constants';
import { Screen, BigButton, BackButton, Icon } from '../ui';

interface PhotoScreenProps {
  onBack: () => void;
  onCapture: (photoBase64: string) => void;
}

export default function PhotoScreen({ onBack, onCapture }: PhotoScreenProps) {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('NotAllowed') || msg.includes('Permission') || msg.includes('denied')) {
        setCameraError('Camera-toegang geweigerd. Geef toestemming in je browserinstellingen.');
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setCameraError('Geen camera gevonden. Probeer een foto uit je galerij.');
      } else {
        setCameraError('Camera niet beschikbaar. Probeer een foto uit je galerij.');
      }
    }
  }, []);

  // Connect stream to video element once both are available
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraActive || !video || !stream) return;

    video.srcObject = stream;

    const handlePlaying = () => setCameraReady(true);
    video.addEventListener('playing', handlePlaying);

    // iOS Safari needs play() called after srcObject is set
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Retry once after a short delay (iOS sometimes needs this)
        setTimeout(() => {
          video.play().catch(() => {
            setCameraError('Camera kon niet starten. Probeer een foto uit je galerij.');
          });
        }, 100);
      });
    }

    return () => {
      video.removeEventListener('playing', handlePlaying);
    };
  }, [cameraActive]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    if (size === 0) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    // Mirror horizontally for selfie
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setHasPhoto(true);
    setTimeout(() => onCapture(base64), 650);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'user'); // iOS: open front camera directly
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setHasPhoto(true);
        setTimeout(() => onCapture(base64), 650);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setHasPhoto(true);
        setTimeout(() => onCapture(base64), 650);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const cornerPositions = [
    { top: 18, left: 18, borderTop: `3px solid ${COLORS.blue}`, borderLeft: `3px solid ${COLORS.blue}` },
    { top: 18, right: 18, borderTop: `3px solid ${COLORS.blue}`, borderRight: `3px solid ${COLORS.blue}` },
    { bottom: 18, left: 18, borderBottom: `3px solid ${COLORS.blue}`, borderLeft: `3px solid ${COLORS.blue}` },
    { bottom: 18, right: 18, borderBottom: `3px solid ${COLORS.blue}`, borderRight: `3px solid ${COLORS.blue}` },
  ];

  return (
    <Screen bg={COLORS.cream}>
      <BackButton onClick={() => { stopCamera(); onBack(); }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ marginTop: 60 }}>
        <div style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 500,
          fontSize: 13, color: COLORS.blueDark,
          letterSpacing: 1.4, textTransform: 'uppercase',
        }}>Stap 2 van 3</div>
        <h2 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 30, color: COLORS.ink, margin: '4px 0 0',
          letterSpacing: -0.8, lineHeight: 1.1,
        }}>Maak een foto<br />van jezelf!</h2>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          width: 260, height: 260, borderRadius: '50%',
          border: `4px dashed ${hasPhoto ? COLORS.mint : COLORS.blue}55`,
          padding: 8, position: 'relative',
          animation: hasPhoto || cameraActive ? 'none' : 'rotateSlow 30s linear infinite',
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: hasPhoto
              ? `linear-gradient(160deg, ${COLORS.mint} 0%, ${COLORS.blue} 100%)`
              : (cameraActive && !cameraReady) ? '#000' : !cameraActive ? `linear-gradient(160deg, #fff 0%, #EAF6FF 100%)` : 'transparent',
            boxShadow: 'inset 0 6px 24px rgba(31,37,64,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .4s ease',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Video element — always mounted so iOS can use it */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                width: '100%', height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                borderRadius: '50%',
                display: cameraActive && !hasPhoto ? 'block' : 'none',
              }}
            />
            {hasPhoto ? (
              <div style={{ fontSize: 96, animation: 'pop .35s ease' }}>😄</div>
            ) : !cameraActive ? (
              <>
                <div style={{ fontSize: 86, opacity: 0.9 }}>😊</div>
                {cornerPositions.map((pos, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: 24, height: 24, borderRadius: 6,
                    ...pos,
                  } as React.CSSProperties} />
                ))}
              </>
            ) : null}
          </div>
        </div>

        {!hasPhoto && !cameraActive && (
          <div style={{
            position: 'absolute', top: 10, right: 8,
            background: COLORS.yellow, color: COLORS.ink,
            padding: '10px 14px', borderRadius: 18,
            fontFamily: '"Fredoka", system-ui', fontWeight: 500, fontSize: 13,
            boxShadow: '0 4px 0 rgba(31,37,64,0.08)',
            transform: 'rotate(4deg)',
            animation: 'wiggle 3s ease-in-out infinite',
            maxWidth: 150,
          }}>
            Tip: zorg dat je gezicht goed zichtbaar is! ✨
          </div>
        )}

        {cameraError && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#FFF0F0', color: '#CC3333',
            padding: '10px 14px', borderRadius: 16,
            fontFamily: '"Fredoka", system-ui', fontSize: 13,
            textAlign: 'center', lineHeight: 1.3,
          }}>
            {cameraError}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cameraActive ? (
          <BigButton onClick={capturePhoto}>
            <Icon name="camera" size={24} strokeWidth={2.4} /> Maak foto!
          </BigButton>
        ) : (
          <BigButton onClick={startCamera}>
            <Icon name="camera" size={24} strokeWidth={2.4} /> Foto maken
          </BigButton>
        )}
        {cameraActive ? (
          <BigButton onClick={handleGallerySelect} color="#fff" textColor={COLORS.ink} shadow="#E2E7EA"
            style={{ border: `2px solid ${COLORS.ink}10` }}>
            <Icon name="image" size={22} strokeWidth={2.4} color={COLORS.blue} /> Kies uit galerij
          </BigButton>
        ) : (
          <BigButton onClick={handleFileSelect} color="#fff" textColor={COLORS.ink} shadow="#E2E7EA"
            style={{ border: `2px solid ${COLORS.ink}10` }}>
            <Icon name="image" size={22} strokeWidth={2.4} color={COLORS.blue} /> Kies uit galerij
          </BigButton>
        )}
      </div>
    </Screen>
  );
}
