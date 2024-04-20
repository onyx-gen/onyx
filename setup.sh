#!/bin/bash

# This function searches for .env.blueprint files (max depth of 3 directories
# down from the current directory) and copies its content to the corresponding
# .env file (the blueprint file's sibling).
function process_env_files() {
  echo "Processing all \`.env.blueprint\` files:"
  find . -name "*.env.blueprint" -maxdepth 3 | while IFS= read -r file; do
    target_file="$(dirname "$file")/.env"
    echo "Processing $file to $target_file"
    cp "$file" "$target_file"
  done
  return 1
}

process_env_files;
echo "Done!"
