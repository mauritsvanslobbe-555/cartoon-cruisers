'use client';

import { useState, useRef, useCallback } from 'react';
import { COLORS } from '@/lib/constants';
import { Screen, BigButton, BackButton, Icon } from '../ui';

const SLOT_COLORS = ['#FF8FB1', '#A78BFA', '#4A9EFF', '#7DD3C0'];
const SLOT_LABELS = ['Cruiser 1', 'Cruiser 2', 'Cruiser 3', 'Cruiser 4'];

interface GroupPhotoScreenProps {
  onBack: () => void;
  onDone: (photos: string[]) => void;
}

export default function GroupPhotoScreen({ onBack, onDone }: GroupPhotoScreenProps) {
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filledCount = photos.filter(Boolean).length;
  const allFilled = filledCount === 4;

  const processFile = useCallback((file: File, slotIndex: number) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Crop to square center
        const size = Math.min(img.width, img.height);
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setPhotos(prev => {
          const next = [...prev];
          next[slotIndex] = base64;
          return next;
        });
        setActiveSlot(null);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSlotTap = useCallback((index: number) => {
    setActiveSlot(index);
  }, []);

  const handleCamera = useCallback((slotIndex: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'user');
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file, slotIndex);
    };
    input.click();
  }, [processFile]);

  const handleGallery = useCallback((slotIndex: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file, slotIndex);
    };
    input.click();
  }, [processFile]);

  const handleRemove = useCallback((index: number) => {
    setPhotos(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setActiveSlot(null);
  }, []);

  return (
    <Screen bg={COLORS.cream}>
      <BackButton onClick={onBack} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ marginTop: 60 }}>
        <div style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 500,
          fontSize: 13, color: COLORS.blueDark,
          letterSpacing: 1.4, textTransform: 'uppercase',
        }}>Stap 3 van 4</div>
        <h2 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 28, color: COLORS.ink, margin: '4px 0 0',
          letterSpacing: -0.8, lineHeight: 1.1,
        }}>Voeg 4 cruisers toe!</h2>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontSize: 14,
          color: COLORS.inkSoft, margin: '4px 0 0',
        }}>Tik op een vakje om een foto toe te voegen</p>
      </div>

      {/* Counter */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        margin: '14px 0 10px',
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: photos[i] ? SLOT_COLORS[i] : '#E8ECF0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: photos[i] ? '#fff' : COLORS.inkSoft,
            fontFamily: '"Fredoka", system-ui', fontWeight: 600,
            transition: 'all .3s ease',
            boxShadow: photos[i] ? `0 2px 6px ${SLOT_COLORS[i]}66` : 'none',
          }}>{photos[i] ? '✓' : i + 1}</div>
        ))}
        <div style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 600,
          fontSize: 14, color: COLORS.ink, marginLeft: 4,
        }}>{filledCount}/4</div>
      </div>

      {/* 2x2 Grid */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 12,
        padding: '4px 0',
      }}>
        {[0, 1, 2, 3].map(i => {
          const hasPhoto = !!photos[i];
          const isActive = activeSlot === i;
          return (
            <div key={i} style={{ position: 'relative' }}>
              <button
                onClick={() => hasPhoto && !isActive ? handleSlotTap(i) : !hasPhoto ? handleSlotTap(i) : undefined}
                style={{
                  width: '100%', height: '100%',
                  border: `3px dashed ${hasPhoto ? SLOT_COLORS[i] : '#D0D5DD'}`,
                  borderStyle: hasPhoto ? 'solid' : 'dashed',
                  borderRadius: 24,
                  background: hasPhoto ? '#000' : `linear-gradient(160deg, #fff 0%, ${SLOT_COLORS[i]}15 100%)`,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: 12,
                  position: 'relative', overflow: 'hidden',
                  transition: 'all .3s ease',
                  boxShadow: isActive
                    ? `0 0 0 3px ${SLOT_COLORS[i]}, 0 8px 20px rgba(31,37,64,0.15)`
                    : hasPhoto
                      ? `0 4px 0 rgba(31,37,64,0.06), 0 8px 16px rgba(31,37,64,0.1)`
                      : '0 2px 0 rgba(31,37,64,0.04)',
                }}
              >
                {hasPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photos[i]!}
                    alt={`Foto ${i + 1}`}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', borderRadius: 21,
                    }}
                  />
                ) : (
                  <>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: `${SLOT_COLORS[i]}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                    }}>😊</div>
                    <div style={{
                      fontFamily: '"Fredoka", system-ui', fontWeight: 600,
                      fontSize: 14, color: COLORS.ink,
                    }}>{SLOT_LABELS[i]}</div>
                    <div style={{
                      fontFamily: '"Fredoka", system-ui', fontSize: 11,
                      color: COLORS.inkSoft,
                    }}>Tik om toe te voegen</div>
                  </>
                )}

                {/* Color badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  width: 24, height: 24, borderRadius: '50%',
                  background: SLOT_COLORS[i], color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Fredoka", system-ui', fontWeight: 700, fontSize: 12,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  zIndex: 2,
                }}>{i + 1}</div>
              </button>

              {/* Action popup for this slot */}
              {isActive && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 3,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: 24,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: 12,
                  animation: 'fadeUp .25s ease both',
                }}>
                  <button onClick={() => handleCamera(i)} style={{
                    border: 'none', cursor: 'pointer',
                    background: '#fff', borderRadius: 16,
                    padding: '10px 16px', width: '100%',
                    fontFamily: '"Fredoka", system-ui', fontWeight: 600,
                    fontSize: 14, color: COLORS.ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Icon name="camera" size={18} strokeWidth={2.4} /> Foto maken
                  </button>
                  <button onClick={() => handleGallery(i)} style={{
                    border: 'none', cursor: 'pointer',
                    background: '#fff', borderRadius: 16,
                    padding: '10px 16px', width: '100%',
                    fontFamily: '"Fredoka", system-ui', fontWeight: 600,
                    fontSize: 14, color: COLORS.ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Icon name="image" size={18} strokeWidth={2.4} /> Uit galerij
                  </button>
                  {hasPhoto && (
                    <button onClick={() => handleRemove(i)} style={{
                      border: 'none', cursor: 'pointer',
                      background: '#FF6B6B', color: '#fff', borderRadius: 16,
                      padding: '10px 16px', width: '100%',
                      fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      Verwijderen
                    </button>
                  )}
                  <button onClick={() => setActiveSlot(null)} style={{
                    border: 'none', cursor: 'pointer',
                    background: 'transparent', color: '#fff',
                    fontFamily: '"Fredoka", system-ui', fontWeight: 500, fontSize: 13,
                    padding: '6px 12px',
                  }}>Annuleer</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ paddingTop: 10 }}>
        <BigButton
          onClick={() => allFilled && onDone(photos.filter(Boolean) as string[])}
          color={allFilled ? COLORS.mint : '#D8E1E0'}
          shadow={allFilled ? COLORS.mintDark : '#B7C2C1'}
          textColor={allFilled ? '#fff' : '#8C9594'}
          disabled={!allFilled}
        >
          {allFilled ? (
            <>Groepsfoto maken! 🎉</>
          ) : (
            <>Nog {4 - filledCount} foto{4 - filledCount !== 1 ? "'s" : ''} nodig</>
          )}
        </BigButton>
      </div>
    </Screen>
  );
}
