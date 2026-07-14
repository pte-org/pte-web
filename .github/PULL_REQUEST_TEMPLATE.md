## Summary

Mô tả ngắn PR này làm gì (1–2 câu).

## Type

- [ ] `feat:` — Tính năng mới
- [ ] `fix:` — Sửa bug
- [ ] `refactor:` — Cải thiện code (không thêm feature / không sửa bug)
- [ ] `chore:` — Config, dependency, CI
- [ ] `docs:` — Tài liệu

## Changes

- Liệt kê thay đổi chính
- Không cần liệt kê từng dòng (diff sẽ hiển thị)
- Highlight quyết định kiến trúc hoặc workaround quan trọng

## Closes / Related

Closes #<!-- issue number -->

## How to Test

Các bước để verify PR này hoạt động đúng.

---

## AI-Generated Code

- [ ] Một phần/toàn bộ code trong PR này được tạo bởi AI (Claude Code, Copilot, v.v.)
- [ ] Nếu có: đã review thủ công từng file, kiểm tra file size, hardcoded string, type violations

---

## Code Review Checklist — Universal

- [ ] Commit messages theo Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- [ ] Không debug code còn sót (`console.log`, `debugger`)
- [ ] PR size < 400 dòng diff (không tính `package-lock.json`, generated types)
- [ ] Không có string hardcode trong JSX (kiểm tra `features/{feature}/constants.ts`)
- [ ] Không có file nào > 300 dòng, component function > 150 dòng

## Code Review Checklist — aptis-web (Next.js / TypeScript)

- [ ] Không hardcode string trong JSX (`❌ <p>Exam not found</p>` → `✅ <p>{EXAM_MESSAGES.NOT_FOUND}</p>`)
- [ ] File < 300 dòng tổng, component function < 150 dòng (extract sub-component nếu hơn)
- [ ] Mọi API call qua TanStack Query trong `features/*/api.ts` (không `fetch()` trong component)
- [ ] Không inline style (`❌ style={{ color: 'blue' }}` → `✅ className="text-blue-600"`)
- [ ] Không dùng `any` type (dùng `unknown` với narrowing hoặc define interface)
- [ ] Props interface đã được define cho mọi component
- [ ] Component dùng ở 2+ feature đã được extract vào `@aptis/ui` (không copy-paste)
- [ ] Route động có `loading.tsx` và `error.tsx`
- [ ] Không disable ESLint rule mà không có comment giải thích lý do
- [ ] Không `// @ts-ignore` (fix type thay vì suppress)
- [ ] Secrets (API key, OAuth token) trong `.env.local` / env var — không trong `constants.ts`
- [ ] Dùng `next/image`, `next/link`, `next/font` (không raw `<img>`, `<a>`, CSS `@import` font)

## Sign-off

- [ ] Đã đọc [Coding Standards Web](../docs/CODING_STANDARDS_WEB.md) trước khi submit
- [ ] Đã test PR local (`pnpm dev`) và verify behavior đúng
- [ ] Không có breaking change (hoặc đã giải thích tại sao cần thiết)
