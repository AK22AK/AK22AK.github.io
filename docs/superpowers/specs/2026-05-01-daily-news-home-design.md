# Daily News Home Page Design

Date: 2026-05-01
Scope: daily news home page.

## Goal

The daily news home page is a clean daily cover. It should help readers quickly answer:

- What is worth reading today?
- Which topic page should I enter next?
- Where can I review older daily reports?

The home page should not be a full cross-topic digest, source directory, or replacement for topic pages. It provides priority and navigation. Topic pages carry detailed summaries, supporting links, and sources.

## Page Structure

The stable section order is:

1. Header and date context
2. Daily intro
3. Today highlights
4. Topics
5. Archive

The left sidebar uses stable anchors:

- Highlights
- Topics
- Archive

The date selector belongs in the sidebar. It should default to a clean text form, such as `‹ 2026.04.25 ›`, and reveal the calendar only after the date is clicked. Clicking outside or pressing Escape closes the calendar.

## Header And Daily Intro

The page title should be simple, for example `2026.04.25 日报`.

Do not generate a single cross-topic headline such as "英伟达适配 DeepSeek-V4，奥沙利文与希金斯再战". Cross-topic synthesis is usually too forced and makes unrelated items look artificially connected.

The intro copy should be restrained and functional. It can say that the page lists priority highlights and links into topic pages for details, references, background, and sources.

## Today Highlights

Today Highlights is the primary section on the home page.

Highlights should be ordered by reading priority, not by topic order. A normal day can show roughly 6-12 highlights depending on volume.

Each highlight must link to one of:

- A specific `dailyLine` anchor inside a topic page.
- A specific subtopic anchor inside a topic page.
- A specific temporary special page only when a deeper page is truly needed.
- A topic page when no finer anchor is available.

Each highlight should include:

- Rank number
- Title
- One concise explanation
- Topic or special label
- Target link

Highlights must not be isolated summaries. A reader who clicks a highlight should land close to the expanded context or supporting links.

## Topics

The Topics section provides entry points into topic pages.

Each topic row should include:

- Topic name
- Lightweight counts, such as raw items and source count
- A short list of tags/entities for scanning
- Link to the topic page

Examples:

- `科技` with tags such as `AI / 芯片 / 汽车 / 工具`
- `体育` with tags such as `阿森纳 / 斯诺克世锦赛 / 网球 / NBA`

The home page should not show all sources for each topic. Sources belong at the bottom of the corresponding topic page.

## Temporary Specials

Some concentrated news cycles may deserve a temporary page, but the threshold should be high.

Examples:

- A major tournament
- A major launch event
- A short-lived breaking-news cluster

Sports tournaments and major events should default to active subtopics inside the sports page. For example, Snooker World Championship appears as a sports subtopic, not as a peer of Sports on the home page.

If an event becomes large enough to need a deeper temporary page, the home page should still prefer linking to the corresponding topic-page subtopic anchor. The topic page can then link onward to the deeper temporary page.

## Archive

The Archive section should be minimal. It should provide recent daily report links and a path to older dates.

The home page should not turn archive into a large calendar by default. The date selector already handles date navigation.

## Relationship To Topic Pages

The home page is upstream from topic pages:

- Home highlights point into topic pages.
- Topic pages provide overview, morning briefs, daily lines, other worthwhile items, and sources.
- Home topic rows point to topic pages.

The home page must not duplicate topic-page sources or detailed summaries. It should only carry enough context for navigation.

## Data Contract

Hermes owns scheduled collection and data generation. The frontend owns presentation and navigation.

Required home-page data shape:

```ts
type DailyNewsHome = {
  date: string;
  updatedAt: string;
  stats: {
    rawItems: number;
    topics: number;
    highlights: number;
  };
  intro?: string;
  highlights: Array<{
    id: string;
    rank: number;
    title: string;
    summary: string;
    label: string;
    target: {
      type: "topic" | "dailyLine" | "subtopic" | "special";
      topicSlug?: string;
      dailyLineId?: string;
      subtopicId?: string;
      specialSlug?: string;
      href: string;
    };
  }>;
  topics: Array<{
    slug: string;
    name: string;
    kind: "regular";
    href: string;
    rawItems: number;
    sources?: number;
    tags: string[];
    note?: string;
  }>;
  archive: Array<{
    date: string;
    href: string;
  }>;
};
```

Rules:

- `highlights[*].target.href` must resolve to a real topic page, daily-line anchor, subtopic anchor, or truly needed temporary special page.
- Prefer `target.type = "dailyLine"` when the highlight maps to a topic-page daily line.
- Use `target.type = "subtopic"` when the highlight maps to a sports subtopic such as Snooker World Championship.
- Use `target.type = "special"` only when a separate temporary page is truly needed.
- The home page must not expose topic-level source lists.
- The home page must not generate a forced cross-topic headline.
- Topic tags are for scanning only; they do not create fixed sub-navigation.

## Open Scope

This spec finalizes the daily news home page information architecture. It does not finalize personal site homepage, article pages, or full Astro implementation details.
