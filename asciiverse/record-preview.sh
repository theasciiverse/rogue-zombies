#!/bin/sh
# Records the catalog preview, asciiverse/rogue-zombies.cast, at 100x30
# with hub's castrec.py: the welcome, the Regular game of --seed 7, the
# item shop, the start of the invasion, rakes laid down and the first
# zombies coming. Run from the repo root after building.
set -eu
CASTREC=${CASTREC:-../hub/tools/castrec.py}
state=$(mktemp -d)
trap 'rm -rf "$state"' EXIT
S="w3;kspace;w2.5;k2;w2;ki;w2.5;k2;w1.5;kesc;w1;ks;w2;kspace;w1"
MOVES="l l l l k k k 2 l j j j h h 2 h . . . . l l l . . . . j j . . . . . . . . . . . ."
for k in $MOVES; do S="$S;k$k;w0.45"; done
S="$S;w2"
XDG_STATE_HOME="$state" python3 "$CASTREC" "${1:-asciiverse/rogue-zombies.cast}" . "$S" -- ./out/rogue-zombies --seed 7
