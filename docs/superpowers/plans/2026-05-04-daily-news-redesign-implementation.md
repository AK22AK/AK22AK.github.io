# Daily News Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the accepted lightweight daily-news experience across the Astro frontend and Hermes data contract: home page, generic topic pages, and the sports topic page.

**Architecture:** Keep `daily-news-data` as the source of scheduled data and `AK22AK.github.io` as the rendering layer. Add explicit view-model builders in `src/lib/dailyNews.ts` so Astro pages render the new contract while still tolerating current legacy JSON. Update Hermes-facing docs and validation before relying on new generated fields.

**Tech Stack:** Astro 6 content collections, TypeScript helper functions, static JSON data from `daily-news-data`, Hermes shell/Python validation, plain CSS in the existing site styles.

**Commit Policy:** Do not commit or push during execution unless the user explicitly authorizes commits for that execution pass. The commit commands below are checkpoint commands to run only after that authorization.

---

## File Structure

- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/FRONTEND_NEWS_CONTRACT.md`
  - Owns the canonical data contract for Hermes and the frontend.
  - Replace old homepage/topic/report language with the accepted home, generic topic, and sports topic models.
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/DATA_PIPELINE.md`
  - Updates the human-readable Hermes workflow and scheduled-task instruction.
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/scripts/hermes_daily_news.sh`
  - Updates Digest Agent instructions and validation for new fields.
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/data/topics.json`
  - Moves Snooker World Championship from a top-level active topic into Sports as an active tournament subtopic/source.
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/content.config.ts`
  - Allows optional new contract fields while preserving existing JSON compatibility.
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/lib/dailyNews.ts`
  - Adds typed view models and adapter functions:
    - `buildDailyNewsHomeView`
    - `buildGenericTopicPageView`
    - `buildSportsTopicPageView`
    - `getTopicHref`
    - `getTopicAnchorHref`
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/pages/daily-news/index.astro`
  - Rebuilds the daily-news home page from the home view model.
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/pages/daily-news/topic/[id].astro`
  - Branches between generic topic rendering and sports rendering.
- Modify `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/styles/global.css`
  - Adds the final lightweight daily-news layout, sections, anchors, sports match-status rows, long-tail list styling, and responsive desktop/mobile typography.

---

### Task 1: Data Contract And Topic Configuration

**Files:**
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/FRONTEND_NEWS_CONTRACT.md`
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/DATA_PIPELINE.md`
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/data/topics.json`

- [ ] **Step 1: Update contract language around stable concepts**

Replace the existing "Goal", "Stable Concepts", and "Subtopic Enums" sections in `FRONTEND_NEWS_CONTRACT.md` with this content:

```markdown
## Goal

The reader-facing experience is organized by reading intent:

- The daily-news home page is a clean cover: date context, priority highlights, topic entry points, and archive.
- Generic topic pages, starting with Technology, use `overview -> morning briefs -> daily lines -> other worthwhile items -> sources`.
- Sports uses a different model: `overview -> active subtopics -> other worthwhile items -> sources`.
- Sources are references and audit metadata. They should not be the primary reader-facing grouping.

## Stable Concepts

- `topic`: a stable interest area, such as `tech` or `sports`.
- `daily_line`: a dynamic reading path inside a generic topic for the selected date.
- `sports_subtopic`: an active sport, league, team, player group, or tournament section inside Sports for the selected date.
- `source`: origin of a raw item. Use it for refs, badges, and source transparency.

Technology concepts such as AI, chips, phones, computers, robots, and cars are tags/entities. They must not become permanent topic-page navigation by default.

Sports is the exception: sports content should remain grouped by active subtopics because competition context matters.

Temporary tournaments and major events default into Sports as active subtopics. For example, Snooker World Championship appears under Sports, not as a peer top-level topic on the daily-news home page.

## Subtopic Enums

### Tech

Tech subtopics are classification aids and tags, not page navigation.

- `morning-brief`: original morning brief entries such as "派早报", "IT早报", "Morning", "晨读", or "今日早报".
- `ai`: models, AI products, agents, infrastructure, AI policy.
- `consumer-electronics`: phones, tablets, PCs, wearables, home hardware.
- `mobility`: cars, autonomous driving, batteries, mobility platforms.
- `chips`: semiconductors, GPUs, CPUs, memory, foundries, supply chain.
- `developer-tools`: software engineering, APIs, operating systems, dev tools.
- `business`: companies, funding, earnings, acquisitions, regulation.
- `community`: community discussions and weak-signal trend sources.

### Sports

Sports subtopics are reader-facing active sections when they have enough material for the day.

