import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const newsRef = z.union([z.number(), z.string()]);

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
    daily_brief: z.object({
      title: z.string(),
      summary: z.string(),
      key_points: z.array(z.string()),
      generated_at: z.string().optional(),
    }).optional(),
    story_clusters: z.array(
      z.object({
        id: z.string(),
        topic: z.string(),
        subtopic: z.string().optional(),
        title: z.string(),
        summary: z.string(),
        why_it_matters: z.string().optional(),
        importance: z.enum(['lead', 'major', 'minor']).optional(),
        confidence: z.enum(['high', 'medium', 'low']).optional(),
        quality_reasons: z.array(z.string()).optional(),
        refs: z.array(newsRef),
      })
    ).optional(),
    topic_reports: z.record(
      z.string(),
      z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        summary: z.string().optional(),
        generated_at: z.string().optional(),
        refs: z.array(newsRef).optional(),
        sections: z.array(
          z.object({
            type: z.enum(['schedule', 'story', 'results', 'list', 'table']),
            title: z.string(),
            content: z.string().optional(),
            rows: z.array(z.record(z.string(), z.string())).optional(),
            items: z.array(z.string()).optional(),
          })
        ),
      })
    ).optional(),
    topic_summaries: z.array(
      z.object({
        topic: z.string(),
        summary: z.string(),
        highlights: z.array(z.string()),
      })
    ).optional(),
    subtopic_summaries: z.record(
      z.string(),
      z.array(
        z.object({
          subtopic: z.string(),
          name: z.string(),
          summary: z.string(),
          highlights: z.array(z.string()),
          count: z.number().optional(),
        })
      )
    ).optional(),
    subtopic_sections: z.record(
      z.string(),
      z.record(
        z.string(),
        z.object({
          sections: z.array(
            z.object({
              heading: z.string(),
              content: z.string(),
              refs: z.array(newsRef),
            })
          ),
        })
      )
    ).optional(),
    items: z.array(
      z.object({
        title: z.string(),
        summary: z.string(),
        ai_summary: z.string().optional(),
        url: z.string().url(),
        source: z.string(),
        topic: z.string(),
        subtopic: z.string().optional(),
        pub_time: z.string().optional(),
        _idx: z.number().optional(),
      })
    ),
  }),
});

export const collections = { blog, 'daily-news': dailyNews };
