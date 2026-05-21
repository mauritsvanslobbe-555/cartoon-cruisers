'use client';

import { useState } from 'react';
import { COLORS, HORNS } from '@/lib/constants';
import { playHornPattern } from '@/lib/audio';
import { Screen, BigButton, BackButton, Icon } from '../ui';

// ─── ParentGate ────────────────────────────────────────
function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [problem] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 6 + Math.floor(Math.random() * 7);
    return { a, b, answer: a * b };
  });
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (parseInt(value, 10) === problem.answer) onPass();
    else { setShake(true); setTimeout(() => setShake(false), 400); setValue(''); }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(31,37,64,0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 22, animation: 'fadeUp .25s ease both',
    }}>
      <div style={{
        background: '#fff', borderRadius: 28, padding: '24px 22px',
        width: '100%', maxWidth: 320,
        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
        animation: shake ? 'shake .4s ease' : 'pop .35s ease both',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 44, marginBottom: 6 }}>🛡️</div>
        <h3 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 22, color: COLORS.ink, margin: '0 0 4px',
          letterSpacing: -0.4,
        }}>Vraag een ouder</h3>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontSize: 13,
          color: COLORS.inkSoft, margin: '0 0 18px',
        }}>Voor een aankoop hebben we een grote nodig.</p>

        <div style={{
          background: COLORS.cream, borderRadius: 18,
          padding: '14px 16px', marginBottom: 14,
        }}>
          <div style={{
            fontFamily: '"Fredoka", system-ui', fontSize: 12,
            color: COLORS.inkSoft, marginBottom: 4,
          }}>Hoeveel is</div>
          <div style={{
            fontFamily: '"Fredoka", system-ui', fontWeight: 700,
            fontSize: 32, color: COLORS.ink, letterSpacing: -0.6,
          }}>{problem.a} × {problem.b} = ?</div>
        </div>

        <input
          type="number"
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Antwoord"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '14px 16px', borderRadius: 16,
            border: `2px solid ${COLORS.ink}15`,
            fontFamily: '"Fredoka", system-ui', fontSize: 22,
            fontWeight: 600, color: COLORS.ink, textAlign: 'center',
            outline: 'none', marginBottom: 12,
            background: '#F7FAFA',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <BigButton onClick={onCancel} color="#fff" textColor={COLORS.ink} shadow="#DCE4E3"
            style={{ flex: 1, fontSize: 15, padding: '14px 12px', border: `2px solid ${COLORS.ink}12` }}>
            Annuleer
          </BigButton>
          <BigButton onClick={submit} color={COLORS.mint} shadow={COLORS.mintDark}
            style={{ flex: 1.4, fontSize: 15, padding: '14px 12px' }}>
            Bevestig
          </BigButton>
        </div>
      </div>
    </div>
  );
}

// ─── HornShopScreen ─────────────────────────────────────
interface HornShopScreenProps {
  onBack: () => void;
  ownedHorn: string | null;
  onBuy: (id: string) => void;
}

