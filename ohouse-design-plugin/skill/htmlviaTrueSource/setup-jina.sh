#!/usr/bin/env bash
#
# 추출 API key 자동 셋업 (선택)
# ------------------------------
# 추출 API는 키 없이도 20 RPM으로 사용 가능합니다.
# 이 스크립트는 무료 키(500 RPM + 1천만 토큰)를 발급받아 OS에 안전하게 저장합니다.
#
# Usage:
#   bash setup-jina.sh
#

set -e

# ── Colors ──────────────────────────────
if [ -t 1 ]; then
  C_DIM='\033[2m'; C_GREEN='\033[32m'; C_YELLOW='\033[33m'; C_RED='\033[31m'; C_RESET='\033[0m'
else
  C_DIM=''; C_GREEN=''; C_YELLOW=''; C_RED=''; C_RESET=''
fi

# ── Header ──────────────────────────────
echo ""
echo "🔑  추출 API Key 셋업"
echo "─────────────────────────────────────────"
echo ""
echo "추출 API는 키 없이도 동작합니다 (20 RPM)."
echo "키 등록 시: 500 RPM + 1천만 토큰 무료 (signup 시 자동 발급)."
echo ""
read -r -p "키를 등록할까요? [y/N] " ans
if [[ ! "$ans" =~ ^[Yy]$ ]]; then
  echo ""
  echo "${C_DIM}건너뜁니다. 키 없이 정상 동작합니다.${C_RESET}"
  exit 0
fi

# ── Detect OS ────────────────────────────
OS="$(uname -s)"
STORAGE=""
case "$OS" in
  Darwin)
    STORAGE="keychain"
    ;;
  Linux)
    STORAGE="env"
    if [ -n "${WSL_DISTRO_NAME:-}" ]; then
      echo "${C_DIM}(WSL 감지){C_RESET}"
    fi
    ;;
  *)
    STORAGE="env"
    ;;
esac

# ── Check existing key ───────────────────
EXISTING=""
if [ "$STORAGE" = "keychain" ]; then
  EXISTING=$(security find-generic-password -s JINA_API_KEY -a "$USER" -w 2>/dev/null || echo "")
elif [ -n "${JINA_API_KEY:-}" ]; then
  EXISTING="$JINA_API_KEY"
fi

if [ -n "$EXISTING" ]; then
  echo ""
  echo "${C_YELLOW}⚠  이미 키가 저장돼 있습니다: ${EXISTING:0:8}…${C_RESET}"
  read -r -p "덮어쓸까요? [y/N] " ow
  if [[ ! "$ow" =~ ^[Yy]$ ]]; then
    echo "${C_DIM}변경 없이 종료.${C_RESET}"
    exit 0
  fi
fi

# ── Open dashboard ────────────────────────
echo ""
echo "📋  다음 단계:"
echo "  1. 브라우저에서 https://jina.ai/api-dashboard/ 자동으로 열립니다"
echo "  2. Google/GitHub 로그인 → 새 키 자동 생성됨"
echo "  3. 키 복사 (\"jina_...\" 형식)"
echo "  4. 이 터미널에 붙여넣기"
echo ""

URL="https://jina.ai/api-dashboard/"
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1
elif command -v wslview >/dev/null 2>&1; then
  wslview "$URL"
else
  echo "${C_DIM}수동으로 열어주세요: $URL${C_RESET}"
fi

# ── Prompt key ───────────────────────────
echo ""
read -r -s -p "🔐 키 붙여넣기 (입력 숨김): " NEW_KEY
echo ""

if [ -z "$NEW_KEY" ]; then
  echo "${C_RED}❌ 빈 키. 취소.${C_RESET}"
  exit 1
fi

