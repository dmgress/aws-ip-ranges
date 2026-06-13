#!/bin/bash

# Ensure you're in the correct git repo
cd $(dirname $0)/.. || exit 1

# Create output directory if it doesn't exist
mkdir -p output

# Get list of commits affecting ip-ranges.json, sorted oldest to newest
git log --follow --format="%H" -- ip-ranges.json | while read commit; do
    # Get commit date as Unix timestamp
    timestamp=$(git show -s --format=%ct "$commit")
    # Checkout the file at this commit
    git show "$commit":ip-ranges.json > "output/ip-ranges.$timestamp.json"
done
