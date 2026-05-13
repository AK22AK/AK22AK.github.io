import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  buildDailyNewsHomeView,
  buildSportsTopicPageView,
  formatUpdateTime,
  getWeekdayLabel,
  getSportsSubtopicRenderMode,
  type DailyNewsData,
  type TopicConfig,
} from '../src/lib/dailyNews.ts';
import { sportsPageSchema } from '../src/lib/dailyNewsContentSchema.ts';

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

test('daily news date labels use China calendar semantics independent of build timezone', () => {
  assert.equal(formatUpdateTime('2026-05-13T08:31:37+08:00'), '08:31');
  assert.equal(getWeekdayLabel('2026-05-13'), '周三');
});

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
  assert.equal(subtopic.refs[0].readerTitle, '萨卡一击制胜');
  assert.equal(subtopic.refs[0].readerSummary, '中文 AI 摘要');
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

test('sports otherItems preserve reader-facing labels even when source item subtopic is other', () => {
  const data = baseData();
  data.items[0].subtopic = 'other';
  data.sports_page!.otherItems = [
    {
      ref: 1,
      label: '足球',
      categoryLabel: '高尔夫',
      storyLabel: '高尔夫',
      note: '麦克罗伊因脚趾伤势暂停美国 PGA 锦标赛练习',
    },
  ];

  const view = buildSportsTopicPageView(data, topics[1]);

  assert.equal(view.otherItems[0].label, '足球');
  assert.equal(view.otherItems[0].categoryLabel, '高尔夫');
  assert.equal(view.otherItems[0].storyLabel, '高尔夫');
  assert.equal(view.otherItems[0].item.subtopic, 'other');
  assert.equal(view.otherItems[0].readerTitle, '麦克罗伊因脚趾伤势暂停美国 PGA 锦标赛练习');
});

test('sports content schema preserves storylines and expanded match fields', () => {
  const parsed = sportsPageSchema.parse({
    overview: [],
    subtopics: [
      {
        id: 'football',
        label: '足球',
        title: '今日足球',
        summary: '中文聚合主线应该保留。',
        kind: 'league',
        matchStatus: [
          {
            id: 'match-1',
            timeLabel: 'today',
            title: '曼城 vs 布伦特福德',
            status: 'result',
            resultTime: '2026-05-10T05:30:00+08:00',
            reason: '争冠关键战',
            importance: 'lead',
            priority: 1,
          },
        ],
        fixtures: [
          {
            id: 'fixture-1',
            timeLabel: 'tonight',
            title: '阿森纳 vs 利物浦',
            status: 'fixture',
            priority: 2,
          },
        ],
        storylines: [
          {
            id: 'football-sl-1',
            title: '英超争冠进入最后阶段',
            summary: '中文聚合主线替代 raw item 展示。',
            tags: ['英超'],
            items: [{ ref: 1, note: '中文引用说明' }],
          },
        ],
        items: [{ ref: 1, label: '足球' }],
      },
    ],
    otherItems: [
      {
        ref: 1,
        label: '足球',
        categoryLabel: '高尔夫',
        storyLabel: '高尔夫',
        note: '麦克罗伊因脚趾伤势暂停美国 PGA 锦标赛练习',
      },
    ],
  });

  const subtopic = parsed.subtopics[0] as any;

  assert.equal(subtopic.storylines.length, 1);
  assert.equal(subtopic.fixtures.length, 1);
  assert.equal(subtopic.matchStatus[0].resultTime, '2026-05-10T05:30:00+08:00');
  assert.equal(subtopic.matchStatus[0].reason, '争冠关键战');
  assert.equal(subtopic.matchStatus[0].importance, 'lead');
  assert.equal(subtopic.matchStatus[0].priority, 1);
  assert.equal((parsed.otherItems[0] as any).categoryLabel, '高尔夫');
  assert.equal((parsed.otherItems[0] as any).storyLabel, '高尔夫');
});

test('sports subtopic rendering chooses storylines before raw fallback items', () => {
  const data = baseData();
  data.sports_page!.subtopics = [
    {
      id: 'football',
      label: '足球',
      title: '今日足球',
      summary: '中文聚合主线应该优先展示。',
      kind: 'league',
      storylines: [
        {
          id: 'football-sl-1',
          title: '英超第 36 轮赛果',
          summary: '中文聚合摘要。',
          items: [{ ref: 1, note: '中文引用' }],
        },
      ],
      items: [
        {
          ref: 1,
          label: '足球',
          note: 'Raw fallback should not render',
        },
      ],
    },
  ];

  const view = buildSportsTopicPageView(data, topics[1]);

  assert.equal(getSportsSubtopicRenderMode(view.subtopics[0]), 'storylines');
  assert.equal(view.subtopics[0].storylines[0].title, '英超第 36 轮赛果');
});

