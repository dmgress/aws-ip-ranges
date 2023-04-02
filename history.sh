#!/bin/bash

LAST_COMMITTED=$1

function update_ip_ranges {
    FILE=$1
    if [ -n "$FILE" ]; then
        FILE_MTIME=$(stat --printf '%y' $FILE)
        jq . $FILE > ./ip-ranges.json
        git add ./ip-ranges.json
        HUSKY=0 GIT_AUTHOR_DATE="$FILE_MTIME" GIT_COMMITTER_DATE="$FILE_MTIME" git commit -m "Updated ip-ranges.json on $FILE_MTIME"
    fi
}

trap "rm ./lastcommit.tmp" EXIT

if [ -z "$LAST_COMMITTED" ]; then
    touch --date "$LAST_COMMITTED" lastcommit.tmp
else
    touch --date "$(git log -n 1 --pretty='%aD' ./ip-ranges.json)" lastcommit.tmp
fi
echo last commit on ip-rangs.json at 
stat lastcommit.tmp

(find ./ipranges-sync -type f -name '*.json' -newer ./lastcommit.tmp   | xargs --no-run-if-empty ls -tr) > FOUND_FILES

echo '---DEBUG---' >> DEBUG_FOUND
cat FOUND_FILES >> DEBUG_FOUND
echo '---DEBUG---' >> DEBUG_FOUND

while read -r FILE; do
    echo processing ${FILE} as update
    update_ip_ranges $FILE
done < FOUND_FILES
