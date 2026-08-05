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
  feed_events?: DailyNewsFeedEvent[];
  daily_home?: DailyNewsHomeContract;
  topic_pages?: Record<string, GenericTopicPageContract>;
  sports_page?: SportsTopicPageContract;
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

export type DailyNewsHomeTarget = {
  type: 'topic' | 'dailyLine' | 'subtopic' | 'special';
  topicSlug?: string;
  dailyLineId?: string;
  subtopicId?: string;
  specialSlug?: string;
  href?: string;
};

export type DailyNewsHomeContract = {
  intro: string;
  stats?: {
    rawItems?: number;
    topics?: number;
    highlights?: number;
  };
  highlights: Array<{
    id: string;
    title: string;
    summary: string;
    label: string;
    target: DailyNewsHomeTarget;
  }>;
};

export type DailyNewsFeedRef = {
  title: string;
  summary: string;
  url: string;
  sourceId: string;
  sourceName: string;
  pubTime?: string;
};

export type DailyNewsFeedEvent = {
  id: string;
  title: string;
  summary: string;
  module: string;
  subModule?: string;
  refs: Array<{
    ref: NewsRef;
    source?: string;
    _title?: string;
  }>;
  priority?: number;
  rank?: number;
};

export type DailyNewsFeedSourceGroup = {
  sourceId: string;
  sourceName: string;
  refs: DailyNewsFeedRef[];
};

export type DailyNewsFeedItem = {
  id: string;
  rank: string;
  title: string;
  summary: string;
  fieldId: string;
  fieldName: string;
  subtopicId?: string;
  subtopicName?: string;
  importance: StoryCluster['importance'];
  heat: number;
  sourceNames: string[];
  sourceCount: number;
  refs: DailyNewsFeedRef[];
  sourceGroups: DailyNewsFeedSourceGroup[];
};

export type DailyNewsMorningBrief = {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  fieldId: string;
  fieldName: string;
  pubTime?: string;
};

export type DailyNewsFieldFilter = {
  id: string;
  name: string;
  href: string;
  count: number;
  active: boolean;
};

export type DailyNewsFeedView = {
  date: string;
  dateLabel: string;
  weekdayLabel: string;
  updatedAtLabel: string;
  selectedField: string;
  stats: {
    rawItems: number;
    feedItems: number;
    fields: number;
    sources: number;
  };
  filters: DailyNewsFieldFilter[];
  morningBriefs: DailyNewsMorningBrief[];
  feedItems: DailyNewsFeedItem[];
  archive: Array<{
    date: string;
    label: string;
    href: string;
  }>;
};

export type RefEntry = {
  id?: string;
  ref: NewsRef;
  label?: string;
  categoryLabel?: string;
  storyLabel?: string;
  note?: string;
};

export type SportsMatchEntry = {
  id: string;
  timeLabel?: 'yesterday' | 'last_night' | 'this_morning' | 'today' | 'tonight' | string;
  title: string;
  competition?: string;
  startTime?: string;
  resultTime?: string;
  home?: string;
  away?: string;
  playerA?: string;
  playerB?: string;
  score?: string;
  note?: string;
  status: 'result' | 'fixture';
  priority?: number | string;
  reason?: string;
  url?: string;
};

export type GenericTopicPageContract = {
  stats?: {
    rawItems?: number;
    sources?: number;
    dailyLines?: number;
  };
  overviewSummary?: string;
  takeaway?: string;
  overview: Array<{
    id: string;
    dailyLineId: string;
    text: string;
  }>;
  morningBriefs: Array<{
    id: string;
    title: string;
    url: string;
    source: string;
  }>;
  dailyLines: Array<{
    id: string;
    title: string;
    summary: string;
    tags: string[];
    items: RefEntry[];
  }>;
  otherItems: RefEntry[];
  sources?: Array<{
    id?: string;
    name: string;
    count: number;
    description?: string;
  }>;
};