test('sports view keeps football and FPL storylines as primary subtopic content', () => {
  const data = baseData();
  data.items.push(
    {
      id: 2,
      title: 'FPL raw title should stay in refs',
      summary: 'Raw FPL fallback summary should not become the primary subtopic list.',
      url: 'https://example.com/fpl',
      source: 'fpl',
      topic: 'sports',
      subtopic: 'fpl',
    } as any,
  );
  data.sports_page!.subtopics = [
    {
      id: 'football',
      label: '足球',
      title: '足球今日概述',
      summary: '足球顶部概述可以保留，但主体应继续展示多条聚合主线。',
      kind: 'league',
      storylines: [
        {
          id: 'arsenal-west-ham',
          title: '阿森纳 1-0 西汉姆：VAR 改判与争冠走势',
          summary: '阿森纳客场小胜西汉姆，VAR 改判成为比赛转折，争冠形势继续胶着。',
          items: [{ ref: 1, note: '阿森纳争冠关键战' }],
        },
        {
          id: 'rashford-barcelona',
          title: '拉什福德助巴萨获胜',
          summary: '拉什福德延续近期状态，成为巴萨进攻端的重要线索。',
          items: [{ ref: 1, note: '拉什福德比赛表现' }],
        },
      ],
      items: [{ ref: 1, label: '足球', note: 'Raw football fallback should not render as the main list' }],
    },
    {
      id: 'fpl',
      label: 'FPL',
      title: 'FPL 今日概述',
      summary: 'FPL 顶部概述可以保留，但主体应展示主线聚合。',
      kind: 'fantasy',
      storylines: [
        {
          id: 'fpl-gw36',
          title: 'FPL 游戏周 36：轮换、伤病与关键球员',
          summary: '游戏周 36 的核心变量集中在阵容轮换、伤病更新和奖励分变化。',
          items: [{ ref: 2, note: 'FPL 游戏周 36 笔记' }],
        },
      ],
      items: [{ ref: 2, label: 'FPL', note: 'Raw FPL fallback should not render as the main list' }],
    },
  ];

  const view = buildSportsTopicPageView(data, topics[1]);

  assert.equal(getSportsSubtopicRenderMode(view.subtopics[0]), 'storylines');
  assert.equal(getSportsSubtopicRenderMode(view.subtopics[1]), 'storylines');
  assert.equal(view.subtopics[0].storylines.length, 2);
  assert.equal(view.subtopics[1].storylines.length, 1);
  assert.equal(view.subtopics[0].refs[0].readerTitle, 'Raw football fallback should not render as the main list');
  assert.equal(view.subtopics[1].storylines[0].refs[0].note, 'FPL 游戏周 36 笔记');
});

test('sports topic page does NOT render matchStatus or fixtures sections', () => {
  const source = fs.readFileSync('src/pages/daily-news/topic/[id].astro', 'utf-8');
  assert.doesNotMatch(source, /重点赛果/);
  assert.doesNotMatch(source, /查看全部今日赛程/);
  assert.doesNotMatch(source, /daily-match-list/);
  assert.doesNotMatch(source, /daily-fixture-details/);
  assert.doesNotMatch(source, /featuredMatchStatus/);
});

test('sports topic page still renders storylines with ref toggles and source chips', () => {
  const source = fs.readFileSync('src/pages/daily-news/topic/[id].astro', 'utf-8');
  assert.match(source, /daily-sports-line-list/);
  assert.match(source, /subtopic\.storylines\.map/);
  assert.match(source, /daily-ref-toggle/);
  assert.match(source, /daily-ref-chip-row/);
});

test('sports topic page only maps fallback refs inside the non-storylines branch', () => {
  const source = fs.readFileSync('src/pages/daily-news/topic/[id].astro', 'utf-8');
  const branchIndex = source.indexOf("getSportsSubtopicRenderMode(subtopic) === 'storylines'");
  const storylinesIndex = source.indexOf('class="daily-sports-line-list"', branchIndex);
  const fallbackIndex = source.indexOf('class="daily-story-list"', storylinesIndex);

  assert.ok(branchIndex >= 0);
  assert.ok(storylinesIndex > branchIndex);
  assert.ok(fallbackIndex > storylinesIndex);

  const storylinesBranch = source.slice(storylinesIndex, fallbackIndex);
  const fallbackBranch = source.slice(fallbackIndex);

  assert.match(storylinesBranch, /subtopic\.storylines\.map/);
  assert.doesNotMatch(storylinesBranch, /subtopic\.refs\.map/);
  assert.match(fallbackBranch, /subtopic\.refs\.map/);
});

test('sports topic page keeps subtopic other and otherItems anchors distinct', () => {
  const source = fs.readFileSync('src/pages/daily-news/topic/[id].astro', 'utf-8');

  assert.match(source, /function getSportsSubtopicNavLabel/);
  assert.match(source, /subtopic\.id === 'other' \? '其他项目'/);
  assert.match(source, /const otherItemsSectionId = isSports \? 'other-items' : 'other'/);
  assert.match(source, /href=\{`#\$\{otherItemsSectionId\}`\}/);
  assert.match(source, /id=\{otherItemsSectionId\}/);
  assert.match(source, /isSports \? '其他值得看' : '其他'/);
});

test('sports otherItems label rendering does not let item.subtopic override reader-facing labels', () => {
  const source = fs.readFileSync('src/pages/daily-news/topic/[id].astro', 'utf-8');
  const functionStart = source.indexOf('function getOtherItemLabel');
  const functionEnd = source.indexOf('function getSportsSubtopicNavLabel', functionStart);

  assert.ok(functionStart >= 0);
  assert.ok(functionEnd > functionStart);

  const functionSource = source.slice(functionStart, functionEnd);

  assert.match(functionSource, /ref\.categoryLabel \|\| ref\.label/);
  assert.doesNotMatch(functionSource, /ref\.item\.subtopic/);
  assert.doesNotMatch(functionSource, /getDisplayLabel\(topic, ref\.label, ref\.item\.subtopic\)/);
});
