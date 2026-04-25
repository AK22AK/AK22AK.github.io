import fs from 'node:fs';
import path from 'node:path';

export type DailyNewsItem = {
  title: string;
  summary: string;
  ai_summary?: string;
  url: string;
  source: string;
  topic: string;
  subtopic?: string;
  pub_time?: string;
  _idx?: number;
};

export type NewsRef = number | string;

export type TopicSummary = {
  topic: string;
  summary: string;
  highlights: string[];
};

export type DailyBrief = {
  title: string;
  summary: string;
  key_points: string[];
  generated_at?: string;
};

export type TopicReportSection = {
  type: 'schedule' | 'story' | 'results' | 'list' | 'table';
  title: string;
  content?: string;
  rows?: Array<Record<string, string>>;
  items?: string[];
};

export type TopicReport = {
  title: string;
  subtitle?: string;
  summary?: string;
  generated_at?: string;
  refs?: NewsRef[];
  sections: TopicReportSection[];
};

export type StoryCluster = {
  id: string;
  topic: string;
  subtopic?: string;
  title: string;
  summary: string;
  why_it_matters?: string;
  importance: 'lead' | 'major' | 'minor';
  confidence: 'high' | 'medium' | 'low';
  quality_reasons: string[];
  heat?: {
    level?: 'hot' | 'warm' | 'watch';
    score?: number;
    reasons?: string[];
  };
  refs: NewsRef[];
};

export type DigestSection = {
  heading: string;
  content: string;
  refs: NewsRef[];
};

export type SubtopicSectionGroup = {
  id: string;
  sections: DigestSection[];
};

export type DailyNewsData = {
  date: string;
  update_time?: string;
  daily_brief?: DailyBrief;
  story_clusters?: Array<Partial<StoryCluster> & {
    id: string;
    topic: string;
    title: string;
    summary: string;
    refs: NewsRef[];
  }>;
  topic_summaries?: TopicSummary[];
  subtopic_summaries?: Record<string, Array<{
    subtopic: string;
    name: string;
    summary: string;
    highlights: string[];
    count?: number;
  }>>;
  subtopic_sections?: Record<string, Record<string, { sections: DigestSection[] }>>;
  topic_reports?: Record<string, TopicReport>;
  items: DailyNewsItem[];
};

export type SourcesIndex = {
  date: string;
  generated_at?: string;
  total_items?: number;
  by_source?: Record<string, {
    topic?: string;
    count?: number;
    items?: Array<{ title: string; url: string; pub_time?: string }>;
  }>;
};

export type TopicConfig = {
  id: string;
  name: string;
  type?: string;
  description?: string;
  active?: boolean;
  sources?: Array<{ id: string; name: string; url?: string; frequency?: string }>;
  subtopics?: Array<{ id: string; name: string; description?: string; keywords?: string[] }>;
};

export const UNCATEGORIZED_SUBTOPIC = {
  id: 'uncategorized',
  name: '未分类',
  description: '未能归入既有子主题的资讯',
};

const TOPIC_ICONS: Record<string, string> = {
  tech: '⚡',
  game: '🎮',
  snooker: '🎱',
  sports: '🏟️',
};

const SUBTOPIC_ICONS: Record<string, string> = {
  'morning-brief': '🗞️',
  ai: '🤖',
  'consumer-electronics': '📱',
  mobility: '🚗',
  chips: '💾',
  'developer-tools': '🛠️',
  business: '🏢',
  community: '💬',
  arsenal: '🔴',
  'intl-football': '⚽',
  nba: '🏀',
  f1: '🏎️',
  tennis: '🎾',
  'general-sports': '🏅',
};

const IMPORTANCE_RANK: Record<StoryCluster['importance'], number> = {
  lead: 0,
  major: 1,
  minor: 2,
};

const HEAT_LEVEL_SCORE: Record<'hot' | 'warm' | 'watch', number> = {
  hot: 3,
  warm: 2,
  watch: 1,
};

const BRAND_KEYWORDS = [
  '苹果', 'iPhone', 'iPad', 'Mac', '小米', '华为', '三星', 'OPPO', 'vivo',
  '谷歌', 'Pixel', '特斯拉', '比亚迪', 'OpenAI', 'ChatGPT', 'Claude',
  '英伟达', 'NVIDIA', 'AMD', '英特尔', '微软', 'Meta', 'Steam',
  '腾讯', '阿里', '字节', '百度', '网易', 'B站', '哔哩哔哩',
  '微信', '抖音', '淘宝', '京东', '拼多多',
  '马云', '马化腾', '雷军', '马斯克',
  '宁德时代', '大疆',
];