export type SportsTopicPageContract = {
  stats?: {
    rawItems?: number;
    sources?: number;
    subtopics?: number;
  };
  overview: Array<{
    id: string;
    subtopicId: string;
    text: string;
  }>;
  subtopics: Array<{
    id: string;
    label: string;
    title: string;
    summary: string;
    kind: 'sport' | 'league' | 'team' | 'tournament' | 'athletes' | 'fantasy' | 'mixed';
    matchStatus?: SportsMatchEntry[];
    fixtures?: SportsMatchEntry[];
    storylines?: Array<{
      id: string;
      title: string;
      summary: string;
      tags?: string[];
      items: RefEntry[];
    }>;
    items: RefEntry[];
    deeperPageHref?: string;
  }>;
  otherItems: RefEntry[];
  sources?: Array<{
    id?: string;
    name: string;
    count: number;
    description?: string;
  }>;
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
  football: '⚽',
  fpl: '⚽',
  'snooker-world-championship': '🎱',
  basketball: '🏀',
  racing: '🏎️',
  tennis: '🎾',
  'asian-athletes': '🏅',
  other: '•',
};

const SUBTOPIC_LABEL_OVERRIDES: Record<string, string> = {
  ai: 'AI',
  'consumer-electronics': '消费电子',
  mobility: '汽车与出行',
  chips: '芯片与硬件产业',
  'developer-tools': '开发者工具',
  business: '公司与商业',
  community: '社区',
  football: '足球',
  fpl: 'FPL',
  'snooker-world-championship': '斯诺克世锦赛',
  basketball: '篮球',
  racing: '赛车',
  tennis: '网球',
  'asian-athletes': '中国与亚洲选手',
  other: '其他值得看',
  'general-sports': '综合体育',
  'consumer electronics': '消费电子',
  'developer tools': '开发者工具',
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
  return topic?.subtopics?.find(subtopic => subtopic.id === subtopicId)?.name
    || SUBTOPIC_LABEL_OVERRIDES[subtopicId]
    || subtopicId;
}

