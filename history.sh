#!/bin/bash

function update_ip_ranges {
    FILE=$1
    FILE_MTIME=$(stat --printf '%y' $FILE)
    jq . $FILE > ./ip-ranges.json
    git add ./ip-ranges.json
    HUSKY=0 GIT_AUTHOR_DATE="$FILE_MTIME" GIT_COMMITTER_DATE="$FILE_MTIME" git commit -S -m "Updated ip-ranges.json on $FILE_MTIME"
}

while read FILE
    do update_ip_ranges $FILE
done < <(ls -tr ipranges-sync/*.json)
