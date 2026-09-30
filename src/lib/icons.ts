import {
  ArrowRight, Ban, ChartColumn, Check, Clock, Gamepad2, Lightbulb, Lock, Mail, Menu,
  MessageCircle, MessageCircleOff, Pause, Play, RotateCcw, Server, ShieldCheck, Sparkles,
  Timer, Trash2, Users, X,
} from 'lucide-static';

/** Only icons the site uses — keeps the SSR bundle small and the set reviewable. */
export const ICONS = {
  ArrowRight, Ban, ChartColumn, Check, Clock, Gamepad2, Lightbulb, Lock, Mail, Menu,
  MessageCircle, MessageCircleOff, Pause, Play, RotateCcw, Server, ShieldCheck, Sparkles,
  Timer, Trash2, Users, X,
} as const;

export type IconName = keyof typeof ICONS;

export function iconSvg(name: IconName, size = 24): string {
  return ICONS[name]
    .trim()
    .replace('width="24"', `width="${size}"`)
    .replace('height="24"', `height="${size}"`)
    .replace('<svg', '<svg aria-hidden="true" focusable="false"');
}
