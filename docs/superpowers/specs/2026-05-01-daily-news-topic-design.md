# Daily News Topic Page Design

Date: 2026-05-01
Scope: daily news topic pages, starting with the technology topic.

## Goal

The topic page should help readers move from a short daily overview into the exact expanded context behind each point. It should not force technology news into fixed subcategories such as AI, chips, phones, computers, robots, or cars. Those concepts are useful as tags and entities, but not as permanent navigation sections.

## Page Structure

The stable section order is:

1. Overview
2. Morning briefs
3. Daily lines
4. Other worthwhile items
5. Sources

The left sidebar uses the same stable anchors:

- Overview
- Morning briefs
- Daily lines
- Other
- Sources

The sidebar must not list dynamic subtopics such as AI, chips, cars, phones, computers, or robots.

## Overview

The overview is an index into the daily lines, not an independent summary block.

Each overview item must:

- Reference exactly one `daily_line_id`.
- Render as a link to the corresponding daily line anchor.
- Use short, readable judgment copy.
- Avoid claims or summaries that cannot be expanded in the daily lines below.

This prevents the failure mode where a reader sees a useful sentence in the overview but cannot find the supporting links or expanded context.

## Morning Briefs

Morning briefs appear directly below the overview and above daily lines.

Morning briefs are original-entry links only. Hermes should preserve the source title and URL, and the frontend should render the original title directly. Do not generate a separate roundup summary for morning briefs.

Examples:

- `派早报：X 推出聊天软件 XChat`
- `IT早报 0427：追觅 CEO 俞浩炮轰小红书；曝库克为苹果留下十大新品规划`
- `科技爱好者周刊（第 394 期）：第二次 API 开放浪潮`

Do not prepend source labels if the source title already contains them.

## Daily Lines

Daily lines are dynamic reading clusters for the current date. They are not fixed taxonomy sections.

Hermes should generate 5-10 daily lines when enough material exists. A daily line should represent a meaningful reading path, not merely a category label.

Each daily line should include:

- `id`
- `title`
- `summary`
- `items`
- `item_count` or equivalent source/reference count
- Optional tags/entities such as `AI`, `芯片`, `手机`, `机器人`, `汽车`

The frontend renders each daily line as an anchored block with a short explanation and a small list of supporting links. Overview items deep-link to these blocks.

## Other Worthwhile Items

Items that do not clearly fit a daily line go into Other Worthwhile Items instead of being forced into a cluster.

This section can be long. A range of 10-20 items is acceptable when there is enough material, because it sits after the primary reading path and functions as long-tail reading.

Each item should keep a lightweight label such as `手机`, `电脑`, `社区`, `开源`, `政策`, or `论文`, plus one concise title or note.

## Sources

Sources stay at the bottom of the topic page. The daily news homepage should not list all topic-level sources.

The sources section should show only sources used by this topic page for the selected date, with lightweight counts and descriptions.

## Data Contract

Hermes owns scheduled collection and data generation. The frontend owns presentation and navigation.

Required topic-page data shape:

```ts
type TopicPage = {
  topic: string;
  date: string;
  updatedAt: string;
  stats: {
    rawItems: number;
    sources: number;
    dailyLines: number;
  };
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
    items: Array<{
      id: string;
      title: string;
      url: string;
      source: string;
      note?: string;
    }>;
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

- `overview[*].dailyLineId` must match a `dailyLines[*].id`.
- Morning briefs must not be summarized into a roundup.
- Fixed categories should be tags/entities, not permanent page sections.
- Other items should not be artificially clustered.

## Open Scope

This spec finalizes the topic page information architecture for the technology topic. It does not finalize the broader personal homepage, article pages, project pages, or full Astro implementation details.
