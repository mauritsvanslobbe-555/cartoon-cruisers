'use client';

import { useState, useEffect, useCallback } from 'react';
import { SCENES, SceneId } from '@/lib/constants';
import ParentalConsent from '@/components/ParentalConsent';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import SceneScreen from '@/components/screens/SceneScreen';
import PhotoScreen from '@/components/screens/PhotoScreen';
import LoadingScreen from '@/components/screens/LoadingScreen';
import ResultScreen from '@/components/screens/ResultScreen';
import HornShopScreen from '@/components/screens/HornShopScreen';

type ScreenName = 'consent' | 'welcome' | 'scene' | 'photo' | 'loading' | 'result' | 'horn';

export default function Home() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [screen, setScreen] = useState<ScreenName>('welcome');
  const [picked, setPicked] = useState<SceneId | null>(null);
  const [ownedHorn, setOwnedHorn] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cartoon-cruisers-consent');
      setHasConsent(consent === 'true');
    } catch {
      setHasConsent(false);
    }
  }, []);

  const go = useCallback((next: ScreenName) => {
    setScreen(next);
  }, []);

  const handleConsent = () => {
    setHasConsent(true);
  };

  const handleCapture = (base64: string) => {
    setPhotoBase64(base64);
    go('loading');
  };

  const handleTransformDone = (image: string) => {
    setResultImage(image);
    setPhotoBase64(null);
    go('result');
  };

  const handleTransformError = () => {
    // Error is shown in LoadingScreen with retry
  };

  const handleRestart = () => {
    setOwnedHorn(null);
    setResultImage(null);
    setPhotoBase64(null);
    setPicked(null);
    go('welcome');
  };

  const scene = SCENES.find(s => s.id === picked) || SCENES[0];

  // Don't render until we know consent state
  if (hasConsent === null) return null;

  if (!hasConsent) {
    return (
      <div style={{ width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
        <ParentalConsent onConsent={handleConsent} />
      </div>
    );
  }

  const order: ScreenName[] = ['welcome', 'scene', 'photo', 'loading', 'result', 'horn'];
  const idx = order.indexOf(screen);

  return (
    <div style={{
      width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden',
      background: '#000',
    }}>
      {order.map((key, i) => {
        const offset = i - idx;
        if (Math.abs(offset) > 1) return null;
        const slide = offset === 0 ? 0 : (offset > 0 ? 100 : -100);
        return (
          <div key={key} style={{
            position: 'absolute', inset: 0,
            transform: `translateX(${slide}%)`,
            opacity: offset === 0 ? 1 : 0,
            transition: 'transform .42s cubic-bezier(.5,.05,.3,1), opacity .3s ease',
            pointerEvents: offset === 0 ? 'auto' : 'none',
          }}>
            {key === 'welcome' && (
              <WelcomeScreen onStart={() => go('scene')} />
            )}
            {key === 'scene' && (
              <SceneScreen
                onBack={() => go('welcome')}
                onPick={() => go('photo')}
                picked={picked}
                setPicked={setPicked}
              />
            )}
            {key === 'photo' && (
              <PhotoScreen
                onBack={() => go('scene')}
                onCapture={handleCapture}
              />
            )}
            {key === 'loading' && photoBase64 && picked && (
              <LoadingScreen
                photo={photoBase64}
                scene={picked}
                onDone={handleTransformDone}
                onError={handleTransformError}
              />
            )}
            {key === 'result' && (
              <ResultScreen
                scene={scene}
                ownedHorn={ownedHorn}
                resultImage={resultImage}
                onRestart={handleRestart}
                onOpenShop={() => go('horn')}
              />
            )}
            {key === 'horn' && (
              <HornShopScreen
                onBack={() => go('result')}
                ownedHorn={ownedHorn}
                onBuy={(id) => { setOwnedHorn(id); go('result'); }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
