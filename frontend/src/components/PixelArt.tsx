import { useEffect, useRef } from "react";

const SIZE = 96;

/**
 * Album art squashed down to `blocks` × `blocks` pixels, then blown back up.
 */
export default function PixelArt({ src, blocks }: { src: string; blocks: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const g = canvasRef.current?.getContext("2d");
      if (!g) return;
      const small = document.createElement("canvas");
      small.width = small.height = blocks;
      const s = small.getContext("2d")!;
      s.imageSmoothingQuality = "high";
      s.drawImage(img, 0, 0, blocks, blocks);
      g.imageSmoothingEnabled = false;
      g.drawImage(small, 0, 0, SIZE, SIZE);
    };
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src, blocks]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="h-24 w-24 shrink-0 border-2 border-arcade-cyan/40 bg-cab-black"
      aria-label="Pixelated album art"
    />
  );
}
