#!/usr/bin/env python3
"""
抓取每日新闻 RSS，生成 Astro content collection JSON 文件。
用法:
    python scripts/fetch_news.py          # 抓取今天
    python scripts/fetch_news.py 2025-04-20  # 指定日期
"""

import sys
import json
import re
import html
from datetime import datetime
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

# 每个源抓取篇数（5-10 之间）
FETCH_COUNT = 8

# 请求头
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    )
}

# 早报关键词（标题匹配任一即认为是早报）
MORNING_KEYWORDS = ["早报", "派早报", "Morning", "晨读", "今日早报"]


def strip_html(text: str) -> str:
    """去除 HTML 标签，解码实体字符"""
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


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

def remove_prefix(text: str) -> str:
    """去掉开头的报道来源前缀"""
    for pattern in PREFIX_PATTERNS:
        text = re.sub(pattern, "", text)
    return text.strip()


def extract_first_sentence(text: str) -> str:
    """提取原文第一句话作为摘要，去掉前缀后控制在 60 字内"""
    if not text:
        return ""
    text = remove_prefix(text)
    # 找第一个句子结束标点
    m = re.search(r"^.+?[。！？.!?]", text)
    if m:
        sentence = m.group(0).strip()
        if len(sentence) >= 10:
            return sentence[:60] + ("…" if len(sentence) > 60 else "")
    # 兜底：截取前 60 字
    return text[:60] + ("…" if len(text) > 60 else "")


def is_morning_post(title: str) -> bool:
    """判断是否为早报文章"""
    t = title.lower()
    return any(kw.lower() in t for kw in MORNING_KEYWORDS)


def sort_and_dedup_morning(items: list[dict]) -> list[dict]:
    """早报文章置顶，每个源只保留最新的一篇早报"""
    morning = [i for i in items if is_morning_post(i["title"])]
    normal = [i for i in items if not is_morning_post(i["title"])]
    # 只保留第一篇早报（最新的），其余丢弃
    if len(morning) > 1:
        morning = [morning[0]]
    return morning + normal


def fetch_with_requests(rss_url: str) -> "str | None":
    """用 requests 获取 RSS 内容"""
    if not HAS_REQUESTS:
        return None
    try:
        r = requests.get(rss_url, headers=HEADERS, timeout=20)
        if r.status_code == 200:
            return r.text
    except Exception:
        pass
    return None


def fetch_source(source: dict, topic_id: str) -> list[dict]:
    """抓取单个 RSS 源，返回新闻条目列表"""
    rss_url = source.get("rss", "")
    if not rss_url:
        return []

    print(f"  → 抓取 {source['name']} ({rss_url})")

    # 先用 feedparser 直接解析 URL
    feed = None
    try:
        feed = feedparser.parse(rss_url, request_headers=HEADERS)
    except Exception as e:
        print(f"    ⚠ feedparser 失败: {e}")

    # 如果 URL 方式失败，尝试用 requests 获取内容再解析
    if not feed or not feed.entries:
        text = fetch_with_requests(rss_url)
        if text:
            feed = feedparser.parse(text)

    if not feed:
        print(f"    ✗ 无法获取内容")
        return []

    if feed.get("bozo_exception") and not feed.entries:
        print(f"    ✗ 解析错误: {feed.bozo_exception}")
        return []

    items = []
    for entry in feed.entries[:FETCH_COUNT]:
        title = strip_html(entry.get("title", ""))

        # 尝试多个字段获取原文摘要
        raw_summary = ""
        for field in ("summary", "description", "content"):
            val = entry.get(field, "")
            if isinstance(val, list) and val:
                val = val[0].get("value", "")
            if val:
                raw_summary = strip_html(val)
                break

        # 提取一句话摘要
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

    # 早报置顶 + 去重（每个源只保留一篇最新早报）
    items = sort_and_dedup_morning(items)

    print(f"    ✓ 获取 {len(items)} 条")
    return items


def fetch_topic(topic: dict) -> list[dict]:
    """抓取单个话题下的所有源"""
    topic_id = topic["id"]
    topic_name = topic["name"]
    sources = topic.get("sources", [])

    print(f"\n【{topic_name}】{len(sources)} 个信息源")
    all_items = []
    for src in sources:
        if not src.get("active", True):
            print(f"  → 跳过 {src['name']} (未启用)")
            continue
        items = fetch_source(src, topic_id)
        all_items.extend(items)

    return all_items


def main():
    # 日期
    if len(sys.argv) >= 2:
        date_str = sys.argv[1]
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")

    # 读取话题配置
    topics_path = DATA_DIR / "daily-news-topics.json"
    with open(topics_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    topics = [t for t in config.get("topics", []) if t.get("active")]

    all_items = []
    for topic in topics:
        items = fetch_topic(topic)
        all_items.extend(items)

    # 生成 JSON
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