- `football`: football coverage that is not only Arsenal-specific.
- `arsenal`: Arsenal-specific news and analysis.
- `snooker-world-championship`: World Snooker Championship or the active snooker tournament.
- `tennis`: ATP, WTA, grand slams, major tennis stories.
- `basketball`: NBA and major basketball news.
- `racing`: Formula 1 and major motorsport.
- `chinese-athletes`: Chinese and Asian athletes across sports when there is a daily storyline.
- `general-sports`: sparse sports items that do not support a full active subtopic.
```

- [ ] **Step 2: Add the new required JSON models to the contract**

Replace the old "Required Daily Shape", "Topic Reports", and "Short-term topic rules" sections with this content:

````markdown
## Required Daily Shape

Keep the existing `items`, `topic_summaries`, `subtopic_sections`, and `sources_index` fields for backward compatibility. Hermes should add the fields below when generating the daily digest.

```json
{
  "daily_home": {
    "intro": "今天直接列出值得优先看的热点，每条进入对应主题页继续阅读引用、背景和来源。",
    "highlights": [
      {
        "id": "tech-blackwell-deepseek",
        "title": "英伟达 Blackwell 平台适配 DeepSeek-V4",
        "summary": "企业部署 DeepSeek-V4 的硬件路径更清晰。",
        "label": "科技",
        "target": {
          "type": "dailyLine",
          "topicSlug": "tech",
          "dailyLineId": "line-01"
        }
      }
    ]
  },
  "topic_pages": {
    "tech": {
      "overview": [
        { "id": "ov-01", "dailyLineId": "line-01", "text": "AI 基础设施继续成为今天科技线索的主轴。" }
      ],
      "morningBriefs": [
        { "id": "morning-01", "title": "派早报：X 推出聊天软件 XChat", "url": "https://example.com", "source": "sspai" }
      ],
      "dailyLines": [
        {
          "id": "line-01",
          "title": "AI 基础设施与模型部署",
          "summary": "模型部署、平台安全和端侧智能体是今天的主线。",
          "tags": ["AI", "芯片", "Agent"],
          "items": [
            { "id": "item-14", "ref": 14, "note": "官方适配消息" }
          ]
        }
      ],
      "otherItems": [
        { "id": "other-01", "ref": 21, "label": "消费电子" }
      ]
    }
  },
  "sports_page": {
    "overview": [
      { "id": "ov-01", "subtopicId": "snooker-world-championship", "text": "斯诺克世锦赛进入关键日，赛程和焦点战集中。" }
    ],
    "subtopics": [
      {
        "id": "snooker-world-championship",
        "label": "斯诺克",
        "title": "斯诺克世锦赛",
        "summary": "今日围绕赛程、昨日赛果和焦点对阵展开。",
        "kind": "tournament",
        "matchStatus": [
          {
            "id": "snooker-result-01",
            "timeLabel": "yesterday",
            "title": "昨日赛果：奥沙利文晋级",
            "status": "result"
          }
        ],
        "items": [
          { "id": "snooker-item-01", "ref": 73, "note": "焦点战背景" }
        ]
      }
    ],
    "otherItems": [
      { "id": "sports-other-01", "ref": 88, "label": "综合体育" }
    ]
  }
}
```

## Contract Rules

- `daily_home.highlights[*]` must link into a real topic page, daily line, sports subtopic, or explicitly created deep page.
- `topic_pages.tech.overview[*].dailyLineId` must match a `dailyLines[*].id`.
- Morning briefs are original-entry links only. Preserve the source title and URL. Do not generate a roundup summary for morning briefs.
- Generic topic pages should generate 5-10 `dailyLines` when enough material exists.
- Generic topic `otherItems` can contain 10-20 entries.
- `sports_page.overview[*].subtopicId` must match a `sports_page.subtopics[*].id`.
- Sports match status must stay inside yesterday, last night, this morning, today, or tonight.
- Sports subtopic items should aim for 5-10 meaningful entries when enough material exists.
- Sparse sports items go into `sports_page.otherItems`.
- Snooker World Championship belongs under `sports_page.subtopics`, not `topic_reports.snooker`.
````

- [ ] **Step 3: Update `topics.json` to move Snooker under Sports**

In `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/data/topics.json`:

1. Set the top-level `snooker` topic to inactive:

```json
{
  "id": "snooker",
  "name": "斯诺克世锦赛",
  "type": "shortterm",
  "description": "2026 斯诺克世锦赛赛况追踪；已并入体育板块子主题",
  "startDate": "2026-04-18",
  "endDate": "2026-05-04",
  "active": false,
  "sources": []
}
```

2. Add a Sports subtopic after `arsenal` or before `general-sports`:

```json
{
  "id": "snooker-world-championship",
  "name": "斯诺克世锦赛",
  "description": "斯诺克世锦赛赛程、赛果、焦点战和中国球员动态",
  "keywords": ["斯诺克", "世锦赛", "克鲁斯堡", "奥沙利文", "丁俊晖", "特鲁姆普", "塞尔比", "希金斯", "罗伯逊", "墨菲", "威尔逊", "Snooker", "Crucible", "O'Sullivan", "Higgins", "Trump"]
}
```

3. Add the BBC snooker source to the Sports `sources` array:

```json
{
  "id": "bbc-snooker",
  "name": "BBC Sport Snooker",
  "url": "https://www.bbc.com/sport/snooker",
  "frequency": "high",
  "rss": "http://feeds.bbci.co.uk/sport/snooker/rss.xml"
}
```

- [ ] **Step 4: Checkpoint data-contract changes**

Run:

```bash
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data diff --check
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data status --short
```

If the user has authorized commits for this execution pass, also run:

```bash
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data add FRONTEND_NEWS_CONTRACT.md DATA_PIPELINE.md data/topics.json
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data commit -m "docs: update daily news redesign contract"
```

Expected:

```text
no whitespace errors
status shows only the intended files, or a commit is created on redesign/lightweight-site when authorized
```

---

### Task 2: Hermes Validation And Fetch Classification

**Files:**
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/scripts/hermes_daily_news.sh`
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/scripts/fetch_news.py`

- [ ] **Step 1: Update Digest Agent printed responsibilities**

In `scripts/hermes_daily_news.sh`, replace the `digest()` body text with:

```bash
digest() {
  echo "DIGEST_INPUT=${PROJECT_ROOT}/${OUT_PATH}"
  echo "Digest Agent responsibilities:"
  echo "  - Generate daily_home.highlights for the daily-news home page."
  echo "  - Generate topic_pages.tech with overview, morningBriefs, dailyLines, and otherItems."
  echo "  - Generate sports_page with overview, active subtopics, compact matchStatus, and otherItems."
  echo "  - Preserve morning brief source titles exactly; do not summarize morning briefs into a roundup."
  echo "  - Put Snooker World Championship under sports_page.subtopics, not topic_reports.snooker."
  echo "  - Keep refs resolvable to items in today's JSON."
  echo "Reference contract: ${PROJECT_ROOT}/FRONTEND_NEWS_CONTRACT.md"
}
```

- [ ] **Step 2: Extend validation with new optional fields**

Inside `validate_ai_json()` in `scripts/hermes_daily_news.sh`, after existing `story_clusters` validation and before `reports = data.get("topic_reports") or {}`, add:

```python
daily_home = data.get("daily_home") or {}
if daily_home:
    if not isinstance(daily_home, dict):
        raise SystemExit("daily_home must be an object")
    highlights = daily_home.get("highlights")
    if not isinstance(highlights, list) or not highlights:
        raise SystemExit("daily_home.highlights must be a non-empty list when daily_home exists")
    for index, highlight in enumerate(highlights):
        if not isinstance(highlight, dict):
            raise SystemExit(f"daily_home.highlights[{index}] must be an object")
        for field in ("id", "title", "summary", "label", "target"):
            if not highlight.get(field):
                raise SystemExit(f"daily_home.highlights[{index}] missing {field}")
        target = highlight.get("target")
        if not isinstance(target, dict):
            raise SystemExit(f"daily_home.highlights[{index}].target must be an object")
        if target.get("type") not in {"topic", "dailyLine", "subtopic", "special"}:
            raise SystemExit(f"daily_home.highlights[{index}].target has invalid type")

