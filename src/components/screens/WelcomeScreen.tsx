'use client';

import { COLORS } from '@/lib/constants';
import { Screen, BigButton, Logo, BlobDeco } from '../ui';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <Screen bg={COLORS.cream}>
      <BlobDeco />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ animation: 'bob 3.5s ease-in-out infinite' }}>
          <Logo size={172} />
        </div>
        <h1 style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 700,
          fontSize: 44, color: COLORS.ink, margin: '28px 0 10px',
          letterSpacing: -1.2, textAlign: 'center', lineHeight: 1,
        }}>
          Cartoon<br />Cruisers
        </h1>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 400,
          fontSize: 18, color: COLORS.inkSoft, margin: 0,
          textAlign: 'center', maxWidth: 280, lineHeight: 1.35,
        }}>
          Word een coole cartoon op een scooter! <span style={{ fontSize: 20 }}>🛵💨</span>
        </p>
        <div style={{
          marginTop: 18, display: 'flex', gap: 6,
          padding: '8px 14px', borderRadius: 999,
          background: '#fff', boxShadow: '0 3px 0 rgba(31,37,64,0.05)',
          fontFamily: '"Fredoka", system-ui', fontSize: 13, color: COLORS.inkSoft,
        }}>
          <span>⏱️</span><span>Klaar in 1 minuut</span>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <BigButton onClick={onStart}>
          Start het avontuur! <span style={{ fontSize: 26 }}>🚀</span>
        </BigButton>
        <p style={{
          fontFamily: '"Fredoka", system-ui', fontWeight: 400,
          fontSize: 12, color: COLORS.inkSoft, textAlign: 'center',
          margin: '4px 0 0',
        }}>
          🛡️ Met toestemming van een ouder/verzorger
        </p>
      </div>
    </Screen>
  );
}
