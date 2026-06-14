#!/usr/bin/env sh
set -eu

root_dir="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
dist_dir="$root_dir/dist"

build_target() {
  browser="$1"
  target="$dist_dir/$browser"

  rm -rf "$target"
  mkdir -p "$target/assets"

  cp "$root_dir/index.html" "$target/index.html"
  cp "$root_dir/styles.css" "$target/styles.css"
  cp "$root_dir/app.js" "$target/app.js"
  cp "$root_dir/favicon.svg" "$target/favicon.svg"
  cp "$root_dir/favicon.png" "$target/favicon.png"
  cp "$root_dir/site.webmanifest" "$target/site.webmanifest"
  cp "$root_dir"/assets/*.svg "$target/assets/"
  cp "$root_dir/extension/$browser/manifest.json" "$target/manifest.json"
}

build_target chrome
build_target firefox

printf 'Built extension folders:\n  %s/chrome\n  %s/firefox\n' "$dist_dir" "$dist_dir"
