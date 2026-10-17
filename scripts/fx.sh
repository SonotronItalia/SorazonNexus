#!/usr/bin/env bash
# Effetti da terminale per i Makefile del progetto.
#   EFFECTS=0  -> niente animazioni (come "riduci movimento" sul sito)
#   NO_COLOR=1 -> niente colori
set -u

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  PURPLE=$'\033[38;5;135m'; LILAC=$'\033[38;5;183m'
  GREEN=$'\033[32m'; RED=$'\033[31m'
  DIM=$'\033[2m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  PURPLE=''; LILAC=''; GREEN=''; RED=''; DIM=''; BOLD=''; RESET=''
fi

# Niente animazioni se richiesto o se l'output non è un terminale (ad esempio in CI)
ANIMATE=1
if [ "${EFFECTS:-1}" = "0" ] || [ ! -t 1 ]; then ANIMATE=0; fi

cursor_hide() { [ "$ANIMATE" = 1 ] && tput civis 2>/dev/null; return 0; }
cursor_show() { tput cnorm 2>/dev/null; return 0; }
trap cursor_show EXIT INT TERM

# Breve crepitio di scarica viola (meno di un secondo)
arc() {
  [ "$ANIMATE" = 1 ] || return 0
  local chars='~^*/|-=+' width=34 n i j line c col
  n=${#chars}
  cursor_hide
  for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
    line=''
    for ((j = 0; j < width; j++)); do
      c="${chars:$((RANDOM % n)):1}"
      if [ $((RANDOM % 3)) -eq 0 ]; then col="$LILAC"; else col="$PURPLE"; fi
      line="${line}${col}${c}"
    done
    printf '\r  %s%s' "$line" "$RESET"
    sleep 0.06
  done
  printf '\r\033[K'
  cursor_show
}

banner() {
  arc
  printf '  %s⚡ %sSORAZON%s %s· %s%s\n' "$PURPLE" "$BOLD" "$RESET" "$DIM" "${1:-sviluppo locale}" "$RESET"
  printf '  %s%s%s\n\n' "$DIM" "──────────────────────────────────" "$RESET"
}

# run "messaggio" comando args...  -> spinner mentre gira, ✔/✘ alla fine
run() {
  local msg="$1"; shift
  local log; log="$(mktemp "${TMPDIR:-/tmp}/sorazon.XXXXXX")"
  local start=$SECONDS rc=0 pid i=0
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

  if [ "$ANIMATE" = 1 ]; then
    "$@" >"$log" 2>&1 &
    pid=$!
    cursor_hide
    while kill -0 "$pid" 2>/dev/null; do
      printf '\r%s%s%s %s' "$PURPLE" "${frames[$((i % 10))]}" "$RESET" "$msg"
      i=$((i + 1))
      sleep 0.08
    done
    wait "$pid" || rc=$?
    cursor_show
    printf '\r\033[K'
  else
    printf '%s...\n' "$msg"
    "$@" >"$log" 2>&1 || rc=$?
  fi

  local secs=$((SECONDS - start))
  if [ "$rc" -eq 0 ]; then
    printf '%s✔%s %s %s(%ss)%s\n' "$GREEN" "$RESET" "$msg" "$DIM" "$secs" "$RESET"
    rm -f "$log"
  else
    printf '%s✘%s %s %s(%ss)%s\n' "$RED" "$RESET" "$msg" "$DIM" "$secs" "$RESET"
    printf '%s--- ultime righe dell'"'"'output ---%s\n' "$DIM" "$RESET"
    tail -n 25 "$log"
    rm -f "$log"
    return "$rc"
  fi
}

# confirm "domanda" parola  -> prosegue solo se scrivi esattamente la parola
confirm() {
  local prompt="$1" expected="$2" answer
  printf '%s%s%s ' "$RED" "$prompt" "$RESET"
  read -r answer
  if [ "$answer" = "$expected" ]; then return 0; fi
  printf '%sAnnullato.%s\n' "$DIM" "$RESET"
  return 1
}

cmd="${1:-}"
shift || true
case "$cmd" in
  banner)  banner "$@" ;;
  run)     run "$@" ;;
  confirm) confirm "$@" ;;
  *) echo "uso: fx.sh banner|run|confirm ..."; exit 2 ;;
esac