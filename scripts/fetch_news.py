#!/usr/bin/env python3
"""
抓取每日新闻 RSS，生成 Astro content collection JSON 文件。
默认抓取过去 12 小时内的文章，早晚 8 点各运行一次不重复。
用法:
    python scripts/fetch_news.py          # 抓取今天
    python scripts/fetch_news.py 2025-04-20  # 指定日期（历史补录）
"""

import sys
import json
import re
import html
from datetime import datetime, timedelta
from pathlib import Path

import feedparser

# 尝试导入 requests，没有则跳过
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "src" / "data"
CONTENT_DIR = PROJECT_ROOT / "src" / "content" / "daily-news"

# 每个源最多抓取条目数（先多抓再过滤）
FETCH_MAX = 30
# 兜底篇数：如果 12 小时内无文章，取最新 N 篇
FALLBACK_COUNT = 2
# 时间窗口：过去 12 小时
TIME_WINDOW_HOURS = 12

# 请求头
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    )
}

# 早报关键词
MORNING_KEYWORDS = ["早报", "派早报", "Morning", "晨读", "今日早报"]

# 常见报道前缀正则
PREFIX_PATTERNS = [
    r"^IT之家\s*\d+\s*月\s*\d+\s*日消息，",
    r"^\d+\s*月\s*\d+\s*日消息，",
    r"^据[^，]+报道，",
    r"^[^，]+发布博文[称告]，",
    r"^[^，]+今日报道，",
    r"^[^，]+昨日报道，",
    r"^《[^》]+》[^，]+报道，",
]


def strip_html(text: str) -> str:
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def remove_prefix(text: str) -> str:
    for pattern in PREFIX_PATTERNS:
        text = re.sub(pattern, "", text)
    return text.strip()


def extract_first_sentence(text: str) -> str:
    if not text:
        return ""
    text = remove_prefix(text)
    m = re.search(r"^.+?[。！？.!?]", text)
    if m:
        sentence = m.group(0).strip()
        if len(sentence) >= 10:
            return sentence[:60] + ("…" if len(sentence) > 60 else "")
    return text[:60] + ("…" if len(text) > 60 else "")


def is_morning_post(title: str) -> bool:
    t = title.lower()
    return any(kw.lower() in t for kw in MORNING_KEYWORDS)


def sort_and_dedup_morning(items: list[dict]) -> list[dict]:
    morning = [i for i in items if is_morning_post(i["title"])]
    normal = [i for i in items if not is_morning_post(i["title"])]
    if len(morning) > 1:
        morning = [morning[0]]
    return morning + normal


def parse_entry_time(entry) -> "datetime | None":
    """从 entry 中提取发布时间"""
    parsed = None
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        parsed = entry.published_parsed
    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        parsed = entry.updated_parsed
    if parsed:
        return datetime(*parsed[:6])
    return None


def fetch_with_requests(rss_url: str) -> "str | None":
    if not HAS_REQUESTS:
        return None
    try:
        r = requests.get(rss_url, headers=HEADERS, timeout=20)
        if r.status_code == 200:
            return r.text
    except Exception:
        pass
    return None


def fetch_source(source: dict, topic_id: str, cutoff: datetime) -> list[dict]:
    """抓取单个 RSS 源，返回过去 12 小时内的新闻"""
    rss_url = source.get("rss", "")
    if not rss_url:
        return []

    print(f"  → 抓取 {source['name']} ({rss_url})")

    feed = None
    try:
        feed = feedparser.parse(rss_url, request_headers=HEADERS)
    except Exception as e:
        print(f"    ⚠ feedparser 失败: {e}")

    if not feed or not feed.entries:
        text = fetch_with_requests(rss_url)
        if text:
            feed = feedparser.parse(text)

    if not feed or (feed.get("bozo_exception") and not feed.entries):
        print(f"    ✗ 无法获取内容")
        return []

    # 先按时间排序（最新的在前）
    entries = list(feed.entries[:FETCH_MAX])
    entries_with_time = []
    for entry in entries:
        dt = parse_entry_time(entry)
        entries_with_time.append((entry, dt))

    # 过滤过去 12 小时的文章
    recent = []
    fallback = []
    for entry, dt in entries_with_time:
        if dt and dt >= cutoff:
            recent.append(entry)
        elif dt:
            fallback.append(entry)
        else:
            # 没有时间信息，当作兜底
            fallback.append(entry)

    # 如果 12 小时内无文章，取最新兜底篇数
    target_entries = recent if recent else fallback[:FALLBACK_COUNT]
    mode = "近期" if recent else "兜底"

    items = []
    for entry in target_entries:
        title = strip_html(entry.get("title", ""))
        raw_summary = ""
        for field in ("summary", "description", "content"):
            val = entry.get(field, "")
            if isinstance(val, list) and val:
                val = val[0].get("value", "")
            if val:
                raw_summary = strip_html(val)
                break
        summary = extract_first_sentence(raw_summary)

        link = ""
        if entry.get("link"):
            link = entry.link
        elif entry.get("id") and entry.id.startswith("http"):
            link = entry.id

        if not title or not link:
            continue

        items.append({
            "title": title,
            "summary": summary,
            "url": link,
            "source": source["id"],
            "topic": topic_id,
        })

    # 早报置顶 + 去重
    items = sort_and_dedup_morning(items)

    print(f"    ✓ {mode}获取 {len(items)} 条 (12h内{len(recent)}条)")
    return items


def fetch_topic(topic: dict, cutoff: datetime) -> list[dict]:
    topic_id = topic["id"]
    topic_name = topic["name"]
    sources = topic.get("sources", [])

    print(f"\n【{topic_name}】{len(sources)} 个信息源")
    all_items = []
    for src in sources:
        if not src.get("active", True):
            print(f"  → 跳过 {src['name']} (未启用)")
            continue
        items = fetch_source(src, topic_id, cutoff)
        all_items.extend(items)

    return all_items


def main():
    if len(sys.argv) >= 2:
        date_str = sys.argv[1]
        # 历史补录模式：不过滤时间，取固定篇数
        cutoff = datetime.min
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")
        cutoff = datetime.now() - timedelta(hours=TIME_WINDOW_HOURS)

    print(f"抓取日期: {date_str}")
    if cutoff != datetime.min:
        print(f"时间窗口: {cutoff.strftime('%Y-%m-%d %H:%M')} 至今 (过去{TIME_WINDOW_HOURS}小时)")

    topics_path = DATA_DIR / "daily-news-topics.json"
    with open(topics_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    topics = [t for t in config.get("topics", []) if t.get("active")]

    all_items = []
    for topic in topics:
        items = fetch_topic(topic, cutoff)
        all_items.extend(items)

    output = {
        "date": date_str,
        "update_time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "items": all_items,
    }

    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = CONTENT_DIR / f"{date_str}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 共 {len(all_items)} 条新闻，已写入 {out_path}")


if __name__ == "__main__":
    main()