export function readSourcesIndex(filePath = './src/data/daily-news-sources-index.json'): SourcesIndex | null {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf-8')) as SourcesIndex;
  } catch {
    return null;
  }
}

export function buildSourceMeta(topics: TopicConfig[]) {
  const meta = new Map<string, { name: string; url?: string; topic: string }>();
  for (const topic of topics) {
    for (const source of topic.sources || []) {
      meta.set(source.id, { name: source.name, url: source.url, topic: topic.id });
    }
  }
  return meta;
}

export function getTopicIcon(id: string) {
  return TOPIC_ICONS[id] || '•';
}

export function getSubtopicIcon(subtopicId: string | undefined) {
  if (!subtopicId) return '□';
  return SUBTOPIC_ICONS[subtopicId] || '□';
}

export function getSourceName(
  sourceId: string,
  sourceMeta: Map<string, { name: string }>,
) {
  return sourceMeta.get(sourceId)?.name || sourceId;
}

export function getSubtopicName(topic: TopicConfig | undefined, subtopicId: string | undefined) {
  if (!subtopicId) return '';
  if (subtopicId === UNCATEGORIZED_SUBTOPIC.id) return UNCATEGORIZED_SUBTOPIC.name;
  return topic?.subtopics?.find(subtopic => subtopic.id === subtopicId)?.name || subtopicId;
}

export function getItemSummary(item: DailyNewsItem): string {
  return item.ai_summary || item.summary;
}

export function formatDateLabel(date: string) {
  return date ? date.replace(/-/g, '.') : '';
}

export function getWeekdayLabel(date: string) {
  if (!date) return '';
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdayNames[new Date(`${date}T00:00:00`).getDay()] || '';
}

export function pubTimeValue(pubTime: string | undefined): number {
  if (!pubTime) return 0;
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(pubTime);
  const pub = new Date(hasTimezone ? pubTime : `${pubTime}Z`);
  return Number.isNaN(pub.getTime()) ? 0 : pub.getTime();
}

function hoursAgo(pubTime: string | undefined): number {
  const value = pubTimeValue(pubTime);
  if (!value) return 48;
  return Math.max(0, (Date.now() - value) / (1000 * 60 * 60));
}

function isMorningPost(title: string): boolean {
  const t = title.toLowerCase();
  return ['早报', '派早报', 'morning', '晨读', '今日早报'].some(kw => t.includes(kw));
}

function calcWeight(item: DailyNewsItem): number {
  let weight = 0;
  if (isMorningPost(item.title)) weight += 1000;
  if (BRAND_KEYWORDS.some(kw => item.title.includes(kw))) weight += 10;
  if (/\d/.test(item.title)) weight += 5;
  weight += (1 / (hoursAgo(item.pub_time) + 1)) * 50;
  return weight;
}

export function getTopItems(items: DailyNewsItem[], count = 5) {
  const seen = new Set<string>();
  return [...items]
    .filter(item => {
      const key = item.url || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => calcWeight(b) - calcWeight(a))
    .slice(0, count);
}

function topicOrder(topics: TopicConfig[]) {
  return new Map(topics.map((topic, index) => [topic.id, index]));
}

function normalizeImportance(value: unknown, index = 0): StoryCluster['importance'] {
  if (value === 'lead' || value === 'major' || value === 'minor') return value;
  return index === 0 ? 'lead' : index < 4 ? 'major' : 'minor';
}

function normalizeConfidence(value: unknown, refs: NewsRef[]): StoryCluster['confidence'] {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return refs.length >= 2 ? 'medium' : 'low';
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 48) || 'cluster';
}

function itemRef(item: DailyNewsItem, items: DailyNewsItem[]) {
  return item._idx || items.indexOf(item) + 1;
}

function firstNonEmpty(values: Array<string | undefined>) {
  return values.find(value => value && value.trim())?.trim() || '';
}

