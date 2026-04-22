#!/bin/bash
# 从 daily-news-data 仓库同步数据到本地开发环境
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

# 确保目录存在
mkdir -p "$PROJECT_ROOT/src/content/daily-news"

# 同步数据
cp "$DATA_REPO/data/daily-news"/*.json "$PROJECT_ROOT/src/content/daily-news/"
cp "$DATA_REPO/data/topics.json" "$PROJECT_ROOT/src/data/daily-news-topics.json"

echo "✅ 数据同步完成"
echo "   新闻数据: src/content/daily-news/"
echo "   板块配置: src/data/daily-news-topics.json"
