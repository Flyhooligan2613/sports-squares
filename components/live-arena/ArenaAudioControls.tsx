"use client";

interface ArenaAudioControlsProps {
  muted: boolean;
  volume: number;
  onMutedChange: (muted: boolean) => void;
  onVolumeChange: (volume: number) => void;
}

export default function ArenaAudioControls({
  muted,
  volume,
  onMutedChange,
  onVolumeChange,
}: ArenaAudioControlsProps) {
  return (
    <div className="la-audio-controls flex items-center gap-3">
      <button
        type="button"
        onClick={() => onMutedChange(!muted)}
        className="la-audio-toggle flex items-center gap-1.5 text-[10px] text-sb-muted hover:text-white transition-colors min-h-[44px] min-w-[44px] px-2"
        aria-label={muted ? "Unmute arena sound" : "Mute arena sound"}
      >
        <span className="text-sm" aria-hidden>
          {muted ? "🔇" : "🔊"}
        </span>
        {muted ? "Muted" : "Sound"}
      </button>
      <label className="flex items-center gap-2 flex-1 max-w-[140px]">
        <span className="sr-only">Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="la-volume-slider flex-1 h-2 min-h-[44px] accent-blue-400 cursor-pointer"
          disabled={muted}
        />
      </label>
    </div>
  );
}
