import { FlashMode, VideoQuality } from "expo-camera";

export type CapturedMedia = {
  uri: string;
  type: "photo" | "video";
  timestamp: number;
  width?: number;
  height?: number;
};

export type ZoomLevel = {
  label: string;
  value: number;
};

export const ZOOM_LEVELS: ZoomLevel[] = [
  { label: "0.5×", value: 0 },
  { label: "1×", value: 0.0 },
  { label: "2×", value: 0.03 },
  { label: "5×", value: 0.08 },
];

export const FLASH_CYCLE: FlashMode[] = ["off", "on", "auto"];

export const FLASH_ICONS: Record<FlashMode, string> = {
  off: "flash-off",
  on: "flash",
  auto: "flash-outline",
};

export const VIDEO_QUALITY_OPTIONS: { label: string; value: VideoQuality }[] = [
  { label: "2160p", value: "2160p" },
  { label: "1080p", value: "1080p" },
  { label: "720p", value: "720p" },
  { label: "480p", value: "480p" },
];
