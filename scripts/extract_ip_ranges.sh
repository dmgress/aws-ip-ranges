#!/bin/bash

# Ensure you're in the correct git repo
cd $(dirname $0)/.. || exit 1

FULL_IP_RANGES_JSON="output/ip-ranges.full.json"

# Create output directory if it doesn't exist
mkdir -p output
rm -rf $FULL_IP_RANGES_JSON
touch $FULL_IP_RANGES_JSON

git log --follow --format="%H" -- ip-ranges.json | while read commit; do
    # Get commit date as Unix timestamp
    timestamp=$(git show -s --format=%ct "$commit")
    # Checkout the file at this commit
    # git show "$commit":ip-ranges.json | tee "output/ip-ranges.$timestamp.json" | jq -c >> $FULL_IP_RANGES_JSON
    git show "$commit":ip-ranges.json | jq -c >> $FULL_IP_RANGES_JSON
done
