import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faqCollection = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/faq' }),
  schema: z.object({
    items: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    ),
  }),
});

export const collections = { faq: faqCollection };
