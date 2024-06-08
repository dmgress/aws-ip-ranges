sudo corepack enable
# Unset any credential helpers to specific hosts because they might interfere
for c in $(git config --list | grep -Eo 'credential\.https://[^=]+'); do
    git config --global --unset-all $c || true
done
yarn install