topic_pages = data.get("topic_pages") or {}
if topic_pages:
    if not isinstance(topic_pages, dict):
        raise SystemExit("topic_pages must be an object")
    for topic_id, page in topic_pages.items():
        if topic_id not in topics:
            raise SystemExit(f"topic_pages has invalid topic: {topic_id}")
        if not isinstance(page, dict):
            raise SystemExit(f"topic_pages.{topic_id} must be an object")
        daily_lines = page.get("dailyLines") or []
        overview = page.get("overview") or []
        line_ids = {line.get("id") for line in daily_lines if isinstance(line, dict)}
        for index, entry in enumerate(overview):
            if not isinstance(entry, dict) or entry.get("dailyLineId") not in line_ids:
                raise SystemExit(f"topic_pages.{topic_id}.overview[{index}] points to missing dailyLineId")
        morning_briefs = page.get("morningBriefs") or []
        for index, brief in enumerate(morning_briefs):
            for field in ("id", "title", "url", "source"):
                if not brief.get(field):
                    raise SystemExit(f"topic_pages.{topic_id}.morningBriefs[{index}] missing {field}")
        for index, line in enumerate(daily_lines):
            for field in ("id", "title", "summary", "items"):
                if not line.get(field):
                    raise SystemExit(f"topic_pages.{topic_id}.dailyLines[{index}] missing {field}")

sports_page = data.get("sports_page") or {}
if sports_page:
    if not isinstance(sports_page, dict):
        raise SystemExit("sports_page must be an object")
    subtopics = sports_page.get("subtopics") or []
    subtopic_ids = {entry.get("id") for entry in subtopics if isinstance(entry, dict)}
    for index, entry in enumerate(sports_page.get("overview") or []):
        if not isinstance(entry, dict) or entry.get("subtopicId") not in subtopic_ids:
            raise SystemExit(f"sports_page.overview[{index}] points to missing subtopicId")
    for index, subtopic in enumerate(subtopics):
        for field in ("id", "label", "title", "summary", "kind", "items"):
            if not subtopic.get(field):
                raise SystemExit(f"sports_page.subtopics[{index}] missing {field}")
        for status_index, status in enumerate(subtopic.get("matchStatus") or []):
            if status.get("timeLabel") not in {"yesterday", "last_night", "this_morning", "today", "tonight"}:
                raise SystemExit(f"sports_page.subtopics[{index}].matchStatus[{status_index}] has invalid timeLabel")
            if status.get("status") not in {"result", "fixture", "focus", "status"}:
                raise SystemExit(f"sports_page.subtopics[{index}].matchStatus[{status_index}] has invalid status")
```

- [ ] **Step 3: Update source default subtopic mapping**

In `scripts/fetch_news.py`, update `SOURCE_DEFAULT_SUBTOPIC` so Sports source defaults match the new contract:

```python
SOURCE_DEFAULT_SUBTOPIC = {
    "hupu-all-nba": "basketball",
    "hupu-all-soccer": "football",
    "hupu-all-csl": "football",
    "hupu-all-cba": "basketball",
    "hupu-all-sports": "general-sports",
    "sina-sports": "general-sports",
    "guardian-football": "football",
    "guardian-tennis": "tennis",
    "arseblog": "arsenal",
    "fantasy-football-scout": "football",
    "bbc-sport": "general-sports",
    "bbc-snooker": "snooker-world-championship",
    "racefans": "racing",
}
```

- [ ] **Step 4: Checkpoint Hermes validation changes**

Run:

```bash
python3 -m py_compile /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/scripts/fetch_news.py
bash -n /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/scripts/hermes_daily_news.sh
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data diff --check
```

If the user has authorized commits for this execution pass, also run:

```bash
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data add scripts/hermes_daily_news.sh scripts/fetch_news.py
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data commit -m "chore: validate redesigned daily news data"
```

Expected:

```text
fetch_news.py compiles
hermes_daily_news.sh syntax check passes
no whitespace errors
status shows only the intended files, or a commit is created on redesign/lightweight-site when authorized
```

---

### Task 3: Frontend View Models

**Files:**
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/content.config.ts`
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/lib/dailyNews.ts`

- [ ] **Step 1: Extend content schema**

In `src/content.config.ts`, add these optional schema entries inside the `dailyNews` schema object, after `topic_reports`:

```ts
    daily_home: z.object({
      intro: z.string().optional(),
      highlights: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string(),
          label: z.string(),
          target: z.object({
            type: z.enum(['topic', 'dailyLine', 'subtopic', 'special']),
            topicSlug: z.string().optional(),
            dailyLineId: z.string().optional(),
            subtopicId: z.string().optional(),
            specialSlug: z.string().optional(),
          }),
        })
      ).optional(),
    }).optional(),
    topic_pages: z.record(z.string(), z.unknown()).optional(),
    sports_page: z.unknown().optional(),
```

- [ ] **Step 2: Add TypeScript view-model types**

Append these types after `DailyNewsData` in `src/lib/dailyNews.ts`:

```ts
export type DailyNewsHomeView = {
  date: string;
  updatedAt?: string;
  stats: { rawItems: number; topics: number; highlights: number };
  intro: string;
  highlights: Array<{
    id: string;
    rank: number;
    title: string;
    summary: string;
    label: string;
    href: string;
  }>;
  topics: Array<{
    slug: string;
    name: string;
    href: string;
    rawItems: number;
    sources: number;
    tags: string[];
    note?: string;
  }>;
  archive: Array<{ date: string; href: string }>;
};

