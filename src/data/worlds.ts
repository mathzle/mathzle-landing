import type { ImageMetadata } from 'astro';
import CountingCove from '../assets/worlds/CountingCove.png';
import NumberForest from '../assets/worlds/NumberForest.png';
import LogicSky from '../assets/worlds/LogicSky.png';
import PatternPeaks from '../assets/worlds/PatternPeaks.png';
import FractionFields from '../assets/worlds/FractionFields.png';
import MeasurementMeadow from '../assets/worlds/MeasurementMeadow.png';

export type WorldId = 'ocean' | 'forest' | 'sky' | 'sunset' | 'berry' | 'mint';
export interface World {
  id: WorldId;
  color: string;
  symbol: string;
  image: ImageMetadata;
  grades: { from: number; to: number };
}

export const WORLDS: readonly World[] = [
  { id: 'ocean',  color: 'var(--color-world-ocean)',  symbol: '+', image: CountingCove,      grades: { from: 1, to: 2 } },
  { id: 'forest', color: 'var(--color-world-forest)', symbol: '×', image: NumberForest,      grades: { from: 2, to: 3 } },
  { id: 'sky',    color: 'var(--color-world-sky)',    symbol: '?', image: LogicSky,          grades: { from: 3, to: 4 } },
  { id: 'sunset', color: 'var(--color-world-sunset)', symbol: '△', image: PatternPeaks,      grades: { from: 2, to: 4 } },
  { id: 'berry',  color: 'var(--color-world-berry)',  symbol: '½', image: FractionFields,    grades: { from: 3, to: 5 } },
  { id: 'mint',   color: 'var(--color-world-mint)',   symbol: '⏱', image: MeasurementMeadow, grades: { from: 1, to: 3 } },
];
