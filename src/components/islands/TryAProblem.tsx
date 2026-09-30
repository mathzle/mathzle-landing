/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { PROBLEMS, isCorrect, nextIndex } from './problems';

export interface TryStrings {
  title: string;
  prompt: string;
  correct: string;
  next: string;
  hints: string[];
}
interface Props {
  variant: 'stage' | 'sticker';
  strings: TryStrings;
  mascot: { idle: string; cheer: string; think: string };
}

export default function TryAProblem({ variant, strings, mascot }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const p = PROBLEMS[idx];
  const solved = picked !== null && isCorrect(p, picked);
  const wrong = picked !== null && !solved;
  const face = solved ? mascot.cheer : wrong ? mascot.think : mascot.idle;

  return (
    <div class={`tap tap--${variant}`}>
      <div class="tap-head">
        <img src={face} width={48} height={48} alt="" />
        <div>
          <p class="tap-title">{strings.title}</p>
          <p class="tap-prompt">{strings.prompt}</p>
        </div>
      </div>
      <p class="tap-q">
        {p.a} {p.op} {p.b} = <span class="tap-blank">{solved ? p.answer : '?'}</span>
      </p>
      <div class="tap-choices" role="group" aria-label={strings.prompt}>
        {p.choices.map((c) => (
          <button
            type="button"
            class={`tap-choice${picked === c ? (solved ? ' is-right' : ' is-wrong') : ''}`}
            aria-pressed={picked === c}
            disabled={solved}
            onClick={() => setPicked(c)}
            data-track="try-answer"
          >
            {c}
          </button>
        ))}
      </div>
      <p class="tap-feedback" role="status" aria-live="polite">
        {solved ? strings.correct : wrong ? strings.hints[idx] : ''}
      </p>
      {solved && (
        <button
          type="button"
          class="tap-next"
          onClick={() => { setIdx(nextIndex(idx)); setPicked(null); }}
          data-track="try-next"
        >
          {strings.next} →
        </button>
      )}
    </div>
  );
}
