#!/bin/bash

function update_ip_ranges {
    FILE=$1
    FILE_MTIME=$(stat --printf '%y' $FILE)
    jq . $FILE > ./ip-ranges.json
    git add ./ip-ranges.json
    HUSKY=0 GIT_AUTHOR_DATE="$FILE_MTIME" GIT_COMMITTER_DATE="$FILE_MTIME" git commit -m "Updated ip-ranges.json on $FILE_MTIME"
}

trap "rm ./lastcommit.tmp" EXIT

touch --date "$(git log -n 1 --pretty='%aD' ./ip-ranges.json)" lastcommit.tmp

while read FILE
    do update_ip_ranges $FILE
done < <(find ./ipranges-sync -type f -name '*.json' -newer ./lastcommit.tmp   | xargs --no-run-if-empty ls -tr)
