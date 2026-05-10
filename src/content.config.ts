import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { dailyNewsEntrySchema } from './lib/dailyNewsContentSchema';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const dailyNews = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/daily-news' }),
  schema: dailyNewsEntrySchema,
});

export const collections = { blog, 'daily-news': dailyNews };