export type GenericTopicPageView = {
  topic: TopicConfig;
  date: string;
  updatedAt?: string;
  stats: { rawItems: number; sources: number; dailyLines: number };
  overview: Array<{ id: string; dailyLineId: string; text: string; href: string }>;
  morningBriefs: Array<{ id: string; title: string; url: string; source: string }>;
  dailyLines: Array<{
    id: string;
    title: string;
    summary: string;
    tags: string[];
    items: Array<{ id: string; title: string; url: string; source: string; note?: string }>;
  }>;
  otherItems: Array<{ id: string; label: string; title: string; url: string; source: string }>;
  sources: Array<{ id: string; name: string; count: number; url?: string }>;
};

export type SportsTopicPageView = {
  topic: TopicConfig;
  date: string;
  updatedAt?: string;
  stats: { rawItems: number; sources: number; subtopics: number };
  overview: Array<{ id: string; subtopicId: string; text: string; href: string }>;
  subtopics: Array<{
    id: string;
    label: string;
    title: string;
    summary: string;
    kind: 'sport' | 'league' | 'team' | 'tournament' | 'athletes' | 'mixed';
    matchStatus: Array<{
      id: string;
      timeLabel: 'yesterday' | 'last_night' | 'this_morning' | 'today' | 'tonight';
      title: string;
      note?: string;
      status: 'result' | 'fixture' | 'focus' | 'status';
      url?: string;
    }>;
    items: Array<{ id: string; title: string; url: string; source: string; note?: string }>;
    deeperPageHref?: string;
  }>;
  otherItems: Array<{ id: string; label: string; title: string; url: string; source: string }>;
  sources: Array<{ id: string; name: string; count: number; url?: string }>;
};
```

- [ ] **Step 3: Add href helpers**

Append these helpers near `formatDateLabel`:

```ts
export function getTopicHref(topicSlug: string, date: string) {
  return `/daily-news/topic/${topicSlug}/?date=${date}`;
}