# basic format check
if [[ ! "$NEW_KEY" =~ ^jina_ ]]; then
  echo ""
  echo "${C_YELLOW}⚠  키가 'jina_'로 시작하지 않습니다.${C_RESET}"
  read -r -p "그래도 계속할까요? [y/N] " cont
  if [[ ! "$cont" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# ── Save ──────────────────────────────────
echo ""
echo "💾  저장 중..."

case "$STORAGE" in
  keychain)
    security add-generic-password -a "$USER" -s JINA_API_KEY -w "$NEW_KEY" -U
    echo "${C_GREEN}✅ macOS Keychain에 저장됨${C_RESET} (service=JINA_API_KEY, account=$USER)"

    # .zshrc / .bashrc auto-load
    SHELL_RC=""
    [ -f ~/.zshrc ] && SHELL_RC=~/.zshrc
    [ -z "$SHELL_RC" ] && [ -f ~/.bashrc ] && SHELL_RC=~/.bashrc
    if [ -n "$SHELL_RC" ] && ! grep -q "JINA_API_KEY" "$SHELL_RC"; then
      read -r -p "📝 $SHELL_RC에 자동 로드 라인 추가할까요? [Y/n] " add_rc
      if [[ ! "$add_rc" =~ ^[Nn]$ ]]; then
        echo "" >> "$SHELL_RC"
        echo "# Auto-loaded by htmlviaTrueSource setup-jina.sh" >> "$SHELL_RC"
        echo 'export JINA_API_KEY="$(security find-generic-password -s JINA_API_KEY -a "$USER" -w 2>/dev/null)"' >> "$SHELL_RC"
        echo "${C_GREEN}✅ $SHELL_RC 업데이트됨${C_RESET}"
      fi
    fi
    ;;
  env)
    # Linux/WSL/기타: ~/.env.jina + shell rc source
    echo "JINA_API_KEY=$NEW_KEY" > ~/.env.jina
    chmod 600 ~/.env.jina
    echo "${C_GREEN}✅ ~/.env.jina에 저장됨${C_RESET} (chmod 600)"

    SHELL_RC=""
    [ -f ~/.zshrc ] && SHELL_RC=~/.zshrc
    [ -z "$SHELL_RC" ] && [ -f ~/.bashrc ] && SHELL_RC=~/.bashrc
    if [ -n "$SHELL_RC" ] && ! grep -q ".env.jina" "$SHELL_RC"; then
      read -r -p "📝 $SHELL_RC에 자동 로드 라인 추가할까요? [Y/n] " add_rc
      if [[ ! "$add_rc" =~ ^[Nn]$ ]]; then
        echo "" >> "$SHELL_RC"
        echo "# Auto-loaded by htmlviaTrueSource setup-jina.sh" >> "$SHELL_RC"
        echo '[ -f ~/.env.jina ] && export $(grep -v "^#" ~/.env.jina | xargs)' >> "$SHELL_RC"
        echo "${C_GREEN}✅ $SHELL_RC 업데이트됨${C_RESET}"
      fi
    fi
    ;;
esac

# ── Smoke test ────────────────────────────
echo ""
echo "🧪  키 동작 확인..."
HTTP_CODE=$(curl -sS -o /tmp/jina_test_$$ -w "%{http_code}" \
  "https://r.jina.ai/https://example.com" \
  -H "Authorization: Bearer $NEW_KEY" || echo "000")
rm -f /tmp/jina_test_$$

if [ "$HTTP_CODE" = "200" ]; then
  echo "${C_GREEN}✅ HTTP 200 — 정상 동작${C_RESET}"
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  echo "${C_RED}❌ HTTP $HTTP_CODE — 키 인증 실패. 키 재확인 후 다시 실행${C_RESET}"
  exit 1
else
  echo "${C_YELLOW}⚠ HTTP $HTTP_CODE — 키는 저장됐으나 응답이 200이 아님. 네트워크 또는 외부 서비스 상태 확인 필요${C_RESET}"
fi

# ── Done ──────────────────────────────────
echo ""
echo "${C_GREEN}🎉  완료${C_RESET}"
echo ""
echo "현재 셸에서 즉시 사용하려면:"
case "$STORAGE" in
  keychain)
    echo "  ${C_DIM}export JINA_API_KEY=\"\$(security find-generic-password -s JINA_API_KEY -a \"\$USER\" -w)\"${C_RESET}"
    ;;
  env)
    echo "  ${C_DIM}export \$(grep -v '^#' ~/.env.jina | xargs)${C_RESET}"
    ;;
esac
echo "  ${C_DIM}# 또는 새 셸 시작${C_RESET}"
echo ""
