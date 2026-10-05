import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { useSavedVolume } from "../hooks/useSavedVolume";

const BARS = 20;
const SEGS = 10;
const CELL_W = 10;
const CELL_H = 5;
const GAP = 2;

// Fixed rate so bin widths don't depend on the device (some run at 192kHz)
const SAMPLE_RATE = 44100;
const FFT_SIZE = 2048;
const binOf = (hz: number) => Math.floor(hz / (SAMPLE_RATE / FFT_SIZE));
const barHz = (b: number) => 60 * (16000 / 60) ** (b / BARS);
const BAR_BINS = Array.from({ length: BARS }, (_, b) => {
  const lo = binOf(barHz(b));
  return [lo, Math.max(lo + 1, binOf(barHz(b + 1)))];
});

const ICONS = {
  play: "M2 1h2v8H2zM4 2h2v6H4zM6 3h2v4H6zM8 4h1v2H8z",
  pause: "M2 1h2v8H2zM6 1h2v8H6z",
  speaker: "M1 4h2v2H1zM3 3h1v4H3zM4 2h1v6H4zM5 1h1v8H5zM7 4h1v2H7zM9 2h1v6H9z",
  muted:
    "M1 4h2v2H1zM3 3h1v4H3zM4 2h1v6H4zM5 1h1v8H5zM7 3h1v1H7zM9 3h1v1H9zM8 4h1v2H8zM7 6h1v1H7zM9 6h1v1H9z",
};

const Icon = ({ name }: { name: keyof typeof ICONS }) => (
  <svg
    viewBox="0 0 10 10"
    width="20"
    height="20"
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden
  >
    <path d={ICONS[name]} />
  </svg>
);

const segColor = (s: number) =>
  s >= 8 ? "#ff2244" : s >= 6 ? "#f5e642" : "#00ff88";

const formatTime = (t: number) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

type Props = {
  src: string;
  audioRef: RefObject<HTMLAudioElement | null>;
  stopped: boolean;
};

export default function MusicPlayer({ src, audioRef, stopped }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graph = useRef<{ ctx: AudioContext; analyser: AnalyserNode } | null>(
    null,
  );
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useSavedVolume(audioRef);
  const [muted, setMuted] = useState(false);
  const [failedSrc, setFailedSrc] = useState("");
  const failed = failedSrc === src;

  useEffect(() => {
    const g = canvasRef.current?.getContext("2d");
    if (!g) return;
    const bins = new Uint8Array(FFT_SIZE / 2);
    let frame = 0;
    const draw = () => {
      graph.current?.analyser.getByteFrequencyData(bins);
      g.clearRect(0, 0, g.canvas.width, g.canvas.height);
      for (let b = 0; b < BARS; b++) {
        const [lo, hi] = BAR_BINS[b];
        const lit = Math.round(
          (Math.max(...bins.subarray(lo, hi)) / 255) * SEGS,
        );
        for (let s = 0; s < SEGS; s++) {
          g.fillStyle = s < lit ? segColor(s) : "rgba(240, 240, 255, 0.07)";
          g.shadowColor = g.fillStyle;
          g.shadowBlur = s < lit ? 8 : 0;
          g.fillRect(
            b * (CELL_W + GAP),
            (SEGS - 1 - s) * (CELL_H + GAP),
            CELL_W,
            CELL_H,
          );
        }
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      void graph.current?.ctx.close();
    };
  }, []);

  // A media element can only be routed into one AudioContext, so build it once
  const connectAnalyser = () => {
    if (!graph.current) {
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      // Headroom for loud masters, which otherwise pin every bar in the red
      analyser.minDecibels = -95;
      analyser.maxDecibels = -15;
      ctx
        .createMediaElementSource(audioRef.current!)
        .connect(analyser)
        .connect(ctx.destination);
      graph.current = { ctx, analyser };
    }
    void graph.current.ctx.resume();
  };

  const togglePlay = () => {
    const audio = audioRef.current!;
    // Rejections are aborted loads or bad sources, which onError already reports
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const shownVolume = muted ? 0 : volume;

  return (
    <div className="mt-3">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        src={src}
        autoPlay
        onPlay={() => {
          connectAnalyser();
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          setDuration(Number.isFinite(d) ? d : 0);
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onError={() => setFailedSrc(src)}
      />

      <div className="border-2 border-arcade-cyan/30 bg-cab-black p-2 motion-reduce:hidden">
        <canvas
          ref={canvasRef}
          width={BARS * (CELL_W + GAP) - GAP}
          height={SEGS * (CELL_H + GAP) - GAP}
          className="block w-full"
          aria-hidden
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={failed || stopped}
          aria-label={playing ? "Pause" : "Play"}
          className="btn btn-yellow-fill"
          style={{ padding: 8 }}
        >
          <Icon name={playing ? "pause" : "play"} />
        </button>
        {failed ? (
          <p className="flex-1 font-body text-lg leading-tight glow-red">
            This track won't load. Guess from the hints above.
          </p>
        ) : (
          <div className="flex-1">
            <input
              type="range"
              aria-label="Seek"
              min={0}
              max={duration || 30}
              step={0.1}
              value={time}
              onChange={(e) => {
                audioRef.current!.currentTime = Number(e.target.value);
              }}
              className="pixel-range w-full text-arcade-yellow"
              style={
                {
                  "--fill": `${duration ? (time / duration) * 100 : 0}%`,
                } as CSSProperties
              }
            />
            <div className="mt-1 flex justify-between font-body text-lg leading-none text-cyan-200/70">
              <span>{formatTime(time)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-arcade-cyan">
        <button
          onClick={() => {
            audioRef.current!.muted = !muted;
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="cursor-pointer hover:text-arcade-yellow"
        >
          <Icon name={shownVolume === 0 ? "muted" : "speaker"} />
        </button>
        <input
          type="range"
          aria-label="Volume"
          min={0}
          max={1}
          step={0.05}
          value={shownVolume}
          onChange={(e) => {
            const audio = audioRef.current!;
            audio.volume = Number(e.target.value);
            audio.muted = false;
          }}
          className="pixel-range flex-1"
          style={{ "--fill": `${shownVolume * 100}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
