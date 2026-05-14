import React, { useEffect, useMemo, useState } from 'react';

type VideoBackgroundProps = {
  src: string;
  className?: string;
};

type VideoSource = { src: string; type?: string };

function shouldDisableVideo(): boolean {
  if (typeof window === 'undefined') return true;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  // @ts-expect-error: not all TS libs include NetworkInformation
  const saveData = navigator?.connection?.saveData === true;
  return Boolean(reduced || saveData);
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ src, className }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!shouldDisableVideo());
  }, []);

  const sources = useMemo<VideoSource[]>(() => {
    const lower = src.toLowerCase();
    if (lower.endsWith('.webm')) return [{ src, type: 'video/webm' }];
    if (lower.endsWith('.mp4')) return [{ src, type: 'video/mp4' }];
    return [{ src }];
  }, [src]);

  if (!enabled) return null;

  return (
    <video
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
};

export default VideoBackground;