export default function HornShopScreen({ onBack, ownedHorn, onBuy }: HornShopScreenProps) {
  const [selected, setSelected] = useState<string | null>(ownedHorn || null);
  const [gateOpen, setGateOpen] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const horn = HORNS.find(h => h.id === selected);

  const previewSelected = (id: string) => {
    setSelected(id);
    const h = HORNS.find(x => x.id === id);
    if (h) playHornPattern(h.pattern);
  };

  const handleBuy = () => {
    if (!selected) return;
    setGateOpen(true);
  };

  const onGatePass = () => {
    setGateOpen(false);
    setPurchased(true);
    setTimeout(() => onBuy(selected!), 900);
  };

  return (
    <Screen bg={COLORS.paper}>
      <BackButton onClick={onBack} />
      <div style={{ marginTop: 60, marginBottom: 14 }}>
        <div style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 500,
          fontSize: 13, color: '#E08F2C',
          letterSpacing: 1.4, textTransform: 'uppercase',
        }}>Toeter winkel</div>
        <h2 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 30, color: COLORS.ink, margin: '4px 0 0',
          letterSpacing: -0.8, lineHeight: 1.05,
        }}>Kies een toeter <span style={{ display: 'inline-block', animation: 'wiggle 2s ease-in-out infinite' }}>📯</span></h2>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontSize: 14,
          color: COLORS.inkSoft, margin: '6px 0 0',
        }}>Tik om te luisteren · koop om hem te houden</p>
      </div>

      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10, overflowY: 'auto', paddingBottom: 6, alignContent: 'start',
      }}>
        {HORNS.map(h => {
          const sel = selected === h.id;
          const owned = ownedHorn === h.id;
          return (
            <button
              key={h.id}
              onClick={() => previewSelected(h.id)}
              style={{
                border: 'none', cursor: 'pointer', padding: 14,
                borderRadius: 22, background: '#fff',
                boxShadow: sel
                  ? `0 0 0 3px ${h.color}, 0 8px 18px rgba(31,37,64,0.12)`
                  : '0 4px 0 rgba(31,37,64,0.05), 0 6px 14px rgba(31,37,64,0.07)',
                transition: 'all .25s ease',
                transform: sel ? 'translateY(-2px)' : 'translateY(0)',
                textAlign: 'left', position: 'relative', overflow: 'hidden',
                minHeight: 158,
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 110, height: 110, borderRadius: '50%',
                background: h.color, opacity: 0.18,
              }} />
              {owned && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: COLORS.mint, color: '#fff',
                  fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 10,
                  padding: '3px 8px', borderRadius: 999,
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <Icon name="check" size={10} strokeWidth={4} /> JOUW
                </div>
              )}
              <div style={{
                fontSize: 42, marginBottom: 8, position: 'relative',
                animation: sel ? 'wiggle 0.6s ease' : 'none',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))',
              }}>{h.emoji}</div>
              <div style={{
                fontFamily: '"Fredoka", system-ui', fontWeight: 700,
                fontSize: 14, color: COLORS.ink, lineHeight: 1.1,
                position: 'relative',
              }}>{h.name}</div>
              <div style={{
                fontFamily: '"Fredoka", system-ui', fontSize: 11,
                color: COLORS.inkSoft, marginTop: 2, flex: 1,
                position: 'relative',
              }}>{h.sub}</div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 8, position: 'relative',
              }}>
                <span style={{
                  fontFamily: '"Fredoka", system-ui', fontWeight: 700,
                  fontSize: 16, color: h.color,
                }}>{h.price}</span>
                <span style={{
                  fontSize: 11, color: COLORS.inkSoft,
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>▶ Hoor</span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ paddingTop: 10 }}>
        <BigButton
          onClick={handleBuy}
          color={selected ? COLORS.mint : '#D8E1E0'}
          shadow={selected ? COLORS.mintDark : '#B7C2C1'}
          textColor={selected ? '#fff' : '#8C9594'}
          disabled={!selected}
        >
          {horn
            ? <>Koop {horn.name} · {horn.price} 🛡️</>
            : <>Kies eerst een toeter</>}
        </BigButton>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontSize: 11,
          color: COLORS.inkSoft, textAlign: 'center', margin: '8px 0 0',
        }}>
          🛡️ Aankopen vragen toestemming van een ouder
        </p>
      </div>

      {gateOpen && <ParentGate onPass={onGatePass} onCancel={() => setGateOpen(false)} />}

      {purchased && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: 'rgba(31,37,64,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeUp .25s ease both',
        }}>
          <div style={{
            background: '#fff', borderRadius: 28, padding: '28px 24px',
            textAlign: 'center', width: 260,
            animation: 'pop .4s ease both',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              fontSize: 56, marginBottom: 6,
              animation: 'bounce 0.8s ease infinite',
            }}>{horn?.emoji}</div>
            <h3 style={{
              fontFamily: '"Fredoka", system-ui', fontWeight: 700,
              fontSize: 22, color: COLORS.ink, margin: '0 0 4px',
            }}>Gekocht!</h3>
            <p style={{
              fontFamily: '"Fredoka", system-ui', fontSize: 13,
              color: COLORS.inkSoft, margin: 0,
            }}>Toeter aan je cruiser toegevoegd 🎉</p>
          </div>
        </div>
      )}
    </Screen>
  );
}
