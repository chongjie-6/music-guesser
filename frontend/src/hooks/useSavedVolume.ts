import { useEffect, useState, type RefObject } from "react";

const VOLUME_KEY = "volume";

const savedVolume = () => {
  const v = Number(localStorage.getItem(VOLUME_KEY) ?? 1);
  return v >= 0 && v <= 1 ? v : 1;
};

export function useSavedVolume(audioRef: RefObject<HTMLAudioElement | null>) {
  const [volume, setVolume] = useState(savedVolume);

  useEffect(() => {
    audioRef.current!.volume = savedVolume();
  }, [audioRef]);

  const saveVolume = (v: number) => {
    setVolume(v);
    localStorage.setItem(VOLUME_KEY, String(v));
  };

  return [volume, saveVolume] as const;
}
