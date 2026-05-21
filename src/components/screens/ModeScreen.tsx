'use client';

import { COLORS } from '@/lib/constants';
import { Screen, BackButton } from '../ui';

interface ModeScreenProps {
  onBack: () => void;
  onPickSolo: () => void;
  onPickGroup: () => void;
}

export default function ModeScreen({ onBack, onPickSolo, onPickGroup }: ModeScreenProps) {
  return (
    <Screen bg={COLORS.paper}>
      <BackButton onClick={onBack} />

      <div style={{ marginTop: 60, marginBottom: 24 }}>
        <div style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 500,
          fontSize: 13, color: COLORS.mintDark,
          letterSpacing: 1.4, textTransform: 'uppercase',
        }}>Stap 2 van 4</div>
        <h2 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 30, color: COLORS.ink, margin: '4px 0 0',
          letterSpacing: -0.8, lineHeight: 1.1,
        }}>Alleen of samen?</h2>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontSize: 15,
          color: COLORS.inkSoft, margin: '6px 0 0',
        }}>Cruise solo of met je vrienden!</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        {/* Solo card */}
        <button
          onClick={onPickSolo}
          style={{
            border: 'none', cursor: 'pointer', padding: 0,
            borderRadius: 28, overflow: 'hidden', textAlign: 'left',
            background: 'linear-gradient(140deg, #E8F8F5 0%, #D1F0EA 50%, #B8E8DE 100%)',
            boxShadow: '0 6px 0 rgba(31,37,64,0.06), 0 14px 28px rgba(31,37,64,0.1)',
            position: 'relative',
            transition: 'transform .2s ease, box-shadow .2s ease',
          }}
        >
          <div style={{
            position: 'absolute', right: 14, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 72,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          }}>🛵</div>

          <div style={{ padding: '24px 22px', position: 'relative', zIndex: 1, maxWidth: '60%' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: COLORS.mint, color: '#fff',
              padding: '4px 10px', borderRadius: 999,
              fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 11,
              marginBottom: 8,
            }}>1 PERSOON</div>
            <div style={{
              fontFamily: '"Fredoka", system-ui', fontWeight: 700,
              fontSize: 24, color: COLORS.ink, lineHeight: 1.1,
              letterSpacing: -0.5,
            }}>Solo Cruiser</div>
            <div style={{
              fontFamily: '"Fredoka", system-ui', fontSize: 13,
              color: COLORS.inkSoft, marginTop: 4, lineHeight: 1.3,
            }}>Jij alleen op je scooter!</div>
          </div>
        </button>

        {/* Group card */}
        <button
          onClick={onPickGroup}
          style={{
            border: 'none', cursor: 'pointer', padding: 0,
            borderRadius: 28, overflow: 'hidden', textAlign: 'left',
            background: 'linear-gradient(140deg, #FFF3D6 0%, #FFE0E8 50%, #E8D5FF 100%)',
            boxShadow: '0 6px 0 rgba(31,37,64,0.06), 0 14px 28px rgba(31,37,64,0.1)',
            position: 'relative',
            transition: 'transform .2s ease, box-shadow .2s ease',
          }}
        >
          <div style={{
            position: 'absolute', right: 8, top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', gap: 2,
          }}>
            {['🛵', '🛵', '🛵', '🛵'].map((e, i) => (
              <div key={i} style={{
                fontSize: 36,
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))',
                transform: `translateY(${i % 2 === 0 ? -4 : 4}px) rotate(${i % 2 === 0 ? -5 : 5}deg)`,
              }}>{e}</div>
            ))}
          </div>

          <div style={{ padding: '24px 22px', position: 'relative', zIndex: 1, maxWidth: '55%' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#A78BFA', color: '#fff',
              padding: '4px 10px', borderRadius: 999,
              fontFamily: '"Fredoka", system-ui', fontWeight: 600, fontSize: 11,
              marginBottom: 8,
            }}>4 PERSONEN</div>
            <div style={{
              fontFamily: '"Fredoka", system-ui', fontWeight: 700,
              fontSize: 24, color: COLORS.ink, lineHeight: 1.1,
              letterSpacing: -0.5,
            }}>Groeps Cruise!</div>
            <div style={{
              fontFamily: '"Fredoka", system-ui', fontSize: 13,
              color: COLORS.inkSoft, marginTop: 4, lineHeight: 1.3,
            }}>Met z&apos;n vieren op pad!</div>
          </div>

          {/* NEW badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: COLORS.yellow, color: COLORS.ink,
            padding: '3px 10px', borderRadius: 999,
            fontFamily: '"Fredoka", system-ui', fontWeight: 700, fontSize: 10,
            letterSpacing: 0.6,
            boxShadow: '0 2px 0 rgba(31,37,64,0.08)',
            animation: 'pop .5s .3s ease both',
          }}>NIEUW!</div>
        </button>
      </div>

      <div style={{ height: 20 }} />
    </Screen>
  );
}