export function getDisplayLabel(
  topic: TopicConfig | undefined,
  label: string | undefined,
  subtopicId?: string,
) {
  const normalized = (label || '').trim();
  if (subtopicId) return getSubtopicName(topic, subtopicId);
  if (!normalized) return '';
  return SUBTOPIC_LABEL_OVERRIDES[normalized]
    || SUBTOPIC_LABEL_OVERRIDES[normalized.toLowerCase()]
    || normalized;
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
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return '';
  return weekdayNames[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] || '';
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
      const topicItems = data.items.filter(item => item.topic === topic.id);
      const topItems = getTopItems(topicItems, 30);
      const v2exItems = getTopItems(
        topicItems.filter(item => item.source === 'v2ex'),
        10,
      );
      const selectedItems = [
        ...topItems,
        ...v2exItems.filter(item => !topItems.some(topItem => topItem.url === item.url)),
      ];
      return selectedItems.map((item, index) => ({
        id: `${topic.id}-${slugify(item.title)}`,
        topic: topic.id,
        subtopic: getItemSubtopic(item, topic),
        title: item.title,
        summary: getItemSummary(item),
        why_it_matters: '旧数据没有故事簇，前端按权重从原始新闻中提取。',
        importance: index < 3 ? 'major' as const : 'minor' as const,
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

function textTokens(value: string) {
  const normalized = value.toLowerCase();
  const latin = normalized.match(/[a-z0-9]+/g) || [];
  const cjk = Array.from(normalized.matchAll(/[\u4e00-\u9fa5]/g)).map(match => match[0]);
  return new Set([...latin, ...cjk]);
}

function textOverlapScore(a: string, b: string) {
  const left = textTokens(a);
  const right = textTokens(b);
  let score = 0;
  for (const token of left) {
    if (right.has(token)) score += token.length > 1 ? 2 : 1;
  }
  return score;
}

function resolveFeedRefs(
  items: DailyNewsItem[],
  refs: Array<NewsRef | (RefEntry & { source?: string; _title?: string })>,
  sourceMeta: Map<string, { name: string }>,
  maxCount = 4,
): DailyNewsFeedRef[] {
  return refs
    .map(ref => {
      const item = typeof ref === 'object'
        ? resolveFeedRefItem(items, ref)
        : resolveRefItem(items, ref);
      if (!item) return undefined;
      return {
        item,
        sourceId: typeof ref === 'object' && ref.source ? ref.source : item.source,
      };
    })
    .filter((entry): entry is { item: DailyNewsItem; sourceId: string } => Boolean(entry))
    .slice(0, maxCount)
    .map(({ item, sourceId }) => ({
      title: item.title,
      summary: getItemSummary(item),
      url: item.url,
      sourceId,
      sourceName: getSourceName(sourceId, sourceMeta),
      pubTime: item.pub_time,
    }));
}

function normalizeRefTitle(value: string | undefined) {
  return (value || '').replace(/\s+/g, '').trim();
}

function resolveFeedRefItem(
  items: DailyNewsItem[],
  ref: RefEntry & { source?: string; _title?: string },
) {
  const refValue = typeof ref.ref === 'number' ? ref.ref : Number(ref.ref);
  const hasNumericRef = Number.isFinite(refValue) && String(refValue) === String(ref.ref).trim();
  const expectedTitle = normalizeRefTitle(ref._title);
  const exactMatches = items.filter(item => {
    if (hasNumericRef && item._idx !== refValue) return false;
    if (ref.source && item.source !== ref.source) return false;
    if (expectedTitle && normalizeRefTitle(item.title) !== expectedTitle) return false;
    return true;
  });
  if (exactMatches.length === 1) return exactMatches[0];

  if (ref.source && expectedTitle) {
    const sourceTitleMatches = items.filter(item =>
      item.source === ref.source && normalizeRefTitle(item.title) === expectedTitle
    );
    if (sourceTitleMatches.length === 1) return sourceTitleMatches[0];
  }

  return resolveRefItem(items, ref.ref);
}

function getHomeTargetKey(target: DailyNewsHomeTarget) {
  return [
    target.type,
    target.topicSlug || '',
    target.dailyLineId || '',
    target.subtopicId || '',
    target.specialSlug || '',
    target.href || '',
  ].join(':');
}

function getHomeTargetCluster(data: DailyNewsData, highlight: DailyNewsHomeContract['highlights'][number]) {
  const target = highlight.target;

  if (target.type === 'dailyLine') {
    const line = getTargetDailyLine(data, target);
    return {
      id: `${target.topicSlug || 'topic'}-${target.dailyLineId || highlight.id}`,
      title: line?.title?.trim() || highlight.title,
      summary: line?.summary?.trim() || highlight.summary,
      refs: line?.items || [],
    };
  }

  if (target.type === 'subtopic' && target.topicSlug === 'sports' && target.subtopicId) {
    const subtopic = data.sports_page?.subtopics.find(entry => entry.id === target.subtopicId);
    if (!subtopic) {
      return {
        id: highlight.id,
        title: highlight.title,
        summary: highlight.summary,
        refs: [] as RefEntry[],
      };
    }

    const storylines = subtopic.storylines || [];
    const bestLine = storylines
      .map(line => ({
        line,
        score: textOverlapScore(`${highlight.title} ${highlight.summary}`, `${line.title} ${line.summary}`),
      }))
      .sort((a, b) => b.score - a.score)[0];

    const line = bestLine && bestLine.score > 0 ? bestLine.line : storylines[0];
    return {
      id: `${target.topicSlug}-${target.subtopicId}`,
      title: line?.title?.trim() || subtopic.title || highlight.title,
      summary: line?.summary?.trim() || subtopic.summary || highlight.summary,
      refs: line?.items?.length ? line.items : (subtopic.items || []),
    };
  }

  return {
    id: highlight.id,
    title: highlight.title,
    summary: highlight.summary,
    refs: [] as RefEntry[],
  };
}

function clustersFromDailyHome(data: DailyNewsData): StoryCluster[] {
  const seenTargets = new Set<string>();
  const clusters: StoryCluster[] = [];

  for (const highlight of data.daily_home?.highlights || []) {
    const key = getHomeTargetKey(highlight.target);
    if (seenTargets.has(key)) continue;
    seenTargets.add(key);

    const targetCluster = getHomeTargetCluster(data, highlight);
    const refs = targetCluster.refs.map(entry => entry.ref);
    clusters.push({
      id: targetCluster.id,
      topic: highlight.target.topicSlug || '',
      subtopic: highlight.target.subtopicId,
      title: targetCluster.title,
      summary: targetCluster.summary,
      importance: normalizeImportance(undefined, clusters.length),
      confidence: normalizeConfidence(undefined, refs),
      quality_reasons: refs.length > 1 ? ['首页提炼', '多来源出现'] : ['首页提炼'],
      refs,
    });
  }

  return clusters.filter(cluster => cluster.topic);
}

function getFeedSourceClusters(data: DailyNewsData, topics: TopicConfig[]) {
  if (data.story_clusters?.length) return normalizeStoryClusters(data, topics);
  if (data.daily_home?.highlights?.length) return clustersFromDailyHome(data);
  return normalizeStoryClusters(data, topics);
}

function eventImportance(priority: number | undefined, index: number): StoryCluster['importance'] {
  if (typeof priority === 'number') {
    if (priority >= 90) return 'lead';
    if (priority >= 60) return 'major';
    return 'minor';
  }
  return index === 0 ? 'lead' : index < 8 ? 'major' : 'minor';
}

function eventHeat(priority: number | undefined) {
  if (typeof priority !== 'number') return 2;
  if (priority >= 90) return 3;
  if (priority >= 50) return 2;
  return 1;
}

function getTopicNameMap(topics: TopicConfig[]) {
  return new Map(topics.map(topic => [topic.id, topic.name]));
}

function getFeedSortScore(item: Omit<DailyNewsFeedItem, 'rank'>) {
  const importanceScore = item.importance === 'lead' ? 300 : item.importance === 'major' ? 200 : 100;
  return importanceScore + item.heat * 20 + item.sourceCount * 3;
}

function groupFeedRefsBySource(refs: DailyNewsFeedRef[]): DailyNewsFeedSourceGroup[] {
  const groups = new Map<string, DailyNewsFeedSourceGroup>();

  for (const ref of refs) {
    const key = ref.sourceId || ref.sourceName;
    if (!groups.has(key)) {
      groups.set(key, {
        sourceId: ref.sourceId,
        sourceName: ref.sourceName,
        refs: [],
      });
    }
    groups.get(key)!.refs.push(ref);
  }

  return Array.from(groups.values());
}

function getFeedSubtopicId(
  subtopicId: string | undefined,
  sourceGroups: DailyNewsFeedSourceGroup[],
) {
  const isV2exDiscussion = sourceGroups.some(group => group.sourceId === 'v2ex');
  if (isV2exDiscussion) return 'community';
  return subtopicId === 'community' ? undefined : subtopicId;
}

function isMorningItem(item: DailyNewsItem, topics: TopicConfig[]) {
  const topic = topics.find(entry => entry.id === item.topic);
  return getItemSubtopic(item, topic) === 'morning-brief' || isMorningPost(item.title);
}

function buildMorningBriefs(
  data: DailyNewsData,
  topics: TopicConfig[],
  sourceMeta: Map<string, { name: string }>,
): DailyNewsMorningBrief[] {
  const topicNames = getTopicNameMap(topics);
  const seen = new Set<string>();
  return data.items
    .filter(item => isMorningItem(item, topics))
    .filter(item => {
      const key = item.url || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => pubTimeValue(b.pub_time) - pubTimeValue(a.pub_time))
    .map((item, index) => ({
      id: `morning-${item._idx || index + 1}`,
      title: item.title,
      url: item.url,
      sourceName: getSourceName(item.source, sourceMeta),
      fieldId: item.topic,
      fieldName: topicNames.get(item.topic) || item.topic,
      pubTime: item.pub_time,
    }));
}

function balanceFeedItems(items: Array<Omit<DailyNewsFeedItem, 'rank'>>) {
  const remaining = [...items].sort((a, b) => getFeedSortScore(b) - getFeedSortScore(a));
  const balanced: Array<Omit<DailyNewsFeedItem, 'rank'>> = [];

  while (remaining.length > 0) {
    const recent = balanced.slice(-3);
    const saturatedField = recent.length === 3 && recent.every(item => item.fieldId === recent[0].fieldId)
      ? recent[0].fieldId
      : '';
    const nextIndex = saturatedField
      ? remaining.findIndex(item => item.fieldId !== saturatedField)
      : 0;
    const index = nextIndex >= 0 ? nextIndex : 0;
    balanced.push(remaining.splice(index, 1)[0]);
  }

  return balanced;
}

function feedItemsFromEvents(
  data: DailyNewsData,
  topics: TopicConfig[],
  sourceMeta: Map<string, { name: string }>,
): Array<Omit<DailyNewsFeedItem, 'rank'>> {
  const topicNames = getTopicNameMap(topics);

  return (data.feed_events || [])
    .filter(event => event.title.trim() && event.summary.trim() && topicNames.has(event.module))
    .map((event, index) => {
      const topic = topics.find(entry => entry.id === event.module);
      const refs = resolveFeedRefs(data.items, event.refs, sourceMeta, event.refs.length);
      const sourceGroups = groupFeedRefsBySource(refs);
      const sourceNames = sourceGroups.map(group => group.sourceName);
      const subtopicId = getFeedSubtopicId(event.subModule, sourceGroups);
      const subtopicName = getSubtopicName(topic, subtopicId);

      return {
        id: event.id,
        title: event.title,
        summary: event.summary,
        fieldId: event.module,
        fieldName: topicNames.get(event.module) || event.module,
        subtopicId,
        subtopicName,
        importance: eventImportance(event.priority, index),
        heat: eventHeat(event.priority),
        sourceNames,
        sourceCount: sourceGroups.length,
        refs,
        sourceGroups,
      };
    });
}

export function buildDailyNewsFeedView(
  data: DailyNewsData,
  topics: TopicConfig[],
  archiveDates: string[],
  selectedField = 'all',
): DailyNewsFeedView {
  const activeTopics = topics.filter(topic => topic.active !== false);
  const topicNames = getTopicNameMap(topics);
  const sourceMeta = buildSourceMeta(topics);
  const morningBriefs = buildMorningBriefs(data, topics, sourceMeta);
  const eventFeedItems = data.feed_events?.length
    ? feedItemsFromEvents(data, activeTopics, sourceMeta)
    : [];
  const rawFeedItems = eventFeedItems.length > 0
    ? eventFeedItems
    : getFeedSourceClusters(data, activeTopics)
      .filter(cluster => cluster.topic && (topicNames.has(cluster.topic) || cluster.topic === selectedField))
      .map(cluster => {
        const topic = topics.find(entry => entry.id === cluster.topic);
        const refs = resolveFeedRefs(data.items, cluster.refs, sourceMeta, 4);
        const sourceGroups = groupFeedRefsBySource(refs);
        const sourceNames = sourceGroups.map(group => group.sourceName);
        const heat = getClusterHeat(cluster);
        const subtopicId = getFeedSubtopicId(cluster.subtopic, sourceGroups);
        const subtopicName = getSubtopicName(topic, subtopicId);
        return {
          id: cluster.id,
          title: cluster.title,
          summary: cluster.summary,
          fieldId: cluster.topic,
          fieldName: topicNames.get(cluster.topic) || cluster.topic,
          subtopicId,
          subtopicName,
          importance: cluster.importance,
          heat,
          sourceNames,
          sourceCount: sourceGroups.length,
          refs,
          sourceGroups,
        };
      })
      .filter(item => item.subtopicId !== 'morning-brief');

  const balanced = eventFeedItems.length > 0 ? rawFeedItems : balanceFeedItems(rawFeedItems);
  const visibleItems = selectedField === 'all'
    ? balanced
    : balanced.filter(item => item.fieldId === selectedField || item.subtopicId === selectedField);
  const fieldCounts = new Map<string, number>();
  const subtopicCounts = new Map<string, number>();
  for (const item of balanced) {
    fieldCounts.set(item.fieldId, (fieldCounts.get(item.fieldId) || 0) + 1);
    if (item.subtopicId) {
      subtopicCounts.set(item.subtopicId, (subtopicCounts.get(item.subtopicId) || 0) + 1);
    }
  }

  const fieldHref = (fieldId: string) => fieldId === 'all'
    ? getDailyNewsHomeHref(data.date)
    : `${getDailyNewsHomeHref(data.date)}?field=${encodeURIComponent(fieldId)}`;
  const filters: DailyNewsFieldFilter[] = [
    {
      id: 'all',
      name: '全部',
      href: fieldHref('all'),
      count: balanced.length,
      active: selectedField === 'all',
    },
    ...activeTopics
      .filter(topic => fieldCounts.has(topic.id))
      .map(topic => ({
        id: topic.id,
        name: topic.name,
        href: fieldHref(topic.id),
        count: fieldCounts.get(topic.id) || 0,
        active: selectedField === topic.id,
      })),
    ...(subtopicCounts.has('community') ? [{
      id: 'community',
      name: '社区',
      href: fieldHref('community'),
      count: subtopicCounts.get('community') || 0,
      active: selectedField === 'community',
    }] : []),
  ];

  return {
    date: data.date,
    dateLabel: formatDateLabel(data.date),
    weekdayLabel: getWeekdayLabel(data.date),
    updatedAtLabel: formatUpdateTime(data.update_time),
    selectedField,
    stats: {
      rawItems: data.items.length,
      feedItems: visibleItems.length,
      fields: filters.length - 1,
      sources: new Set(data.items.map(item => item.source)).size,
    },
    filters,
    morningBriefs,
    feedItems: visibleItems.map((item, index) => ({
      ...item,
      rank: String(index + 1).padStart(2, '0'),
    })),
    archive: archiveDates.slice(0, 8).map(date => ({
      date,
      label: formatDateLabel(date),
      href: getDailyNewsHomeHref(date),
    })),
  };
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

export function getDailyNewsHomeHref(date?: string) {
  return date ? `/daily-news/${date}/` : '/daily-news/';
}

export function getTopicHref(topicId: string, date?: string) {
  const base = getDailyNewsHomeHref(date);
  return `${base}?field=${encodeURIComponent(topicId)}`;
}

export function getTopicAnchorHref(topicId: string, date: string, anchor: string) {
  return `${getTopicHref(topicId, date)}#${anchor}`;
}

export function getDailyNewsSourcesHref(date?: string) {
  return date ? `/daily-news/${date}/sources/` : '/daily-news/sources/';
}

function requireContract<T>(value: T | undefined, name: string): T {
  if (!value) {
    throw new Error(`Missing daily news contract field: ${name}`);
  }
  return value;
}

function resolveRefItem(items: DailyNewsItem[], ref: NewsRef) {
  if (typeof ref === 'number') {
    return items.find(item => item._idx === ref) || items[ref - 1] || items[ref];
  }

  const numeric = Number(ref);
  if (Number.isFinite(numeric) && String(numeric) === ref.trim()) {
    return items.find(item => item._idx === numeric) || items[numeric - 1] || items[numeric];
  }

  return items.find(item => item.url === ref);
}

function resolveViewRef(items: DailyNewsItem[], entry: RefEntry) {
  const item = resolveRefItem(items, entry.ref);
  if (!item) {
    throw new Error(`Unable to resolve daily news ref: ${String(entry.ref)}`);
  }
  return {
    id: entry.id || `ref-${String(entry.ref)}`,
    ref: entry.ref,
    label: entry.label,
    categoryLabel: entry.categoryLabel,
    storyLabel: entry.storyLabel,
    note: entry.note,
    item,
  };
}

function resolveSubtopicItemRef(items: DailyNewsItem[], entry: RefEntry) {
  const viewRef = resolveViewRef(items, entry);
  const readerTitle = firstNonEmpty([
    entry.note,
    viewRef.item.ai_summary,
    viewRef.item.summary,
    viewRef.item.title,
  ]);
  const readerSummary = entry.note && entry.note !== readerTitle
    ? entry.note
    : firstNonEmpty([viewRef.item.ai_summary, viewRef.item.summary]);

  return {
    ...viewRef,
    readerTitle,
    readerSummary,
  };
}

export function getSportsSubtopicRenderMode(
  subtopic: { storylines?: unknown[] },
) {
  return subtopic.storylines && subtopic.storylines.length > 0 ? 'storylines' : 'items';
}

function resolveOtherItemRef(items: DailyNewsItem[], entry: RefEntry) {
  const viewRef = resolveViewRef(items, entry);
  const readerTitle = firstNonEmpty([
    entry.note,
    entry.storyLabel,
    viewRef.item.ai_summary,
    viewRef.item.summary,
    viewRef.item.title,
  ]);

  return {
    ...viewRef,
    readerTitle,
  };
}

function resolveHomeTarget(target: DailyNewsHomeTarget, date: string) {
  if (target.href) return target.href;

  if (target.type === 'dailyLine' && target.topicSlug && target.dailyLineId) {
    return getTopicAnchorHref(target.topicSlug, date, target.dailyLineId);
  }

  if (target.type === 'subtopic' && target.topicSlug && target.subtopicId) {
    return getTopicAnchorHref(target.topicSlug, date, target.subtopicId);
  }

  if (target.type === 'topic' && target.topicSlug) {
    return getTopicHref(target.topicSlug, date);
  }

  if (target.type === 'special' && target.specialSlug) {
    return `/daily-news/${date}/special/${target.specialSlug}/`;
  }

  throw new Error(`Invalid daily home target: ${JSON.stringify(target)}`);
}

function getTargetDailyLine(data: DailyNewsData, target: DailyNewsHomeTarget) {
  if (target.type !== 'dailyLine' || !target.topicSlug || !target.dailyLineId) return undefined;
  return data.topic_pages?.[target.topicSlug]?.dailyLines.find(line => line.id === target.dailyLineId);
}

function resolveHomeHighlightSummary(
  data: DailyNewsData,
  highlight: DailyNewsHomeContract['highlights'][number],
) {
  const targetLine = getTargetDailyLine(data, highlight.target);
  return targetLine?.summary?.trim() || highlight.summary;
}

export function formatUpdateTime(updateTime: string | undefined) {
  if (!updateTime) return '';
  const date = new Date(updateTime);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  });
}

export function buildDailyNewsHomeView(
  data: DailyNewsData,
  topics: TopicConfig[],
  archiveDates: string[],
) {
  const home = requireContract(data.daily_home, 'daily_home');
  const activeTopicIds = new Set(['tech', 'sports']);
  const readerTopics = topics
    .filter(topic => topic.active !== false && activeTopicIds.has(topic.id))
    .map(topic => {
      const topicItems = data.items.filter(item => item.topic === topic.id);
      return {
        id: topic.id,
        name: topic.name,
        href: getTopicHref(topic.id, data.date),
        rawItems: topicItems.length,
        sources: new Set(topicItems.map(item => item.source)).size,
        tags: (topic.subtopics || []).slice(0, 5).map(subtopic => subtopic.name),
      };
    });

  return {
    date: data.date,
    dateLabel: formatDateLabel(data.date),
    weekdayLabel: getWeekdayLabel(data.date),
    updatedAtLabel: formatUpdateTime(data.update_time),
    intro: home.intro,
    stats: {
      rawItems: home.stats?.rawItems ?? data.items.length,
      topics: home.stats?.topics ?? readerTopics.length,
      highlights: home.stats?.highlights ?? home.highlights.length,
    },
    highlights: home.highlights.map((highlight, index) => ({
      ...highlight,
      summary: resolveHomeHighlightSummary(data, highlight),
      rank: String(index + 1).padStart(2, '0'),
      href: resolveHomeTarget(highlight.target, data.date),
    })),
    topics: readerTopics,
    archive: archiveDates.slice(0, 8).map(date => ({
      date,
      label: formatDateLabel(date),
      href: getDailyNewsHomeHref(date),
    })),
  };
}

export function buildGenericTopicPageView(
  data: DailyNewsData,
  topic: TopicConfig,
) {
  const topicPage = requireContract(data.topic_pages?.[topic.id], `topic_pages.${topic.id}`);
  const lineMap = new Map(topicPage.dailyLines.map(line => [line.id, line]));

  return {
    topic,
    date: data.date,
    dateLabel: formatDateLabel(data.date),
    weekdayLabel: getWeekdayLabel(data.date),
    updatedAtLabel: formatUpdateTime(data.update_time),
    stats: {
      rawItems: topicPage.stats?.rawItems ?? data.items.filter(item => item.topic === topic.id).length,
      sources: topicPage.stats?.sources ?? new Set(data.items.filter(item => item.topic === topic.id).map(item => item.source)).size,
      dailyLines: topicPage.stats?.dailyLines ?? topicPage.dailyLines.length,
    },
    overviewSummary: topicPage.overviewSummary || topicPage.takeaway || '',
    overview: topicPage.overview.map((entry, index) => ({
      ...entry,
      rank: String(index + 1).padStart(2, '0'),
      href: `#${entry.dailyLineId}`,
      line: lineMap.get(entry.dailyLineId),
    })),
    morningBriefs: topicPage.morningBriefs.map(brief => ({
      ...brief,
      sourceName: topic.sources?.find(source => source.id === brief.source)?.name || brief.source,
    })),
    dailyLines: topicPage.dailyLines.map(line => ({
      ...line,
      refs: line.items.map(entry => resolveViewRef(data.items, entry)),
    })),
    otherItems: topicPage.otherItems.map(entry => resolveOtherItemRef(data.items, entry)),
    sources: topicPage.sources || [],
  };
}

export function buildSportsTopicPageView(
  data: DailyNewsData,
  topic: TopicConfig,
) {
  const sportsPage = requireContract(data.sports_page, 'sports_page');
  const subtopicMap = new Map(sportsPage.subtopics.map(subtopic => [subtopic.id, subtopic]));

  return {
    topic,
    date: data.date,
    dateLabel: formatDateLabel(data.date),
    weekdayLabel: getWeekdayLabel(data.date),
    updatedAtLabel: formatUpdateTime(data.update_time),
    stats: {
      rawItems: sportsPage.stats?.rawItems ?? data.items.filter(item => item.topic === 'sports').length,
      sources: sportsPage.stats?.sources ?? new Set(data.items.filter(item => item.topic === 'sports').map(item => item.source)).size,
      subtopics: sportsPage.stats?.subtopics ?? sportsPage.subtopics.length,
    },
    overview: sportsPage.overview.map((entry, index) => ({
      ...entry,
      rank: String(index + 1).padStart(2, '0'),
      href: `#${entry.subtopicId}`,
      subtopic: subtopicMap.get(entry.subtopicId),
    })),
    subtopics: sportsPage.subtopics.map(subtopic => ({
      ...subtopic,
      matchStatus: subtopic.matchStatus || [],
      featuredMatchStatus: (subtopic.matchStatus || []).slice(0, 5),
      fixtures: subtopic.fixtures || [],
      storylines: (subtopic.storylines || []).map(line => ({
        ...line,
        refs: line.items.map(entry => resolveViewRef(data.items, entry)),
      })),
      refs: subtopic.items.map(entry => resolveSubtopicItemRef(data.items, entry)),
    })),
    otherItems: sportsPage.otherItems.map(entry => resolveOtherItemRef(data.items, entry)),
    sources: sportsPage.sources || [],
  };
}