export function getTopicAnchorHref(topicSlug: string, date: string, anchor: string) {
  return `${getTopicHref(topicSlug, date)}#${anchor}`;
}
```

- [ ] **Step 4: Add home view builder**

Append this function near the normalized cluster helpers:

```ts
export function buildDailyNewsHomeView(
  data: DailyNewsData | undefined,
  topics: TopicConfig[],
  availableDates: string[],
): DailyNewsHomeView {
  const date = data?.date || availableDates[0] || '';
  const activeTopics = topics.filter(topic => topic.active !== false && topic.type !== 'shortterm');
  const clusters = normalizeStoryClusters(data, activeTopics);
  const explicitHighlights = (data as DailyNewsData & {
    daily_home?: {
      intro?: string;
      highlights?: Array<{
        id: string;
        title: string;
        summary: string;
        label: string;
        target: { type: string; topicSlug?: string; dailyLineId?: string; subtopicId?: string; specialSlug?: string };
      }>;
    };
  } | undefined)?.daily_home?.highlights || [];

  const highlights = explicitHighlights.length
    ? explicitHighlights.slice(0, 12).map((highlight, index) => {
        const topicSlug = highlight.target.topicSlug || 'tech';
        const anchor = highlight.target.dailyLineId
          ? `line-${highlight.target.dailyLineId.replace(/^line-/, '')}`
          : highlight.target.subtopicId || '';
        const href = highlight.target.type === 'special' && highlight.target.specialSlug
          ? `/daily-news/special/${highlight.target.specialSlug}/?date=${date}`
          : anchor
            ? getTopicAnchorHref(topicSlug, date, anchor)
            : getTopicHref(topicSlug, date);
        return { ...highlight, rank: index + 1, href };
      })
    : getLeadClusters(clusters, 10).map((cluster, index) => ({
        id: cluster.id,
        rank: index + 1,
        title: cluster.title,
        summary: compactText(cluster.summary, 92),
        label: topics.find(topic => topic.id === cluster.topic)?.name || cluster.topic,
        href: getTopicAnchorHref(cluster.topic, date, cluster.topic === 'sports' && cluster.subtopic ? cluster.subtopic : `line-${cluster.id}`),
      }));

  return {
    date,
    updatedAt: data?.update_time,
    stats: {
      rawItems: data?.items?.length || 0,
      topics: activeTopics.length,
      highlights: highlights.length,
    },
    intro: (data as DailyNewsData & { daily_home?: { intro?: string } } | undefined)?.daily_home?.intro
      || '今天直接列出值得优先看的热点，每条进入对应主题页继续阅读引用、背景和来源。',
    highlights,
    topics: activeTopics.map(topic => {
      const topicItems = data?.items?.filter(item => item.topic === topic.id) || [];
      return {
        slug: topic.id,
        name: topic.name,
        href: getTopicHref(topic.id, date),
        rawItems: topicItems.length,
        sources: new Set(topicItems.map(item => item.source)).size,
        tags: (topic.subtopics || []).filter(subtopic => subtopic.id !== 'morning-brief').slice(0, 5).map(subtopic => subtopic.name),
        note: topic.description,
      };
    }).filter(topic => topic.rawItems > 0),
    archive: availableDates.slice(0, 8).map(entryDate => ({
      date: entryDate,
      href: `/daily-news/?date=${entryDate}`,
    })),
  };
}
```

- [ ] **Step 5: Add generic topic view builder**

Append this function after `buildDailyNewsHomeView`:

```ts
export function buildGenericTopicPageView(
  data: DailyNewsData | undefined,
  topic: TopicConfig,
  sourceMeta: Map<string, { name: string; url?: string; topic: string }>,
): GenericTopicPageView {
  const date = data?.date || '';
  const topicItems = data?.items?.filter(item => item.topic === topic.id) || [];
  const clusters = getTopicClusters(normalizeStoryClusters(data, [topic]), topic.id).filter(cluster => cluster.subtopic !== 'morning-brief');
  const morningBriefs = topicItems
    .filter(item => getItemSubtopic(item, topic) === 'morning-brief')
    .slice(0, 8)
    .map((item, index) => ({
      id: `morning-${index + 1}`,
      title: item.title,
      url: item.url,
      source: item.source,
    }));

  const dailyLines = clusters.slice(0, 10).map((cluster, index) => {
    const refs = resolveClusterRefs(topicItems.length ? topicItems : data?.items || [], cluster, 6);
    const id = `line-${String(index + 1).padStart(2, '0')}`;
    return {
      id,
      title: cluster.title,
      summary: cluster.summary,
      tags: cluster.subtopic ? [getSubtopicName(topic, cluster.subtopic)] : [],
      items: refs.map((item, itemIndex) => ({
        id: `${id}-item-${itemIndex + 1}`,
        title: item.title,
        url: item.url,
        source: item.source,
        note: getItemSummary(item),
      })),
    };
  });

  const usedUrls = new Set([
    ...morningBriefs.map(item => item.url),
    ...dailyLines.flatMap(line => line.items.map(item => item.url)),
  ]);
  const otherItems = topicItems
    .filter(item => !usedUrls.has(item.url))
    .slice(0, 20)
    .map((item, index) => ({
      id: `other-${index + 1}`,
      label: getSubtopicName(topic, getItemSubtopic(item, topic)) || '其他',
      title: item.title,
      url: item.url,
      source: item.source,
    }));

  const sourceCounts = new Map<string, number>();
  topicItems.forEach(item => sourceCounts.set(item.source, (sourceCounts.get(item.source) || 0) + 1));

  return {
    topic,
    date,
    updatedAt: data?.update_time,
    stats: {
      rawItems: topicItems.length,
      sources: sourceCounts.size,
      dailyLines: dailyLines.length,
    },
    overview: dailyLines.slice(0, 8).map((line, index) => ({
      id: `overview-${index + 1}`,
      dailyLineId: line.id,
      text: line.summary,
      href: `#${line.id}`,
    })),
    morningBriefs,
    dailyLines,
    otherItems,
    sources: Array.from(sourceCounts.entries()).map(([id, count]) => ({
      id,
      name: sourceMeta.get(id)?.name || id,
      url: sourceMeta.get(id)?.url,
      count,
    })),
  };
}
```

- [ ] **Step 6: Add sports topic view builder**

Append this function after `buildGenericTopicPageView`:

```ts
export function buildSportsTopicPageView(
  data: DailyNewsData | undefined,
  topic: TopicConfig,
  sourceMeta: Map<string, { name: string; url?: string; topic: string }>,
): SportsTopicPageView {
  const date = data?.date || '';
  const topicItems = data?.items?.filter(item => item.topic === topic.id || item.topic === 'snooker') || [];
  const rawGroups = groupItemsBySubtopic(topicItems.map(item => ({
    ...item,
    topic: topic.id,
    subtopic: item.topic === 'snooker' ? 'snooker-world-championship' : item.subtopic,
  })), topic);
  const configuredNames = new Map((topic.subtopics || []).map(subtopic => [subtopic.id, subtopic.name]));
  const activeGroups = rawGroups
    .filter(group => group.id !== 'general-sports' && group.items.length >= 2)
    .slice(0, 8);

  const subtopics = activeGroups.map(group => {
    const label = configuredNames.get(group.id) || group.name;
    const items = group.items.slice(0, 10).map((item, index) => ({
      id: `${group.id}-item-${index + 1}`,
      title: item.title,
      url: item.url,
      source: item.source,
      note: getItemSummary(item),
    }));
    return {
      id: group.id,
      label,
      title: label,
      summary: `${label}今日有 ${group.items.length} 条相关内容，下面保留重点线索和引用入口。`,
      kind: group.id.includes('snooker') ? 'tournament' as const
        : group.id === 'arsenal' ? 'team' as const
        : group.id === 'basketball' ? 'league' as const
        : group.id === 'chinese-athletes' ? 'athletes' as const
        : 'sport' as const,
      matchStatus: [] as SportsTopicPageView['subtopics'][number]['matchStatus'],
      items,
    };
  });

  const usedUrls = new Set(subtopics.flatMap(subtopic => subtopic.items.map(item => item.url)));
  const otherItems = topicItems
    .filter(item => !usedUrls.has(item.url))
    .slice(0, 20)
    .map((item, index) => ({
      id: `sports-other-${index + 1}`,
      label: configuredNames.get(getItemSubtopic(item, topic) || '') || '综合体育',
      title: item.title,
      url: item.url,
      source: item.source,
    }));

  const sourceCounts = new Map<string, number>();
  topicItems.forEach(item => sourceCounts.set(item.source, (sourceCounts.get(item.source) || 0) + 1));

  return {
    topic,
    date,
    updatedAt: data?.update_time,
    stats: {
      rawItems: topicItems.length,
      sources: sourceCounts.size,
      subtopics: subtopics.length,
    },
    overview: subtopics.slice(0, 8).map((subtopic, index) => ({
      id: `sports-overview-${index + 1}`,
      subtopicId: subtopic.id,
      text: subtopic.summary,
      href: `#${subtopic.id}`,
    })),
    subtopics,
    otherItems,
    sources: Array.from(sourceCounts.entries()).map(([id, count]) => ({
      id,
      name: sourceMeta.get(id)?.name || id,
      url: sourceMeta.get(id)?.url,
      count,
    })),
  };
}
```

- [ ] **Step 7: Build after helper changes**

Run:

```bash
cd /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io
npm run build
```

Expected:

```text
sync:data completes
astro build exits 0
```

- [ ] **Step 8: Checkpoint frontend view-model changes**

Run:

```bash
git -C /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io diff --check
```

If the user has authorized commits for this execution pass, also run:

```bash
git -C /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io add src/content.config.ts src/lib/dailyNews.ts
git -C /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io commit -m "feat: add daily news redesign view models"
```

Expected:

```text
no whitespace errors
status shows only the intended files, or a commit is created on redesign/lightweight-site when authorized
```

---

### Task 4: Daily News Home Page

**Files:**
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/pages/daily-news/index.astro`
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/styles/global.css`

- [ ] **Step 1: Replace old home data preparation**

In `src/pages/daily-news/index.astro`, replace the imports from `../../lib/dailyNews` with:

```ts
import {
  buildDailyNewsHomeView,
  buildSourceMeta,
  formatDateLabel,
  getWeekdayLabel,
  type DailyNewsData,
  type TopicConfig,
} from '../../lib/dailyNews';
```

Then replace all local derived variables after `currentData` with:

```ts
const activeTopics = topics.filter(topic => topic.active !== false);
const sourceMeta = buildSourceMeta(topics);
const homeView = buildDailyNewsHomeView(currentData, activeTopics, availableDates);
const currentWeekday = getWeekdayLabel(currentDate);
const updatedLabel = currentData?.update_time
  ? new Date(currentData.update_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  : '';
```

- [ ] **Step 2: Replace the sidebar markup**

Use this sidebar inside `<BaseLayout>`:

```astro
<aside class="daily-sidebar">
  <div class="daily-sidebar-inner">
    <div class="daily-sidebar-block">
      <span class="daily-sidebar-kicker">Daily</span>
      <div class="daily-date-switch">
        <a href={homeView.archive[1]?.href || '#'} aria-label="前一天">‹</a>
        <button type="button" class="daily-date-button" data-calendar-trigger aria-expanded="false">
          {formatDateLabel(currentDate)}
        </button>
        <a href={homeView.archive.find(entry => entry.date > currentDate)?.href || '#'} aria-label="后一天">›</a>
      </div>
      <p>{currentWeekday}{updatedLabel && ` · ${updatedLabel} 更新`}</p>
      <div class="daily-calendar-popover" data-calendar-popover>
        <Calendar dates={availableDates} currentDate={currentDate} />
      </div>
    </div>
    <nav class="daily-side-nav" aria-label="日报导航">
      <a href="#highlights" class="active" data-section-link="true"><span>热点</span><b>{homeView.highlights.length}</b></a>
      <a href="#topics" data-section-link="true"><span>主题</span><b>{homeView.topics.length}</b></a>
      <a href="#archive" data-section-link="true"><span>归档</span><b>→</b></a>
    </nav>
  </div>
</aside>
```

- [ ] **Step 3: Replace the main home markup**

Use this main structure:

```astro
<main class="daily-main daily-home-main">
  <header class="daily-hero">
    <p class="daily-stats">
      <span>{homeView.stats.rawItems} 条原文</span>
      <span>{homeView.stats.topics} 个主题</span>
      <span>{homeView.stats.highlights} 条热点</span>
    </p>
    <h1>{formatDateLabel(currentDate)} 日报</h1>
    <p>{homeView.intro}</p>
  </header>

  <section id="highlights" class="daily-section">
    <div class="daily-section-header">
      <h2>今日热点</h2>
      <span>按阅读优先级排列</span>
    </div>
    <ol class="daily-highlight-list">
      {homeView.highlights.map(highlight => (
        <li>
          <a href={highlight.href}>
            <span class="daily-rank">{String(highlight.rank).padStart(2, '0')}</span>
            <strong>{highlight.title}</strong>
            <p>{highlight.summary}</p>
            <em>{highlight.label}</em>
          </a>
        </li>
      ))}
    </ol>
  </section>

  <section id="topics" class="daily-section">
    <div class="daily-section-header">
      <h2>主题</h2>
      <span>进入板块查看展开信息和来源</span>
    </div>
    <div class="daily-topic-list">
      {homeView.topics.map(topic => (
        <a href={topic.href} class="daily-topic-row">
          <strong>{topic.name}</strong>
          <span>{topic.rawItems} 条原文 · {topic.sources} 个来源</span>
          <p>{topic.tags.join(' / ')}</p>
          <em>进入</em>
        </a>
      ))}
    </div>
  </section>

  <section id="archive" class="daily-section">
    <div class="daily-section-header">
      <h2>归档</h2>
      <span>按日期回看</span>
    </div>
    <div class="daily-archive-list">
      {homeView.archive.map(entry => (
        <a href={entry.href}>{formatDateLabel(entry.date)}</a>
      ))}
    </div>
  </section>
</main>
```

- [ ] **Step 4: Add home page behavior script**

Replace the existing page script with this:

```html
<script>
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sidebarLinks = document.querySelectorAll('[data-section-link="true"]');
  const sections = document.querySelectorAll('.daily-section[id]');
  const trigger = document.querySelector('[data-calendar-trigger]');
  const popover = document.querySelector('[data-calendar-popover]');

  function closeCalendar() {
    popover?.classList.remove('is-open');
    trigger?.setAttribute('aria-expanded', 'false');
  }

  trigger?.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = popover?.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });

  document.addEventListener('click', (event) => {
    if (!popover?.classList.contains('is-open')) return;
    if (popover.contains(event.target) || trigger?.contains(event.target)) return;
    closeCalendar();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCalendar();
  });

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.history.pushState(null, '', href);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sidebarLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-20% 0px -65% 0px' });

  sections.forEach(section => observer.observe(section));
