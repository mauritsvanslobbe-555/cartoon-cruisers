'use client';

import { useState, useMemo, CSSProperties, ReactNode } from 'react';
import { COLORS } from '@/lib/constants';

// ─── Icon ────────────────────────────────────────────────
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 2.4 }: IconProps) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'arrow-left': return <svg {...p}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>;
    case 'camera': return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'image': return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
    case 'download': return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>;
    case 'share': return <svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>;
    case 'rotate': return <svg {...p}><path d="M23 4v6h-6"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"/></svg>;
    case 'sparkles': return <svg {...p}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>;
    case 'check': return <svg {...p}><path d="M20 6L9 17l-5-5"/></svg>;
    case 'alert': return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    default: return null;
  }
}

// ─── Screen ──────────────────────────────────────────────
interface ScreenProps {
  children: ReactNode;
  bg?: string;
  style?: CSSProperties;
}

export function Screen({ children, bg = COLORS.cream, style }: ScreenProps) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg,
      display: 'flex', flexDirection: 'column',
      padding: '64px 22px 38px', boxSizing: 'border-box',
      overflow: 'hidden', ...style,
    }}>{children}</div>
  );
}

// ─── BigButton ───────────────────────────────────────────
interface BigButtonProps {
  children: ReactNode;
  color?: string;
  textColor?: string;
  shadow?: string;
  onClick?: () => void;
  style?: CSSProperties;
  disabled?: boolean;
}

export function BigButton({
  children, color = COLORS.mint, textColor = '#fff',
  shadow = COLORS.mintDark, onClick, style, disabled,
}: BigButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: color, color: textColor,
        fontFamily: '"Fredoka", system-ui', fontWeight: 600,
        fontSize: 22, letterSpacing: -0.2,
        padding: '20px 24px', borderRadius: 28,
        opacity: disabled ? 0.7 : 1,
        boxShadow: pressed
          ? `0 2px 0 ${shadow}, 0 4px 10px rgba(31,37,64,0.12)`
          : `0 6px 0 ${shadow}, 0 12px 24px rgba(31,37,64,0.14)`,
        transform: pressed ? 'translateY(4px)' : 'translateY(0)',
        transition: 'transform .12s ease, box-shadow .12s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        ...style,
      }}
    >{children}</button>
  );
}

// ─── BackButton ──────────────────────────────────────────
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Terug" style={{
      width: 48, height: 48, borderRadius: 24,
      background: '#fff', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 0 rgba(31,37,64,0.08), 0 6px 14px rgba(31,37,64,0.08)',
      color: COLORS.ink, position: 'absolute', top: 60, left: 18, zIndex: 5,
    }}>
      <Icon name="arrow-left" size={22} strokeWidth={2.6}/>
    </button>
  );
}

// ─── Logo ────────────────────────────────────────────────
export function Logo({ size = 142 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `conic-gradient(from 220deg, ${COLORS.mint}, ${COLORS.yellow}, ${COLORS.blue}, ${COLORS.mint})`,
        filter: 'blur(0.5px)',
        animation: 'spin 18s linear infinite',
      }}/>
      <div style={{
        position: 'absolute', inset: 8, borderRadius: '50%',
        background: '#fff',
        boxShadow: 'inset 0 -6px 0 rgba(31,37,64,0.05)',
      }}/>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
        <div style={{ fontSize: size * 0.34, marginBottom: -size * 0.04 }}>😎</div>
        <div style={{ fontSize: size * 0.44 }}>🛵</div>
      </div>
      <div style={{ position: 'absolute', top: -4, right: 6, fontSize: 22, transform: 'rotate(12deg)' }}>✨</div>
      <div style={{ position: 'absolute', bottom: 4, left: -6, fontSize: 18, transform: 'rotate(-18deg)' }}>⭐</div>
    </div>
  );
}

// ─── BlobDeco ────────────────────────────────────────────
export function BlobDeco() {
  return (
    <>
      <div style={{
        position: 'absolute', width: 220, height: 220, borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${COLORS.yellow}55, transparent 65%)`,
        top: -50, right: -60, filter: 'blur(2px)',
      }}/>
      <div style={{
        position: 'absolute', width: 260, height: 260, borderRadius: '50%',
        background: `radial-gradient(circle at 60% 40%, ${COLORS.blue}33, transparent 65%)`,
        bottom: -80, left: -80, filter: 'blur(2px)',
      }}/>
    </>
  );
}

// ─── Confetti ────────────────────────────────────────────
export function Confetti({ active }: { active: boolean }) {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 1.8,
    color: [COLORS.mint, COLORS.blue, COLORS.yellow, '#FF8FB1', '#A78BFA'][i % 5],
    size: 8 + Math.random() * 8,
    rot: Math.random() * 360,
    shape: i % 3,
  })), []);
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`, top: -20,
          width: p.size, height: p.shape === 1 ? p.size * 0.4 : p.size,
          background: p.color,
          borderRadius: p.shape === 2 ? '50%' : 3,
          transform: `rotate(${p.rot}deg)`,
          animation: `confetti ${p.duration}s ease-in ${p.delay}s forwards`,
        }}/>
      ))}
    </div>
  );
}
