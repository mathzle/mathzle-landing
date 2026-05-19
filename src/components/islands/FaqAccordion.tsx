/** @jsxImportSource preact */
import { useState } from 'preact/hooks';

interface FaqItem {
  question: string;
  answer: string;
}
interface Props {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul class="faq-list">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <li class={`faq-item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              class="faq-q"
              aria-expanded={isOpen}
              aria-controls={`faq-a-${idx}`}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <span class="faq-q-text">{item.question}</span>
              <span class="faq-chev" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div id={`faq-a-${idx}`} class="faq-a" role="region">
                {item.answer}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
