'use client';

import { useState } from 'react';
import { COLORS } from '@/lib/constants';
import { Screen, BigButton, Logo, BlobDeco } from './ui';

interface ParentalConsentProps {
  onConsent: () => void;
}

export default function ParentalConsent({ onConsent }: ParentalConsentProps) {
  const [checked, setChecked] = useState(false);

  const handleConsent = () => {
    if (!checked) return;
    try { localStorage.setItem('cartoon-cruisers-consent', 'true'); } catch {}
    onConsent();
  };

  return (
    <Screen bg={COLORS.cream}>
      <BlobDeco />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ animation: 'bob 3.5s ease-in-out infinite' }}>
          <Logo size={120} />
        </div>

        <div style={{ fontSize: 44, marginTop: 20, marginBottom: 8 }}>🛡️</div>

        <h2 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 28, color: COLORS.ink, margin: '0 0 8px',
          letterSpacing: -0.8, textAlign: 'center', lineHeight: 1.1,
        }}>
          Toestemming ouder
        </h2>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 400,
          fontSize: 15, color: COLORS.inkSoft, margin: '0 0 28px',
          textAlign: 'center', maxWidth: 280, lineHeight: 1.4,
        }}>
          Deze app maakt een cartoon van een foto. De foto wordt niet opgeslagen en alleen tijdelijk gebruikt.
        </p>

        <button
          onClick={() => setChecked(!checked)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#fff', border: `2px solid ${checked ? COLORS.mint : COLORS.ink + '20'}`,
            borderRadius: 18, padding: '14px 18px',
            cursor: 'pointer', width: '100%', maxWidth: 320,
            boxShadow: '0 4px 0 rgba(31,37,64,0.05)',
            transition: 'border-color .2s ease',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: checked ? COLORS.mint : '#F0F2F5',
            border: checked ? 'none' : '2px solid #D0D5DD',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s ease',
          }}>
            {checked && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            )}
          </div>
          <span style={{
            fontFamily: '"Fredoka", system-ui', fontWeight: 500,
            fontSize: 15, color: COLORS.ink, textAlign: 'left',
            lineHeight: 1.3,
          }}>
            Ik ben een ouder/verzorger en geef toestemming
          </span>
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <BigButton
          onClick={handleConsent}
          color={checked ? COLORS.mint : '#D8E1E0'}
          shadow={checked ? COLORS.mintDark : '#B7C2C1'}
          textColor={checked ? '#fff' : '#8C9594'}
          disabled={!checked}
        >
          Doorgaan <span style={{ fontSize: 22 }}>→</span>
        </BigButton>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 400,
          fontSize: 11, color: COLORS.inkSoft, textAlign: 'center',
          margin: '4px 0 0', lineHeight: 1.4,
        }}>
          Foto&apos;s worden nooit opgeslagen. Alle verwerking is tijdelijk en veilig.
        </p>
      </div>
    </Screen>
  );
}
