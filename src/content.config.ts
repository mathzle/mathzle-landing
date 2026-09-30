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

const worldIds = ['ocean', 'forest', 'sky', 'sunset', 'berry', 'mint'] as const;
const curriculumCollection = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/curriculum' }),
  schema: z.object({
    rows: z.array(z.object({
      grade: z.number().int().min(1).max(5),
      cells: z.object(Object.fromEntries(worldIds.map((id) => [id, z.string()])) as Record<(typeof worldIds)[number], z.ZodString>),
    })).length(5),
  }),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'consentDate must be YYYY-MM-DD');
const teamCollection = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/team' }),
  schema: ({ image }) => z.object({
    people: z.array(z.object({
      role: z.enum(['founder', 'advisor']),
      name: z.string().min(2),
      title: z.string().min(2),
      bio: z.string().optional(),
      photo: image(),
      consentDate: isoDate,
    })),
  }),
});

export const collections = { faq: faqCollection, curriculum: curriculumCollection, team: teamCollection };