</script>
```

- [ ] **Step 5: Add home-page visual density rules**

In `src/styles/global.css`, keep the accepted airy layout but raise reading text slightly. The page should not return to the earlier oversized mock. Use this baseline for daily-news pages:

```css
.daily-news-layout {
  --daily-text: 1.06rem;
  --daily-small: 0.92rem;
  --daily-meta: 0.86rem;
  --daily-line-height: 1.82;
}

.daily-hero p,
.daily-highlight-list p,
.daily-topic-row,
.daily-overview-list p,
.daily-line-block p,
.sports-news-list p,
.daily-other-list strong {
  font-size: var(--daily-text);
  line-height: var(--daily-line-height);
}

.daily-stats,
.daily-section-header span,
.daily-sidebar,
.daily-rank,
.daily-topic-row span,
.daily-topic-row em,
.daily-other-list span,
.daily-other-list em {
  font-size: var(--daily-small);
}

.daily-section {
  padding-block: clamp(3.25rem, 5vw, 5.25rem);
}

.daily-section + .daily-section {
  border-top: 1px solid var(--border-color, #e8e2d7);
}

@media (max-width: 760px) {
  .daily-news-layout {
    --daily-text: 1rem;
    --daily-small: 0.9rem;
    --daily-meta: 0.82rem;
    --daily-line-height: 1.76;
  }

  .daily-hero h1 {
    font-size: clamp(2.4rem, 13vw, 4rem);
    line-height: 1.05;
  }

  .daily-section {
    padding-block: 2.75rem;
  }
}
```

- [ ] **Step 6: Build and checkpoint**

Run:

```bash
cd /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io
npm run build
git diff --check
```

If the user has authorized commits for this execution pass, also run:

```bash
git add src/pages/daily-news/index.astro src/styles/global.css
git commit -m "feat: redesign daily news home page"
```

Expected:

```text
astro build exits 0
home page routes generate successfully
status shows only the intended files, or a commit is created on redesign/lightweight-site when authorized
```

---

### Task 5: Generic Topic Page Rendering

**Files:**
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/pages/daily-news/topic/[id].astro`
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/styles/global.css`

- [ ] **Step 1: Replace generic topic variables**

For non-sports topics, build a `genericView`:

```ts
const isSportsTopic = topic.id === 'sports';
const genericView = isSportsTopic
  ? undefined
  : buildGenericTopicPageView(currentData, topic, sourceMeta);
```

- [ ] **Step 2: Render generic topic structure**

For `!isSportsTopic`, render:

```astro
<main class="daily-main daily-topic-main">
  <header class="daily-hero">
    <p class="daily-stats">
      <span>{genericView.stats.rawItems} 条原文</span>
      <span>{genericView.stats.sources} 个来源</span>
      <span>{genericView.stats.dailyLines} 条主线</span>
    </p>
    <h1>{genericView.topic.name}</h1>
    <p>{genericView.topic.description}</p>
  </header>

  <section id="overview" class="daily-section">
    <div class="daily-section-header">
      <h2>今日总览</h2>
      <span>点击进入对应主线</span>
    </div>
    <ol class="daily-overview-list">
      {genericView.overview.map((entry, index) => (
        <li>
          <a href={entry.href}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{entry.text}</p>
          </a>
        </li>
      ))}
    </ol>
  </section>

  <section id="morning" class="daily-section">
    <div class="daily-section-header">
      <h2>早报</h2>
      <span>只列原文标题</span>
    </div>
    <div class="morning-link-list">
      {genericView.morningBriefs.map(item => (
        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
      ))}
    </div>
  </section>

  <section id="daily-lines" class="daily-section">
    <div class="daily-section-header">
      <h2>今日主线</h2>
      <span>展开引用和背景</span>
    </div>
    {genericView.dailyLines.map(line => (
      <article id={line.id} class="daily-line-block">
        <header>
          <h3>{line.title}</h3>
          <p>{line.summary}</p>
          <div>{line.tags.map(tag => <span>{tag}</span>)}</div>
        </header>
        <div class="daily-line-refs">
          {line.items.map(item => (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <strong>{item.title}</strong>
              {item.note && <p>{item.note}</p>}
              <em>{getSourceName(item.source, sourceMeta)}</em>
            </a>
          ))}
        </div>
      </article>
    ))}
  </section>

  <section id="other" class="daily-section">
    <div class="daily-section-header">
      <h2>其他值得看</h2>
      <span>{genericView.otherItems.length} 条</span>
    </div>
    <div class="daily-other-list">
      {genericView.otherItems.map(item => (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          <span>{item.label}</span>
          <strong>{item.title}</strong>
          <em>{getSourceName(item.source, sourceMeta)}</em>
        </a>
      ))}
    </div>
  </section>
</main>
```

- [ ] **Step 3: Add generic topic responsive rules**

In `src/styles/global.css`, add the topic-page responsive rules alongside the generic topic page styles:

```css
.daily-topic-main {
  max-width: min(100%, 980px);
}

.daily-line-block {
  padding-block: clamp(2rem, 3vw, 3rem);
}

.daily-line-refs a,
.morning-link-list a,
.daily-other-list a {
  min-height: 44px;
}

@media (max-width: 760px) {
  .daily-topic-main {
    max-width: 100%;
  }

  .daily-overview-list a,
  .daily-line-refs a,
  .daily-other-list a {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .daily-overview-list span,
  .daily-other-list span,
  .daily-other-list em {
    justify-self: start;
  }
}
```

- [ ] **Step 4: Build and checkpoint**

Run:

```bash
cd /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io
npm run build
git diff --check
```

If the user has authorized commits for this execution pass, also run:

```bash
git add 'src/pages/daily-news/topic/[id].astro' src/styles/global.css
git commit -m "feat: redesign generic daily news topic pages"
```

Expected:

```text
astro build exits 0
topic routes generate successfully
status shows only the intended files, or a commit is created on redesign/lightweight-site when authorized
```

---

### Task 6: Sports Topic Page Rendering

**Files:**
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/pages/daily-news/topic/[id].astro`
- Modify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io/src/styles/global.css`

- [ ] **Step 1: Add sports view variable**

In `src/pages/daily-news/topic/[id].astro`, add:

```ts
const sportsView = isSportsTopic
  ? buildSportsTopicPageView(currentData, topic, sourceMeta)
  : undefined;
```

- [ ] **Step 2: Render Sports overview and active subtopics**

For `isSportsTopic`, render:

```astro
<main class="daily-main daily-topic-main daily-sports-main">
  <header class="daily-hero">
    <p class="daily-stats">
      <span>{sportsView.stats.rawItems} 条原文</span>
      <span>{sportsView.stats.sources} 个来源</span>
      <span>{sportsView.stats.subtopics} 个子主题</span>
    </p>
    <h1>{sportsView.topic.name}</h1>
    <p>{sportsView.topic.description}</p>
  </header>

  <section id="overview" class="daily-section">
    <div class="daily-section-header">
      <h2>今日总览</h2>
      <span>进入对应子主题</span>
    </div>
    <ol class="daily-overview-list">
      {sportsView.overview.map((entry, index) => (
        <li>
          <a href={entry.href}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{entry.text}</p>
          </a>
        </li>
      ))}
    </ol>
  </section>

  {sportsView.subtopics.map(subtopic => (
    <section id={subtopic.id} class="daily-section sports-subtopic-section">
      <div class="sports-subtopic-heading">
        <span>{subtopic.label}</span>
        <div>
          <h2>{subtopic.title}</h2>
          <p>{subtopic.summary}</p>
        </div>
      </div>

      {subtopic.matchStatus.length > 0 && (
        <div class="sports-match-strip">
          {subtopic.matchStatus.map(status => (
            <a href={status.url || '#'} class="sports-match-row">
              <span>{status.timeLabel}</span>
              <strong>{status.title}</strong>
              {status.note && <em>{status.note}</em>}
            </a>
          ))}
        </div>
      )}

      <div class="sports-news-list">
        {subtopic.items.map(item => (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <strong>{item.title}</strong>
            {item.note && <p>{item.note}</p>}
            <em>{getSourceName(item.source, sourceMeta)}</em>
          </a>
        ))}
      </div>
    </section>
  ))}

  <section id="other" class="daily-section">
    <div class="daily-section-header">
      <h2>其他值得看</h2>
      <span>{sportsView.otherItems.length} 条</span>
    </div>
    <div class="daily-other-list">
      {sportsView.otherItems.map(item => (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          <span>{item.label}</span>
          <strong>{item.title}</strong>
          <em>{getSourceName(item.source, sourceMeta)}</em>
        </a>
      ))}
    </div>
  </section>
</main>
```

- [ ] **Step 3: Add sports responsive rules**

In `src/styles/global.css`, add mobile behavior for sports subtopics:

```css
.sports-subtopic-heading {
  display: grid;
  grid-template-columns: minmax(7rem, 10rem) 1fr;
  gap: clamp(1.25rem, 4vw, 3rem);
  align-items: start;
}

.sports-match-strip {
  display: grid;
  gap: 0.45rem;
  margin-block: 1.25rem 1.75rem;
}

.sports-match-row {
  display: grid;
  grid-template-columns: 7rem 1fr auto;
  gap: 1rem;
  align-items: baseline;
  padding-block: 0.55rem;
}

.sports-news-list a {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem 1.25rem;
  padding-block: 1.3rem;
}

@media (max-width: 760px) {
  .sports-subtopic-heading,
  .sports-match-row,
  .sports-news-list a {
    grid-template-columns: 1fr;
  }

  .sports-match-row {
    gap: 0.2rem;
    padding-block: 0.7rem;
  }

  .sports-news-list a {
    gap: 0.35rem;
  }
}
```

- [ ] **Step 4: Build and checkpoint**

Run:

```bash
cd /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io
npm run build
git diff --check
```

If the user has authorized commits for this execution pass, also run:

```bash
git add 'src/pages/daily-news/topic/[id].astro' src/styles/global.css
git commit -m "feat: redesign sports daily news topic page"
```

Expected:

```text
astro build exits 0
sports topic route generates successfully
status shows only the intended files, or a commit is created on redesign/lightweight-site when authorized
```

---

### Task 7: Final Verification

**Files:**
- Verify: `/Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io`
- Verify: `/Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data`

- [ ] **Step 1: Run data repo checks**

Run:

```bash
python3 -m py_compile /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/scripts/fetch_news.py
bash -n /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data/scripts/hermes_daily_news.sh
git -C /Users/jiangzhengjie/Project/PersonalWebsite/daily-news-data status --short --branch
```

Expected:

```text
fetch_news.py compiles
hermes_daily_news.sh syntax check passes
daily-news-data is on redesign/lightweight-site with no unstaged changes
```

- [ ] **Step 2: Run frontend build**

Run:

```bash
cd /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io
npm run build
git status --short --branch
```

Expected:

```text
astro build exits 0
AK22AK.github.io is on redesign/lightweight-site with no unstaged changes
```

- [ ] **Step 3: Start local preview for user review**

Run:

```bash
cd /Users/jiangzhengjie/Project/PersonalWebsite/AK22AK.github.io
npm run dev -- --host 127.0.0.1
```

Expected:

```text
Local dev server prints a localhost URL
```

- [ ] **Step 4: Review target URLs**

Open and inspect:

```text
http://127.0.0.1:<port>/daily-news/
http://127.0.0.1:<port>/daily-news/topic/tech/
http://127.0.0.1:<port>/daily-news/topic/sports/
```

Expected:

```text
Home: cover -> highlights -> topics -> archive
Tech: overview -> morning briefs -> daily lines -> other worthwhile items -> sources
Sports: overview -> active subtopics with compact match status -> other worthwhile items -> sources
```

- [ ] **Step 5: Verify mobile layouts**

Use browser device mode or Playwright screenshots for at least these viewport sizes:

```text
390 x 844  (iPhone portrait)
768 x 1024 (tablet portrait)
1440 x 1000 (desktop reference)
```

Inspect these URLs:

```text
http://127.0.0.1:<port>/daily-news/
http://127.0.0.1:<port>/daily-news/topic/tech/
http://127.0.0.1:<port>/daily-news/topic/sports/
```

Expected:

```text
No horizontal overflow.
Header nav remains usable.
Daily sidebar collapses or stacks without covering content.
Date calendar opens and closes on outside click and Escape.
Home highlights remain readable with slightly larger body text.
Tech daily lines do not create cramped two-column rows on mobile.
Sports match status rows are compact but readable on mobile.
Sources and long-tail lists remain scannable.
```

---

## Self-Review

- Homepage spec coverage:
  - Task 4 implements cover structure, priority highlights, topic entry rows, archive, collapsed calendar, and smooth anchor behavior.
- Generic topic spec coverage:
  - Task 3 and Task 5 implement overview linked to daily lines, morning briefs as original-title links, daily lines, other worthwhile items, and bottom sources.
- Sports spec coverage:
  - Task 1, Task 2, Task 3, and Task 6 move tournaments into Sports, render active subtopics, keep match status compact, and preserve 5-10 item capacity plus long-tail items.
- Hermes boundary coverage:
  - Task 1 and Task 2 keep Hermes responsible for scheduled data and the frontend responsible for rendering/adapters.
- Compatibility:
  - Task 3 adapters derive usable views from current `items` and `story_clusters` while allowing new `daily_home`, `topic_pages`, and `sports_page` fields when Hermes starts producing them.
- Visual/mobile coverage:
  - Task 4, Task 5, Task 6, and Task 7 explicitly raise reading text slightly while preserving spacing, and require mobile inspection for home, tech, and sports pages.
