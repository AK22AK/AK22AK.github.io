# Daily News Feed Redesign

Date: 2026-07-01
Scope: daily news home and first-pass frontend refactor.

## Product Direction

The daily news home page is the primary reading surface. It should answer:

- What should I read today?
- What else appeared today if I keep scrolling?
- Which field am I currently filtering by?
- Which sources support a summarized item?

The page title and user-facing language should use `今日资讯`, not `今日热点`. Items are ordered from higher to lower reading value, but lower-ranked items are still normal information, not necessarily hot news.

## Information Architecture

Fields such as `科技` and `体育` remain as data/source categories and UI filters. They are not primary reading pages.

Rules:

- `/daily-news/` shows the mixed feed for the latest date.
- `/daily-news/{date}/` shows the mixed feed for that date.
- `?field={id}` filters the same feed UI to one field.
- Topic/module detail pages are not a product concept for the new IA.
- Existing topic URLs may remain temporarily for compatibility, but navigation should not point to them.

The first implementation keeps date pages and source/archive pages. A later cleanup can replace old topic pages with static redirects once all internal links stop depending on them.

## Feed Normalization

The frontend must normalize multiple historical data generations into one feed model:

1. Use `story_clusters` when present.
2. Otherwise convert `daily_home.highlights` into feed items.
3. Otherwise use `subtopic_sections` and `topic_summaries`.
4. Finally fall back to weighted raw `items`.

This preserves old data. Older dates may have weaker summaries or fewer source references, but they should still render in the same feed UI.

## Ranking And Balance

The feed should rank by reading value, not by module order.

Initial ranking inputs:

- Importance: `lead`, `major`, `minor`
- Heat level or inferred heat
- Number of supporting sources
- Existing extraction order from Hermes

Balance rule:

- Cross-field mixing is allowed and desired.
- Avoid letting one field dominate the whole first screen.
- The current frontend rule should not show more than three consecutive items from the same field when other fields still have remaining items.

This rule is intentionally simple. It should be easy to tune after daily use.

## Sources And Fields

The source-management model should be field-first:

- The main mental model is `I follow these fields`.
- Each field lists the sources that support it.
- A source may support multiple fields.
- A source-first view can exist as an auxiliary view, but it should not be the primary IA.

The first implementation does not build the field/source management page. It only documents the rule and keeps source references expandable inside feed items.

## First Implementation Scope

In scope:

- Replace the daily news home page with the mixed `今日资讯` feed.
- Support latest and historical date pages.
- Support `?field=` filtering in the static GitHub Pages build.
- Expand source references per feed item.
- Route primary navigation for fields to `?field=tech` and `?field=sports`.
- Add tests for feed normalization and legacy fallback.

Out of scope:

- Changing the Hermes data pipeline.
- Building a full field/source management UI.
- Removing old topic pages entirely.
- Designing a new visual system from scratch.
