'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SCENES, SceneId } from '@/lib/constants';
import ParentalConsent from '@/components/ParentalConsent';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import SceneScreen from '@/components/screens/SceneScreen';
import ModeScreen from '@/components/screens/ModeScreen';
import PhotoScreen from '@/components/screens/PhotoScreen';
import GroupPhotoScreen from '@/components/screens/GroupPhotoScreen';
import LoadingScreen from '@/components/screens/LoadingScreen';
import ResultScreen from '@/components/screens/ResultScreen';
import HornShopScreen from '@/components/screens/HornShopScreen';

type ScreenName = 'consent' | 'welcome' | 'scene' | 'mode' | 'photo' | 'groupPhoto' | 'loading' | 'result' | 'horn';
type RideMode = 'solo' | 'group';

export default function Home() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [screen, setScreen] = useState<ScreenName>('welcome');
  const [picked, setPicked] = useState<SceneId | null>(null);
  const [rideMode, setRideMode] = useState<RideMode>('solo');
  const [ownedHorn, setOwnedHorn] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [groupPhotos, setGroupPhotos] = useState<string[] | null>(null);
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

  const handleGroupDone = (photos: string[]) => {
    setGroupPhotos(photos);
    go('loading');
  };

  const handleTransformDone = (image: string) => {
    setResultImage(image);
    setPhotoBase64(null);
    setGroupPhotos(null);
    go('result');
  };

  const handleTransformError = () => {
    // Error is shown in LoadingScreen with retry
  };

  const handleRestart = () => {
    setOwnedHorn(null);
    setResultImage(null);
    setPhotoBase64(null);
    setGroupPhotos(null);
    setPicked(null);
    setRideMode('solo');
    go('welcome');
  };

  const scene = SCENES.find(s => s.id === picked) || SCENES[0];

  // Dynamic screen order based on ride mode — no gaps to skip
  const order: ScreenName[] = useMemo(() => {
    if (rideMode === 'group') {
      return ['welcome', 'scene', 'mode', 'groupPhoto', 'loading', 'result', 'horn'];
    }
    return ['welcome', 'scene', 'mode', 'photo', 'loading', 'result', 'horn'];
  }, [rideMode]);

  const idx = order.indexOf(screen);

  // Don't render until we know consent state
  if (hasConsent === null) return null;

  if (!hasConsent) {
    return (
      <div style={{ width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
        <ParentalConsent onConsent={handleConsent} />
      </div>
    );
  }

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
                onPick={() => go('mode')}
                picked={picked}
                setPicked={setPicked}
              />
            )}
            {key === 'mode' && (
              <ModeScreen
                onBack={() => go('scene')}
                onPickSolo={() => { setRideMode('solo'); go('photo'); }}
                onPickGroup={() => { setRideMode('group'); go('groupPhoto'); }}
              />
            )}
            {key === 'photo' && (
              <PhotoScreen
                onBack={() => go('mode')}
                onCapture={handleCapture}
              />
            )}
            {key === 'groupPhoto' && (
              <GroupPhotoScreen
                onBack={() => go('mode')}
                onDone={handleGroupDone}
              />
            )}
            {key === 'loading' && picked && (photoBase64 || groupPhotos) && (
              <LoadingScreen
                photo={photoBase64 || ''}
                photos={groupPhotos || undefined}
                mode={rideMode}
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
                mode={rideMode}
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
