#!/usr/bin/env bash
# Prints the Pini bio-page funnel counts (read-only, does not increment).
# Usage: ./funnel_stats.sh        (real keys)
#        ./funnel_stats.sh test   (test_* keys from ?ctest=1 visits)
B=https://abacus.jasoncameron.dev/get/pinideals-tg
P=""; [ "$1" = "test" ] && P="test_"
for k in tt_view browser_view tg_click wa_click; do
  v=$(curl -s -m 10 "$B/$P$k" | sed -n 's/.*"value":\([0-9]*\).*/\1/p')
  printf '%-13s %s\n' "$P$k" "${v:-0}"
done
