# Daily News Sports Topic Page Design

Date: 2026-05-04
Scope: daily news sports topic page.

## Goal

The sports topic page should match how readers naturally scan sports news: by project, league, team, player, and active tournament. It should not copy the technology page's fully dynamic daily-line model.

Sports needs active subtopics because competition context matters. A reader may enter through football, Snooker World Championship, tennis, NBA, F1, or a Chinese athletes line. These subtopics should be visible when they are active that day.

## Page Structure

The stable section order is:

1. Overview
2. Active subtopics
3. Other worthwhile items
4. Sources

The left sidebar uses:

- Overview
- One entry for each active subtopic
- Other
- Sources

There should not be a separate global `Schedule / Results` section. Match status belongs inside the relevant subtopic.

## Overview

The overview is an index into active subtopics.

Each overview item must:

- Reference one `subtopic_id`.
- Render as a link to that subtopic anchor.
- Use short judgment copy.
- Avoid summaries that cannot be expanded below.

## Active Subtopics

Sports subtopics are not a full permanent taxonomy. They are the active reading sections for that date.

Examples:

- Football
- Snooker World Championship
- Tennis
- Basketball / NBA
- Racing / F1
- Chinese and Asian athletes

A sport, league, team, or tournament should become an active subtopic when it has enough material to support a section, usually at least 5-10 meaningful items or a combination of match status and important context.

Major tournaments and temporary competitions should default to active subtopics inside Sports. For example, Snooker World Championship belongs under the sports topic page as a subtopic. It should not appear as a top-level home-page topic by default.

If a tournament becomes large enough to require a deeper temporary page, the sports subtopic can link to that deeper page. The home page should still prefer linking to the sports subtopic anchor.

## Subtopic Layout

Each subtopic should render:

1. Subtopic label and title
2. One short explanation
3. Compact match status block
4. Key news items

The match status block is a compact scanner, not the main content. It should use small rows and low visual weight.

Key news items carry the main reading value. Each subtopic should generally contain 5-10 items when enough data exists. Items should show a concise summary and source/reference label.

## Match Status Rules

Match status must stay within the daily-report time boundary.

Allowed:

- Yesterday
- Last night
- This morning
- Today
- Tonight

Avoid:

- Several days ago
- Later this week
- Generic labels such as `this week`
- Long future schedule blocks

For each subtopic, match status may include:

- Results from yesterday, last night, or this morning
- Fixtures happening today or tonight
- A small status label such as `result`, `fixture`, `focus`, or `Chinese athlete`

If a subtopic has no relevant match status for the daily window, omit the match status block rather than filling it with weak future schedule.

## Other Worthwhile Items

Other Worthwhile Items holds low-priority or sparse sports items that do not justify a full active subtopic that day.

Examples:

- Badminton
- Table tennis
- Volleyball
- Golf
- Combat sports
- Esports
- Running
- Sports business
- Transfers
- Opinion pieces

This section can be long, but it should not dilute the active subtopics.

## Sources

Sources stay at the bottom of the sports page. The home page should not list sports sources.

Sources should reflect only the selected date and sports topic.

## Data Contract

Hermes owns scheduled collection and data generation. The frontend owns presentation and navigation.

Required sports topic data shape:

```ts
type SportsTopicPage = {
  topic: "sports";
  date: string;
  updatedAt: string;
  stats: {
    rawItems: number;
    sources: number;
    subtopics: number;
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
    kind: "sport" | "league" | "team" | "tournament" | "athletes" | "mixed";
    matchStatus?: Array<{
      id: string;
      timeLabel: "yesterday" | "last_night" | "this_morning" | "today" | "tonight";
      title: string;
      note?: string;
      status: "result" | "fixture" | "focus" | "status";
      url?: string;
    }>;
    items: Array<{
      id: string;
      title: string;
      url: string;
      source: string;
      note?: string;
    }>;
    deeperPageHref?: string;
  }>;
  otherItems: Array<{
    id: string;
    label: string;
    title: string;
    url: string;
    source: string;
  }>;
  sources: Array<{
    name: string;
    count: number;
    description?: string;
  }>;
};
```

Rules:

- `overview[*].subtopicId` must match a `subtopics[*].id`.
- Sports tournaments default to `subtopics[*].kind = "tournament"`.
- Match status must not include stale results or long future schedule.
- Each strong subtopic should aim for 5-10 key news items.
- Sparse sports items go into Other Worthwhile Items.

## Relationship To Daily News Home

The home page can highlight a sports tournament, team, or match, but its target should generally be the sports subtopic anchor:

- `/daily-news/topic/sports/#snooker-world-championship`
- `/daily-news/topic/sports/#football`

Separate temporary pages are optional deep pages linked from sports subtopics, not default home-page peers of Sports.
