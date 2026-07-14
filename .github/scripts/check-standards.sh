#!/bin/bash
# Coding Standards violation check — warning-only (exit 0)
# Surfaces common violations but does NOT block merge

WARN=0

echo "=== aptis-web Coding Standards Check ==="
echo ""

# Check hardcoded strings in JSX/TSX (outside constants files)
HARDCODED_STRINGS=$(grep -rn ">[A-Z][a-z ]\{4,\}<\|>[A-Z][a-z ]\{4,\}{" \
  --include="*.tsx" apps/ packages/ 2>/dev/null | \
  grep -v "constants\|locale\|\.test\.\|\.spec\." | head -20)

if [ -n "$HARDCODED_STRINGS" ]; then
  echo "[WARN] Possible hardcoded UI strings in JSX (should use constants or i18n):"
  echo "$HARDCODED_STRINGS"
  echo ""
  WARN=1
fi

# Check direct fetch() calls in component files
DIRECT_FETCH=$(grep -rn "fetch(" \
  --include="*.tsx" apps/ 2>/dev/null | \
  grep -v "//.*fetch\|node_modules\|\.test\." | head -15)

if [ -n "$DIRECT_FETCH" ]; then
  echo "[WARN] Direct fetch() in component files (should use TanStack Query via features/*/api.ts):"
  echo "$DIRECT_FETCH"
  echo ""
  WARN=1
fi

# Check inline styles
INLINE_STYLES=$(grep -rn "style={{" \
  --include="*.tsx" apps/ packages/ 2>/dev/null | \
  grep -v "//.*style\|\.test\." | head -15)

if [ -n "$INLINE_STYLES" ]; then
  echo "[WARN] Inline styles found (prefer Tailwind className):"
  echo "$INLINE_STYLES"
  echo ""
  WARN=1
fi

# Check any type usage
ANY_TYPE=$(grep -rn ": any\b\|<any>\|as any\b" \
  --include="*.ts" --include="*.tsx" apps/ packages/ 2>/dev/null | \
  grep -v "//.*any\|\.test\.\|node_modules\|eslint-disable" | head -15)

if [ -n "$ANY_TYPE" ]; then
  echo "[WARN] 'any' type usage found (use 'unknown' with narrowing or define an interface):"
  echo "$ANY_TYPE"
  echo ""
  WARN=1
fi

# Check files over 300 lines
LARGE_FILES=$(find apps/ packages/ \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | \
  grep -v "node_modules" | while read f; do
  lines=$(wc -l < "$f")
  if [ "$lines" -gt 300 ]; then
    echo "$lines $f"
  fi
done | sort -rn | head -10)

if [ -n "$LARGE_FILES" ]; then
  echo "[WARN] Files exceeding 300 lines:"
  echo "$LARGE_FILES"
  echo ""
  WARN=1
fi

# Check potential secrets in constants files
SECRETS=$(grep -rn -i "apiKey\s*=\s*['\"][A-Za-z0-9]\|secret\s*=\s*['\"][A-Za-z0-9]" \
  --include="*.ts" --include="*.tsx" apps/ packages/ 2>/dev/null | \
  grep -v "//.*=\|\.test\.\|process\.env" | head -10)

if [ -n "$SECRETS" ]; then
  echo "[WARN] Potential secrets hardcoded (should be in .env.local / process.env):"
  echo "$SECRETS"
  echo ""
  WARN=1
fi

if [ "$WARN" -eq 0 ]; then
  echo "[OK] No violations detected."
fi

echo ""
echo "=== Check complete (warning-only — merge not blocked) ==="
exit 0
