#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ $# != 2 ]]; then
  echo "Usage: scripts/check-ftc.sh /path/to/android.jar /path/to/sdk-classes-directory" >&2
  exit 2
fi
temp_dir=$(mktemp -d)
trap 'rm -rf "$temp_dir"' EXIT
find ftc-examples/src -name '*.java' -print > "$temp_dir/sources"
javac --release 8 -classpath "$1:$2/*" -d "$temp_dir/classes" @"$temp_dir/sources"