function compactText(value: string, maxLength = 132) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).replace(/[，。；、\s]+$/u, '')}...`;
}

function formatBriefSummary(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const clauses = normalized
    .split(/(?<=[。！？!?])|[；;]/u)
    .map(part => part.trim())
    .filter(Boolean);
  if (clauses.length <= 3) return normalized;
  return clauses.slice(0, 3).join('\n');
}

function formatBriefPoint(value: string) {
  return value
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferSubtopic(topic: TopicConfig | undefined, text: string) {
  if (!topic?.subtopics?.length) return undefined;
  const lowered = text.toLowerCase();
  let best: { id: string; score: number } | undefined;
  for (const subtopic of topic.subtopics) {
    const candidates = [subtopic.id, subtopic.name, ...(subtopic.keywords || [])];
    const score = candidates.reduce((sum, candidate) => {
      if (!candidate) return sum;
      const normalized = candidate.toLowerCase();
      if (!lowered.includes(normalized)) return sum;
      return sum + Math.max(1, Math.min(4, normalized.length / 2));
    }, 0);
    if (score > (best?.score || 0)) {
      best = { id: subtopic.id, score };
    }
  }
  return best?.id;
}

export function getItemSubtopic(item: DailyNewsItem, topic: TopicConfig | undefined) {
  if (topic?.id === 'tech') {
    const title = item.title.toLowerCase();
    const morningBrief = topic.subtopics?.find(subtopic => subtopic.id === 'morning-brief');
    if (morningBrief?.keywords?.some(keyword => title.includes(keyword.toLowerCase()))) {
      return 'morning-brief';
    }
  }
  return item.subtopic || inferSubtopic(topic, `${item.title} ${item.summary} ${item.ai_summary || ''}`);
}

export function normalizeDailyBrief(data: DailyNewsData | undefined, topics: TopicConfig[]): DailyBrief {
  if (data?.daily_brief) {
    return {
      ...data.daily_brief,
      summary: formatBriefSummary(data.daily_brief.summary),
      key_points: data.daily_brief.key_points.slice(0, 5).map(formatBriefPoint),
    };
  }

  const topicSummaries = data?.topic_summaries || [];
  const activeTopicNames = new Map(topics.map(topic => [topic.id, topic.name]));
  const keyPoints = topicSummaries
    .flatMap(summary => summary.highlights.length > 0
      ? summary.highlights.slice(0, 2)
      : [`${activeTopicNames.get(summary.topic) || summary.topic}：${summary.summary}`])
    .map(formatBriefPoint)
    .slice(0, 5);

  return {
    title: data?.date ? `${formatDateLabel(data.date)} 今日简报` : '今日简报',
    summary: formatBriefSummary(firstNonEmpty([
      topicSummaries.slice(0, 2).map(summary => summary.summary).join(' '),
      data?.items?.length ? `今日共抓取 ${data.items.length} 条资讯，按板块整理为可快速阅读的简报。` : '',
    ])),
    key_points: keyPoints,
    generated_at: data?.update_time,
  };
}

export function getDisplayQualityReasons(cluster: Pick<StoryCluster, 'quality_reasons' | 'refs'>) {
  const labels = (cluster.quality_reasons || [])
    .map(reason => reason
      .replace('多来源出现', '多来源')
      .replace('多条来源', '多来源')
      .replace('单一媒体', '单一来源')
      .replace('来源较少', '来源少')
      .trim())
    .filter(Boolean);
  if (labels.length > 0) return Array.from(new Set(labels)).slice(0, 4);
  return cluster.refs.length > 1 ? ['多来源'] : ['单一来源'];
}

export function getClusterHeat(cluster: Pick<StoryCluster, 'importance' | 'refs' | 'heat'>) {
  if (cluster.heat?.level && HEAT_LEVEL_SCORE[cluster.heat.level]) {
    return HEAT_LEVEL_SCORE[cluster.heat.level];
  }
  if (typeof cluster.heat?.score === 'number') {
    if (cluster.heat.score >= 75) return 3;
    if (cluster.heat.score >= 45) return 2;
    return 1;
  }

  let heat = cluster.importance === 'lead' ? 3 : cluster.importance === 'major' ? 2 : 1;
  if (cluster.refs.length >= 5 && heat < 3) heat += 1;
  if (cluster.refs.length <= 1) heat = 1;
  return Math.max(1, Math.min(3, heat));
}

export function getClusterHeatFlames(cluster: Pick<StoryCluster, 'importance' | 'refs' | 'heat'>) {
  return '🔥'.repeat(getClusterHeat(cluster));
}

export function getTopicReport(data: DailyNewsData | undefined, topicId: string) {
  const report = data?.topic_reports?.[topicId];
  if (!report?.sections?.length) return undefined;
  return report;
}

export function getTopicSubtopicSections(
  data: { subtopic_sections?: Record<string, Record<string, { sections: DigestSection[] }>> } | undefined,
  topicId: string,
): SubtopicSectionGroup[] {
  const topicSections = data?.subtopic_sections?.[topicId];
  if (!topicSections) return [];

  return Object.entries(topicSections)
    .map(([id, group]) => ({
      id,
      sections: (group.sections || []).filter(section =>
        section.heading.trim() || section.content.trim() || section.refs.length > 0
      ),
    }))
    .filter(group => group.sections.length > 0);
}

export function getSubtopicSections(
  groups: SubtopicSectionGroup[],
  subtopicId: string,
) {
  return groups.find(group => group.id === subtopicId)?.sections || [];
}

export function resolveSectionRefs(
  items: DailyNewsItem[],
  refs: NewsRef[],
  maxCount = 3,
) {
  return refs
    .map(ref => {
      if (typeof ref === 'number') {
        return items.find(item => item._idx === ref) || items[ref - 1];
      }

      const numericRef = Number(ref);
      if (Number.isFinite(numericRef) && String(numericRef) === ref.trim()) {
        return items.find(item => item._idx === numericRef) || items[numericRef - 1];
      }

      return items.find(item => item.url === ref);
    })
    .filter((item): item is DailyNewsItem => Boolean(item))
    .slice(0, maxCount);
}

export function resolveClusterRefs(
  items: DailyNewsItem[],
  cluster: Pick<StoryCluster, 'refs'>,
  maxCount = 4,
) {
  return resolveSectionRefs(items, cluster.refs, maxCount);
}

function normalizeExplicitClusters(data: DailyNewsData): StoryCluster[] {
  return (data.story_clusters || []).map((cluster, index) => {
    const refs = cluster.refs || [];
    return {
      id: cluster.id,
      topic: cluster.topic,
      subtopic: cluster.subtopic,
      title: cluster.title,
      summary: cluster.summary,
      why_it_matters: cluster.why_it_matters,
      importance: normalizeImportance(cluster.importance, index),
      confidence: normalizeConfidence(cluster.confidence, refs),
      quality_reasons: cluster.quality_reasons?.length ? cluster.quality_reasons : ['Hermes 生成'],
      heat: cluster.heat,
      refs,
    };
  });
}

function clustersFromSections(data: DailyNewsData, topics: TopicConfig[]): StoryCluster[] {
  const clusters: StoryCluster[] = [];
  for (const [topicId, subtopicMap] of Object.entries(data.subtopic_sections || {})) {
    const topic = topics.find(entry => entry.id === topicId);
    for (const [subtopicId, group] of Object.entries(subtopicMap || {})) {
      for (const [sectionIndex, section] of (group.sections || []).entries()) {
        const refs = section.refs || [];
        const inferredSubtopic = subtopicId === 'general'
          ? inferSubtopic(topic, `${section.heading} ${section.content}`)
          : subtopicId;
        clusters.push({
          id: `${topicId}-${subtopicId}-${slugify(section.heading || String(sectionIndex + 1))}`,
          topic: topicId,
          subtopic: inferredSubtopic,
          title: section.heading || '未命名线索',
          summary: section.content || 'Hermes 生成了该线索，但没有补充详细说明。',
          why_it_matters: refs.length > 1 ? '多条来源共同指向同一线索。' : undefined,
          importance: clusters.length === 0 ? 'lead' : sectionIndex < 2 ? 'major' : 'minor',
          confidence: refs.length >= 2 ? 'medium' : 'low',
          quality_reasons: refs.length >= 2 ? ['多来源出现'] : ['单一来源'],
          refs,
        });
      }
    }
  }
  return clusters;
}

function clustersFromTopicSummaries(data: DailyNewsData, existing: StoryCluster[]): StoryCluster[] {
  const seenTopics = new Set(existing.map(cluster => cluster.topic));
  return (data.topic_summaries || [])
    .filter(summary => !seenTopics.has(summary.topic))
    .map((summary, index) => {
      const topicItems = getTopItems(data.items.filter(item => item.topic === summary.topic), 4);
      const refs = topicItems.map(item => itemRef(item, data.items));
      return {
        id: `${summary.topic}-overview`,
        topic: summary.topic,
        title: '今日看点',
        summary: summary.summary,
        why_it_matters: summary.highlights.slice(0, 1)[0],
        importance: index === 0 ? 'lead' : 'major',
        confidence: refs.length >= 2 ? 'medium' : 'low',
        quality_reasons: ['板块总结', refs.length >= 2 ? '多条来源' : '来源较少'],
        refs,
      };
    });
}

function clustersFromItems(data: DailyNewsData, topics: TopicConfig[], existing: StoryCluster[]): StoryCluster[] {
  const seenTopics = new Set(existing.map(cluster => cluster.topic));
  return topics
    .filter(topic => topic.active !== false && !seenTopics.has(topic.id))
    .flatMap(topic => {
      const items = getTopItems(data.items.filter(item => item.topic === topic.id), 3);
      return items.map((item, index) => ({
        id: `${topic.id}-${slugify(item.title)}`,
        topic: topic.id,
        subtopic: getItemSubtopic(item, topic),
        title: item.title,
        summary: getItemSummary(item),
        why_it_matters: '旧数据没有故事簇，前端按权重从原始新闻中提取。',
        importance: index === 0 ? 'major' as const : 'minor' as const,
        confidence: item.source === 'v2ex' ? 'low' as const : 'medium' as const,
        quality_reasons: item.source === 'v2ex' ? ['社区讨论'] : ['旧数据回退'],
        refs: [itemRef(item, data.items)],
      }));
    });
}

export function normalizeStoryClusters(data: DailyNewsData | undefined, topics: TopicConfig[]): StoryCluster[] {
  if (!data) return [];

  const explicit = normalizeExplicitClusters(data);
  const sectionClusters = explicit.length > 0 ? [] : clustersFromSections(data, topics);
  const summaryClusters = explicit.length > 0 ? [] : clustersFromTopicSummaries(data, sectionClusters);
  const itemClusters = explicit.length > 0 ? [] : clustersFromItems(data, topics, [...sectionClusters, ...summaryClusters]);
  const order = topicOrder(topics);

  return [...explicit, ...sectionClusters, ...summaryClusters, ...itemClusters]
    .filter(cluster => cluster.title.trim() && cluster.summary.trim())
    .sort((a, b) => {
      const importanceDiff = IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance];
      if (importanceDiff !== 0) return importanceDiff;
      return (order.get(a.topic) ?? 999) - (order.get(b.topic) ?? 999);
    });
}

export function getTopicClusters(clusters: StoryCluster[], topicId: string) {
  return clusters.filter(cluster => cluster.topic === topicId);
}

export function getLeadClusters(clusters: StoryCluster[], maxCount = 6) {
  return clusters.slice(0, maxCount);
}

export function getClusterSourceSummary(
  cluster: StoryCluster,
  items: DailyNewsItem[],
  sourceMeta: Map<string, { name: string }>,
) {
  const names = resolveClusterRefs(items, cluster, 4)
    .map(item => getSourceName(item.source, sourceMeta));
  return Array.from(new Set(names));
}

export function groupItemsBySubtopic(items: DailyNewsItem[], topic: TopicConfig) {
  const groups = new Map<string, DailyNewsItem[]>();
  for (const item of items) {
    const subtopicId = getItemSubtopic(item, topic) || UNCATEGORIZED_SUBTOPIC.id;
    if (!groups.has(subtopicId)) groups.set(subtopicId, []);
    groups.get(subtopicId)!.push(item);
  }

  const configured = topic.subtopics || [];
  const orderedIds = [
    ...configured.map(subtopic => subtopic.id),
    ...Array.from(groups.keys()).filter(id => !configured.some(subtopic => subtopic.id === id)),
  ];

  return orderedIds
    .map(id => ({
      id,
      name: getSubtopicName(topic, id),
      items: groups.get(id) || [],
    }))
    .filter(group => group.items.length > 0);
}

export function groupItemsBySource(
  items: DailyNewsItem[],
  sourcesIndex: SourcesIndex | null,
  currentDate: string,
  sourceMeta: Map<string, { name: string; url?: string; topic: string }>,
) {
  const order = sourcesIndex?.date === currentDate && sourcesIndex.by_source
    ? Object.keys(sourcesIndex.by_source)
    : [];
  const seenOrder = new Set(order);

  for (const item of items) {
    if (!seenOrder.has(item.source)) {
      order.push(item.source);
      seenOrder.add(item.source);
    }
  }

  return order
    .map(sourceId => {
      const sourceItems = items.filter(item => item.source === sourceId);
      if (sourceItems.length === 0) return null;

      const indexedSource = sourcesIndex?.date === currentDate
        ? sourcesIndex.by_source?.[sourceId]
        : undefined;
      const meta = sourceMeta.get(sourceId);

      return {
        id: sourceId,
        name: meta?.name || sourceId,
        url: meta?.url,
        topic: indexedSource?.topic || meta?.topic || sourceItems[0]?.topic || '',
        count: sourceItems.length,
        items: sourceItems,
      };
    })
    .filter((group): group is NonNullable<typeof group> => Boolean(group));
}
