/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';

interface Item { id: string; question: string; answerHtml: string }
interface Props { items: Item[] }

export default function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const fromHash = () => {
      const id = location.hash.replace(/^#faq-/, '');
      if (items.some((i) => i.id === id)) {
        setOpen(id);
        document.getElementById(`faq-${id}`)?.scrollIntoView({ block: 'start' });
      }
    };
    fromHash();
    addEventListener('hashchange', fromHash);
    return () => removeEventListener('hashchange', fromHash);
  }, []);

  return (
    <ul class="faq-list">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <li class={`faq-item ${isOpen ? 'is-open' : ''}`} id={`faq-${item.id}`}>
            <button type="button" class="faq-q" aria-expanded={isOpen} aria-controls={`faq-a-${item.id}`}
              onClick={() => setOpen(isOpen ? null : item.id)}>
              <span class="faq-q-text">{item.question}</span>
              <span class="faq-chev" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div id={`faq-a-${item.id}`} class="faq-a" role="region" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />}
          </li>
        );
      })}
    </ul>
  );
}
