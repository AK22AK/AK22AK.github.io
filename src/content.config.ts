import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const newsRef = z.union([z.number(), z.string()]);

const dailyHomeTarget = z.object({
  type: z.enum(['topic', 'dailyLine', 'subtopic', 'special']),
  topicSlug: z.string().optional(),
  dailyLineId: z.string().optional(),
  subtopicId: z.string().optional(),
  specialSlug: z.string().optional(),
  href: z.string().optional(),
});

const refEntry = z.object({
  id: z.string().optional(),
  ref: newsRef,
  label: z.string().optional(),
  note: z.string().optional(),
});

const topicPageSchema = z.object({
  stats: z.object({
    rawItems: z.number().optional(),
    sources: z.number().optional(),
    dailyLines: z.number().optional(),
  }).optional(),
  overview: z.array(z.object({
    id: z.string(),
    dailyLineId: z.string(),
    text: z.string(),
  })),
  morningBriefs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    url: z.string().url(),
    source: z.string(),
  })),
  dailyLines: z.array(z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    items: z.array(refEntry),
  })),
  otherItems: z.array(refEntry),
  sources: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    count: z.number(),
    description: z.string().optional(),
  })).optional(),
});

const sportsPageSchema = z.object({
  stats: z.object({
    rawItems: z.number().optional(),
    sources: z.number().optional(),
    subtopics: z.number().optional(),
  }).optional(),
  overview: z.array(z.object({
    id: z.string(),
    subtopicId: z.string(),
    text: z.string(),
  })),
  subtopics: z.array(z.object({
    id: z.string(),
    label: z.string(),
    title: z.string(),
    summary: z.string(),
    kind: z.enum(['sport', 'league', 'team', 'tournament', 'athletes', 'mixed']),
    matchStatus: z.array(z.object({
      id: z.string(),
      timeLabel: z.enum(['yesterday', 'last_night', 'this_morning', 'today', 'tonight']),
      title: z.string(),
      competition: z.string().optional(),
      startTime: z.string().optional(),
      home: z.string().optional(),
      away: z.string().optional(),
      score: z.string().optional(),
      note: z.string().optional(),
      status: z.enum(['result', 'fixture']),
      url: z.string().url().optional(),
    })).optional(),
    items: z.array(refEntry),
    deeperPageHref: z.string().optional(),
  })),
  otherItems: z.array(refEntry),
  sources: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    count: z.number(),
    description: z.string().optional(),
  })).optional(),
});

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
    daily_home: z.object({
      intro: z.string(),
      stats: z.object({
        rawItems: z.number().optional(),
        topics: z.number().optional(),
        highlights: z.number().optional(),
      }).optional(),
      highlights: z.array(z.object({
        id: z.string(),
        title: z.string(),
        summary: z.string(),
        label: z.string(),
        target: dailyHomeTarget,
      })),
    }).optional(),
    topic_pages: z.record(z.string(), topicPageSchema).optional(),
    sports_page: sportsPageSchema.optional(),
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
