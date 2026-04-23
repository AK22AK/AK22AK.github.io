import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
  schema: z.object({
    date: z.string(),
    update_time: z.string().optional(),
    topic_summaries: z.array(
      z.object({
        topic: z.string(),
        summary: z.string(),
        highlights: z.array(z.string()),
      })
    ).optional(),
    items: z.array(
      z.object({
        title: z.string(),
        summary: z.string(),
        ai_summary: z.string().optional(),
        url: z.string().url(),
        source: z.string(),
        topic: z.string(),
        pub_time: z.string().optional(),
      })
    ),
  }),
});

export const collections = { blog, 'daily-news': dailyNews };
