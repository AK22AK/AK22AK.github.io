#!/bin/bash
# 从 daily-news-data 仓库拉取并同步数据到本地开发环境
# 用法:
#   ./scripts/sync-data.sh                         # 默认从 ../daily-news-data 同步
#   ./scripts/sync-data.sh /path/to/repo           # 指定数据仓库路径
#   ./scripts/sync-data.sh /path/to/repo --optional # 数据仓库不存在时跳过

set -e

DATA_REPO="${1:-../daily-news-data}"
OPTIONAL=false
if [ "$1" = "--optional" ]; then
    DATA_REPO="../daily-news-data"
    OPTIONAL=true
elif [ "$2" = "--optional" ]; then
    OPTIONAL=true
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ ! -d "$DATA_REPO" ]; then
    if [ "$OPTIONAL" = true ]; then
        echo "⚠️ 数据仓库不存在，跳过同步: $DATA_REPO"
        exit 0
    fi
    echo "❌ 数据仓库不存在: $DATA_REPO"
    echo "   请确保已 clone AK22AK/daily-news-data 到本地，或指定正确路径。"
    exit 1
fi

if [ -d "$DATA_REPO/.git" ]; then
    echo "🔄 更新数据仓库: $DATA_REPO"
    if [ -n "$(git -C "$DATA_REPO" status --porcelain)" ]; then
        echo "❌ 数据仓库存在本地未提交修改，已停止同步: $DATA_REPO"
        echo "   请先提交、暂存或清理 daily-news-data 的本地改动，再重新运行。"
        exit 1
    fi

    CURRENT_BRANCH="$(git -C "$DATA_REPO" branch --show-current)"
    if [ -z "$CURRENT_BRANCH" ]; then
        echo "❌ 数据仓库当前不在分支上，已停止同步: $DATA_REPO"
        exit 1
    fi

    git -C "$DATA_REPO" fetch origin "$CURRENT_BRANCH"
    git -C "$DATA_REPO" pull --ff-only origin "$CURRENT_BRANCH"
else
    echo "⚠️ 数据目录不是 Git 仓库，仅执行本地文件同步: $DATA_REPO"
fi

# 确保目录存在
mkdir -p "$PROJECT_ROOT/src/content/daily-news"

# 同步数据
cp "$DATA_REPO/data/daily-news"/*.json "$PROJECT_ROOT/src/content/daily-news/"
cp "$DATA_REPO/data/topics.json" "$PROJECT_ROOT/src/data/daily-news-topics.json"
if [ -f "$DATA_REPO/data/sources_index.json" ]; then
    cp "$DATA_REPO/data/sources_index.json" "$PROJECT_ROOT/src/data/daily-news-sources-index.json"
fi

echo "✅ 数据同步完成"
echo "   新闻数据: src/content/daily-news/"
echo "   板块配置: src/data/daily-news-topics.json"
if [ -f "$PROJECT_ROOT/src/data/daily-news-sources-index.json" ]; then
    echo "   来源索引: src/data/daily-news-sources-index.json"
fi
