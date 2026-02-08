import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Snap-to-grid utilities for drag-and-drop
export const SNAP_MINUTES = 30;
export const START_HOUR = 6;
export const END_HOUR = 23;

export function snapToTimeSlot(y: number, hourHeight: number = 60): Date {
  const minutesPerPixel = 60 / hourHeight;
  const rawMinutes = y * minutesPerPixel;
  const snappedMinutes = Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES;
  const hour = Math.floor(snappedMinutes / 60) + START_HOUR;
  const minute = snappedMinutes % 60;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function snapToDayColumn(x: number, dayWidth: number): number {
  return Math.round(x / dayWidth) * dayWidth;
}

export function getTimeFromY(y: number, hourHeight: number = 60): { hour: number; minute: number } {
  const minutes = (y / hourHeight) * 60;
  const totalMinutes = Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  return {
    hour: Math.floor(totalMinutes / 60) + START_HOUR,
    minute: totalMinutes % 60
  };
}