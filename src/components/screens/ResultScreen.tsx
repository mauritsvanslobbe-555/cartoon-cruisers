'use client';

import { useState, useEffect } from 'react';
import { COLORS, HORNS, Scene } from '@/lib/constants';
import { playHornPattern } from '@/lib/audio';
import { BigButton, BackButton, Icon, Confetti } from '../ui';

interface ResultScreenProps {
  scene: Scene;
  ownedHorn: string | null;
  resultImage: string | null;
  onRestart: () => void;
  onOpenShop: () => void;
}

export default function ResultScreen({ scene, ownedHorn, resultImage, onRestart, onOpenShop }: ResultScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(t);
  }, []);

  const horn = ownedHorn ? HORNS.find(h => h.id === ownedHorn) : null;

  const handleSave = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${resultImage}`;
    link.download = `cartoon-cruiser-${scene.id}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (!resultImage) return;
    try {
      const blob = await fetch(`data:image/jpeg;base64,${resultImage}`).then(r => r.blob());
      const file = new File([blob], 'cartoon-cruiser.jpg', { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Mijn Cartoon Cruiser!' });
      } else {
        handleSave();
      }
    } catch {
      handleSave();
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: COLORS.cream,
      display: 'flex', flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <BackButton onClick={onRestart} />
      <Confetti active={showConfetti} />

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '64px 18px 28px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Header */}
        <div style={{ marginTop: 0, textAlign: 'center', marginBottom: 14 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: COLORS.yellow, color: COLORS.ink,
            padding: '6px 14px', borderRadius: 999,
            fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 13,
            boxShadow: '0 3px 0 rgba(31,37,64,0.08)',
            animation: 'pop .5s .2s ease both',
          }}>
            <Icon name="sparkles" size={14} strokeWidth={2.8} /> KLAAR!
          </div>
          <h2 style={{
            fontFamily: '"Fredoka", system-ui', fontWeight: 700,
            fontSize: 26, color: COLORS.ink, margin: '10px 0 0',
            letterSpacing: -0.6, lineHeight: 1.1,
          }}>Wauw, wat een coole cruiser! 🎉</h2>
        </div>

        {/* Result card */}
        <div style={{
          width: '100%', aspectRatio: '4 / 5',
          borderRadius: 32, overflow: 'hidden',
          background: scene.gradient,
          boxShadow: '0 10px 0 rgba(31,37,64,0.06), 0 22px 50px rgba(31,37,64,0.22)',
          position: 'relative',
          animation: 'cardIn .7s cubic-bezier(.34,1.56,.64,1) both',
          marginBottom: 14,
        }}>
          {resultImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${resultImage}`}
              alt="Je cartoon cruiser"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', borderRadius: 32,
              }}
            />
          ) : (
            <>
              <div style={{
                position: 'absolute', top: 22, right: 26,
                width: 56, height: 56, borderRadius: '50%',
                background: '#fff', opacity: 0.85,
                boxShadow: `0 0 60px ${COLORS.yellow}`,
              }} />
              <div style={{ position: 'absolute', top: 50, left: 24, fontSize: 28 }}>☁️</div>
              <div style={{ position: 'absolute', top: 80, right: 80, fontSize: 22 }}>☁️</div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '34%',
                background: 'linear-gradient(180deg, transparent, rgba(31,37,64,0.18))',
              }} />
              <div style={{
                position: 'absolute', bottom: '14%', left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1,
              }}>
                <div style={{
                  fontSize: 72, marginBottom: -16, position: 'relative', zIndex: 2,
                  animation: 'cruise 2.5s ease-in-out infinite',
                  filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.2))',
                }}>😎</div>
                <div style={{
                  fontSize: 110, position: 'relative',
                  animation: 'cruise 2.5s ease-in-out .1s infinite',
                  filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.25))',
                }}>🛵</div>
                <div style={{
                  position: 'absolute', bottom: 30, left: -40,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {[24, 32, 18].map((w, i) => (
                    <div key={i} style={{
                      width: w, height: 3, borderRadius: 3,
                      background: '#fff', opacity: 0.8,
                      animation: `speedLine 0.7s ease-in ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ position: 'absolute', top: 16, left: 18, fontSize: 22, opacity: 0.9 }}>{scene.accents[0]}</div>

          {horn && (
            <button
              onClick={() => playHornPattern(horn.pattern)}
              aria-label={`Toet de ${horn.name}`}
              style={{
                position: 'absolute', bottom: '22%', left: '50%',
                transform: 'translate(-130%, 0)',
                width: 56, height: 56, borderRadius: '50%',
                background: horn.color, color: '#fff', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.18), 0 8px 18px rgba(0,0,0,0.18)',
                animation: 'pop .5s .3s ease both',
                zIndex: 3,
              }}
            >{horn.emoji}</button>
          )}

          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)',
            padding: '6px 12px', borderRadius: 999,
            fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 11,
            color: COLORS.ink, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            🛵 Cartoon Cruisers
          </div>
          <div style={{
            position: 'absolute', bottom: 14, right: 14,
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)',
            padding: '6px 12px', borderRadius: 999,
            fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 11,
            color: COLORS.ink,
          }}>{scene.name}</div>
        </div>

        {/* Actions below the card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!horn && (
            <button
              onClick={onOpenShop}
              style={{
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: 'linear-gradient(120deg, #FFF3D6 0%, #FFE0E8 100%)',
                borderRadius: 22, padding: '12px 14px',
                boxShadow: '0 4px 0 rgba(31,37,64,0.06), 0 8px 18px rgba(31,37,64,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
                animation: 'fadeUp .5s .5s ease both',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, flexShrink: 0,
                boxShadow: '0 2px 0 rgba(31,37,64,0.06)',
                animation: 'wiggle 2.4s ease-in-out infinite',
              }}>📯</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'inline-block', background: COLORS.ink, color: '#fff',
                  fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 10,
                  padding: '2px 8px', borderRadius: 999, letterSpacing: 0.4, marginBottom: 4,
                }}>NIEUW</div>
                <div style={{
                  fontFamily: '"Fredoka", system-ui', fontWeight: 700,
                  fontSize: 17, color: COLORS.ink, lineHeight: 1.1,
                }}>Geef je cruiser een toeter!</div>
                <div style={{
                  fontFamily: '"Fredoka", system-ui', fontSize: 12,
                  color: COLORS.inkSoft, marginTop: 2,
                }}>4 grappige geluiden · vanaf €0,99</div>
              </div>
              <div style={{ fontSize: 22, color: COLORS.ink, paddingRight: 4 }}>→</div>
            </button>
          )}

          {horn && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fff', borderRadius: 18, padding: '10px 14px',
              boxShadow: '0 4px 0 rgba(31,37,64,0.05)',
              border: `2px solid ${horn.color}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12, background: horn.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{horn.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: '"Fredoka", system-ui', fontWeight: 600,
                  fontSize: 14, color: COLORS.ink, lineHeight: 1.1,
                }}>{horn.name} uitgerust</div>
                <div style={{
                  fontFamily: '"Fredoka", system-ui', fontSize: 11,
                  color: COLORS.inkSoft, marginTop: 2,
                }}>Tik op de toeter om te toeteren!</div>
              </div>
              <button
                onClick={() => playHornPattern(horn.pattern)}
                style={{
                  border: 'none', background: COLORS.ink, color: '#fff',
                  padding: '8px 12px', borderRadius: 12, cursor: 'pointer',
                  fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >▶ Test</button>
            </div>
          )}

          <BigButton onClick={handleSave} color={COLORS.mint} shadow={COLORS.mintDark}>
            <Icon name="download" size={22} strokeWidth={2.6} /> Bewaren
          </BigButton>
          <div style={{ display: 'flex', gap: 10 }}>
            <BigButton onClick={handleShare} color={COLORS.blue} shadow={COLORS.blueDark}
              style={{ flex: 1, fontSize: 18, padding: '16px 18px' }}>
              <Icon name="share" size={20} strokeWidth={2.6} /> Delen
            </BigButton>
            <BigButton onClick={onRestart} color="#fff" textColor={COLORS.ink} shadow="#DCE4E3"
              style={{ flex: 1, fontSize: 18, padding: '16px 18px', border: `2px solid ${COLORS.ink}12` }}>
              <Icon name="rotate" size={20} strokeWidth={2.6} color={COLORS.ink} /> Opnieuw
            </BigButton>
          </div>

          {/* Bottom spacing for safe area */}
          <div style={{ height: 20 }} />
        </div>
      </div>
    </div>
  );
}
