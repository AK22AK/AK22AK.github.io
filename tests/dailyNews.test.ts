import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDailyNewsHomeView,
  buildSportsTopicPageView,
  type DailyNewsData,
  type TopicConfig,
} from '../src/lib/dailyNews.ts';

const topics: TopicConfig[] = [
  {
    id: 'tech',
    name: '科技',
    active: true,
    subtopics: [{ id: 'ai', name: 'AI' }],
  },
  {
    id: 'sports',
    name: '体育',
    active: true,
    subtopics: [{ id: 'football', name: '足球' }],
  },
];

function baseData(): DailyNewsData {
  return {
    date: '2026-05-09',
    update_time: '2026-05-09T08:00:00+08:00',
    daily_home: {
      intro: '今日入口',
      highlights: [],
    },
    topic_pages: {
      tech: {
        overview: [],
        morningBriefs: [],
        dailyLines: [],
        otherItems: [],
      },
    },
    sports_page: {
      overview: [],
      subtopics: [],
      otherItems: [],
    },
    items: [
      {
        _idx: 1,
        title: 'Raw English sports title',
        summary: 'Raw English summary',
        ai_summary: '中文 AI 摘要',
        url: 'https://example.com/a',
        source: 'source-a',
        topic: 'sports',
        subtopic: 'football',
      },
      {
        _idx: 2,
        title: 'Second raw title',
        summary: 'Second summary',
        url: 'https://example.com/b',
        source: 'source-b',
        topic: 'sports',
        subtopic: 'football',
      },
    ],
  };
}

test('home dailyLine highlights use the target dailyLine summary when the home summary is thin', () => {
  const data = baseData();
  data.daily_home!.highlights = [
    {
      id: 'highlight-ai',
      title: 'AI 投融资',
      summary: '融资升温。',
      label: '科技',
      target: {
        type: 'dailyLine',
        topicSlug: 'tech',
        dailyLineId: 'line-ai',
      },
    },
  ];
  data.topic_pages!.tech.dailyLines = [
    {
      id: 'line-ai',
      title: '中国大模型融资热潮',
      summary: 'DeepSeek 与月之暗面融资线索共同指向中国 AI 基础设施赛道资本集中度正在快速提升。',
      tags: ['AI'],
      items: [],
    },
  ];

  const view = buildDailyNewsHomeView(data, topics, [data.date]);

  assert.equal(
    view.highlights[0].summary,
    'DeepSeek 与月之暗面融资线索共同指向中国 AI 基础设施赛道资本集中度正在快速提升。',
  );
});

test('sports view exposes storylines with reader-facing refs before raw fallback items', () => {
  const data = baseData();
  data.sports_page!.subtopics = [
    {
      id: 'football',
      label: '足球',
      title: '欧冠决赛对阵出炉',
      summary: '阿森纳与巴黎会师决赛。',
      kind: 'tournament',
      storylines: [
        {
          id: 'line-final',
          title: '欧冠决赛主线',
          summary: '阿森纳晋级，巴黎同步进入决赛，决赛对阵已经明确。',
          items: [{ ref: 1, note: '中文引用说明' }],
        },
      ],
      items: [{ ref: 1, label: '阿森纳晋级决赛', note: '萨卡一击制胜' }],
    },
  ];

  const view = buildSportsTopicPageView(data, topics[1]);
  const subtopic = view.subtopics[0];

  assert.equal(subtopic.storylines[0].title, '欧冠决赛主线');
  assert.equal(Object.hasOwn(subtopic.storylines[0].refs[0], 'readerTitle'), false);
  assert.equal(subtopic.refs[0].readerTitle, '阿森纳晋级决赛');
  assert.equal(subtopic.refs[0].readerSummary, '萨卡一击制胜');
});

test('sports view keeps featured match status separate from full fixtures', () => {
  const data = baseData();
  data.sports_page!.subtopics = [
    {
      id: 'football',
      label: '足球',
      title: '今日足球',
      summary: '重点赛程先读，完整赛程折叠。',
      kind: 'tournament',
      matchStatus: Array.from({ length: 6 }, (_, index) => ({
        id: `match-${index + 1}`,
        title: `重点比赛 ${index + 1}`,
        status: index % 2 === 0 ? 'fixture' : 'result',
        priority: index + 1,
        reason: index === 0 ? '争冠关键战' : undefined,
      })),
      fixtures: Array.from({ length: 8 }, (_, index) => ({
        id: `fixture-${index + 1}`,
        title: `完整赛程 ${index + 1}`,
        status: 'fixture',
      })),
      items: [{ ref: 2 }],
    },
  ] as any;

  const view = buildSportsTopicPageView(data, topics[1]);
  const subtopic = view.subtopics[0] as any;

  assert.equal(subtopic.featuredMatchStatus.length, 5);
  assert.equal(subtopic.featuredMatchStatus[0].reason, '争冠关键战');
  assert.equal(subtopic.fixtures.length, 8);
});

test('otherItems use the Chinese note as the reader-facing title, not the category label', () => {
  const data = baseData();
  data.sports_page!.otherItems = [
    {
      ref: 1,
      label: '综合体育',
      note: '布鲁诺·费尔南德斯谈奖杯、助攻纪录与未来去向',
    },
  ];

  const view = buildSportsTopicPageView(data, topics[1]);

  assert.equal(view.otherItems[0].label, '综合体育');
  assert.equal(view.otherItems[0].readerTitle, '布鲁诺·费尔南德斯谈奖杯、助攻纪录与未来去向');
});
