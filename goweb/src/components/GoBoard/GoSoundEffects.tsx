import React, { useRef, useEffect } from 'react';

interface GoSoundEffectsProps {
  playSound: string | null;
}

const GoSoundEffects: React.FC<GoSoundEffectsProps> = ({ playSound }) => {
  const blackSoundRef = useRef<HTMLAudioElement>(null);
  const whiteSoundRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (playSound) {
      const color = playSound.toLowerCase();
      if (color === 'black') {
        blackSoundRef.current?.play();
      } else if (color === 'white') {
        whiteSoundRef.current?.play();
      }
    }
  }, [playSound]);

  return (
    <div className="hidden">
      <audio ref={blackSoundRef} preload="auto">
        <source src="/sounds/blackpiece.MP3" type="audio/mpeg" />
      </audio>
      <audio ref={whiteSoundRef} preload="auto">
        <source src="/sounds/whitepiece.MP3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default GoSoundEffects;