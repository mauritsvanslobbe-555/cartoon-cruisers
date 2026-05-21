'use client';

import { COLORS, SCENES, SceneId } from '@/lib/constants';
import { Screen, BigButton, BackButton, Icon } from '../ui';

interface SceneScreenProps {
  onBack: () => void;
  onPick: () => void;
  picked: SceneId | null;
  setPicked: (id: SceneId) => void;
}

export default function SceneScreen({ onBack, onPick, picked, setPicked }: SceneScreenProps) {
  return (
    <Screen bg={COLORS.paper}>
      <BackButton onClick={onBack} />
      <div style={{ marginTop: 60, marginBottom: 20 }}>
        <div style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 500,
          fontSize: 13, color: COLORS.mintDark,
          letterSpacing: 1.4, textTransform: 'uppercase',
        }}>Stap 1 van 3</div>
        <h2 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 32, color: COLORS.ink, margin: '4px 0 0',
          letterSpacing: -0.8, lineHeight: 1.05,
        }}>Waar wil je cruisen?</h2>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontSize: 15,
          color: COLORS.inkSoft, margin: '6px 0 0',
        }}>Kies een scene voor je avontuur</p>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto', paddingBottom: 8,
        WebkitOverflowScrolling: 'touch',
      }}>
        {SCENES.map(s => {
          const sel = picked === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setPicked(s.id)}
              style={{
                border: 'none', cursor: 'pointer', padding: 0,
                borderRadius: 22, overflow: 'hidden',
                background: s.gradient, position: 'relative',
                height: sel ? 120 : 88,
                flexShrink: 0,
                boxShadow: sel
                  ? `0 0 0 3px ${COLORS.mint}, 0 12px 24px rgba(31,37,64,0.18)`
                  : '0 3px 0 rgba(31,37,64,0.06), 0 8px 16px rgba(31,37,64,0.08)',
                transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
                textAlign: 'left',
              }}
            >
              <div style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                fontSize: sel ? 64 : 48,
                filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
                transition: 'font-size .35s ease',
              }}>{s.emoji}</div>

              {sel && (
                <div style={{
                  position: 'absolute', right: 80, top: 10,
                  display: 'flex', gap: 5,
                  animation: 'fadeUp .4s ease both',
                }}>
                  {s.accents.map((a, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: 10,
                      background: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13,
                    }}>{a}</div>
                  ))}
                </div>
              )}

              <div style={{ padding: '14px 16px', position: 'relative', zIndex: 1, maxWidth: '64%' }}>
                <div style={{
                  fontFamily: '"Fredoka", system-ui', fontWeight: 700,
                  fontSize: 18, color: COLORS.ink, lineHeight: 1.05,
                  letterSpacing: -0.4,
                }}>{s.name}</div>
                <div style={{
                  fontFamily: '"Fredoka", system-ui', fontSize: 12,
                  color: 'rgba(31,37,64,0.75)', marginTop: 3,
                }}>{s.sub}</div>
                {sel && (
                  <div style={{
                    marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#fff', padding: '4px 10px', borderRadius: 999,
                    fontFamily: '"Fredoka", system-ui', fontWeight: 500, fontSize: 11,
                    color: COLORS.ink, animation: 'fadeUp .4s ease both',
                  }}>
                    <span style={{ color: COLORS.mintDark }}>●</span> {s.weather}
                  </div>
                )}
              </div>

              {sel && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 28, height: 28, borderRadius: '50%',
                  background: COLORS.mint, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  animation: 'pop .3s ease both',
                }}>
                  <Icon name="check" size={16} strokeWidth={3.4} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ paddingTop: 8 }}>
        <BigButton
          onClick={() => picked && onPick()}
          color={picked ? COLORS.mint : '#D8E1E0'}
          shadow={picked ? COLORS.mintDark : '#B7C2C1'}
          textColor={picked ? '#fff' : '#8C9594'}
          disabled={!picked}
        >
          Volgende stap <span style={{ fontSize: 22 }}>→</span>
        </BigButton>
      </div>
    </Screen>
  );
}
