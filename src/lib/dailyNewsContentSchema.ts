import { z } from 'zod';

export const newsRefSchema = z.union([z.number(), z.string()]);

export const dailyHomeTargetSchema = z.object({
  type: z.enum(['topic', 'dailyLine', 'subtopic', 'special']),
  topicSlug: z.string().optional(),
  dailyLineId: z.string().optional(),
  subtopicId: z.string().optional(),
  specialSlug: z.string().optional(),
  href: z.string().optional(),
});

export const refEntrySchema = z.object({
  id: z.string().optional(),
  ref: newsRefSchema,
  label: z.string().optional(),
  categoryLabel: z.string().optional(),
  storyLabel: z.string().optional(),
  note: z.string().optional(),
});

export const topicPageSchema = z.object({
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
    items: z.array(refEntrySchema),
  })),
  otherItems: z.array(refEntrySchema),
  sources: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    count: z.number(),
    description: z.string().optional(),
  })).optional(),
});

export const sportsMatchEntrySchema = z.object({
  id: z.string(),
  timeLabel: z.string().optional(),
  title: z.string(),
  competition: z.string().optional(),
  startTime: z.string().optional(),
  resultTime: z.string().optional(),
  home: z.string().optional(),
  away: z.string().optional(),
  playerA: z.string().optional(),
  playerB: z.string().optional(),
  score: z.string().optional(),
  note: z.string().optional(),
  status: z.enum(['result', 'fixture']),
  reason: z.string().optional(),
  importance: z.string().optional(),
  priority: z.union([z.number(), z.string()]).optional(),
  url: z.string().optional(),
});

export const sportsStorylineSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).optional(),
  items: z.array(refEntrySchema),
});

export const sportsPageSchema = z.object({
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
    kind: z.enum(['sport', 'league', 'team', 'tournament', 'athletes', 'fantasy', 'mixed']),
    matchStatus: z.array(sportsMatchEntrySchema).optional(),
    fixtures: z.array(sportsMatchEntrySchema).optional(),
    storylines: z.array(sportsStorylineSchema).optional(),
    items: z.array(refEntrySchema),
    deeperPageHref: z.string().optional(),
  })),
  otherItems: z.array(refEntrySchema),
  sources: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    count: z.number(),
    description: z.string().optional(),
  })).optional(),
});

export const dailyNewsEntrySchema = z.object({
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
      target: dailyHomeTargetSchema,
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
      refs: z.array(newsRefSchema),
    })
  ).optional(),
  topic_reports: z.record(
    z.string(),
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      summary: z.string().optional(),
      generated_at: z.string().optional(),
      refs: z.array(newsRefSchema).optional(),
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
            refs: z.array(newsRefSchema),
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
});
