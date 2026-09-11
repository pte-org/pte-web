# Tiêu chuẩn Coding — PTE Web (Next.js 16 / TypeScript)

**Cập nhật:** 2026-06-24  
**Đối tượng:** Toàn bộ dev team, Frontend specialists, AI coding assistants  
**Tech Stack:** Next.js 16 (App Router), TypeScript strict mode, Tailwind CSS v4, TanStack Query v5, pnpm, Turborepo monorepo

---

## Mục lục

1. [Nguyên tắc cơ bản](#nguyên-tắc-cơ-bản)
2. [Quy tắc đặt tên](#quy-tắc-đặt-tên)
3. [Cấu trúc tệp & Tổ chức](#cấu-trúc-tệp--tổ-chức)
4. [Nguyên tắc SOLID cho React/Next.js](#nguyên-tắc-solid-cho-reactnextjs)
5. [Quy tắc Component](#quy-tắc-component)
6. [TypeScript Strict Mode](#typescript-strict-mode)
7. [Mẫu Fetching Dữ liệu](#mẫu-fetching-dữ-liệu)
8. [Quản lý Constants & String](#quản-lý-constants--string)
9. [Cấu trúc Route & Loading/Error](#cấu-trúc-route--loadingerror)
10. [Tailwind CSS & Styling](#tailwind-css--styling)
11. [Quản lý Secrets](#quản-lý-secrets)
12. [Lỗi thường gặp](#lỗi-thường-gặp)
13. [Checklist Code Review](#checklist-code-review)

---

## Nguyên tắc cơ bản

PTE web tuân thủ các nguyên tắc vượt ra ngoài SOLID:

| Nguyên tắc | Định nghĩa | Áp dụng |
|---|---|---|
| **DRY** (Don't Repeat Yourself) | Khi code xuất hiện ở 3 nơi, bắt buộc extract thành function/hook/component | Không có duplicate logic qua 2+ features |
| **KISS** (Keep It Simple, Stupid) | Chọn giải pháp đơn giản hơn ngay cả khi cái phức tạp nghe "cool" hơn | Ưu tiên clarity > cleverness |
| **YAGNI** (You Aren't Gonna Need It) | Không code feature/param/abstraction "để phòng tương lai" | Đợi yêu cầu cụ thể rồi refactor |
| **Fail Fast** | Validate đầu vào ngay tại boundary (component input, API call) | Lỗi được catch sớm, dễ fix |
| **Law of Demeter** | Không chain quá 2 cấp: `a.getB().do()` OK; `a.getB().getC().getD()` là code smell | Tạo method trung gian |
| **CQS** (Command-Query Separation) | Method hoặc trả về value OR thay đổi state, không làm cả hai | `getExam()` trả value; `submitExam()` return void |

### Clean Code Rules cho Web

- **Tên tự giải thích**: Không viết tắt (`usr`, `cnt`, `tmp`). Tên phải đọc hiểu ngay.
  - ✗ `const cnt = 0;` → ✓ `const attemptCount = 0;`
  - ✗ `function proc()` → ✓ `function processSubmittedAnswer()`

- **Comment giải thích WHY, không giải thích WHAT**: Code đã nói WHAT. Comment xuất hiện khi có constraint ẩn, workaround.
  - ✗ `// lấy danh sách exam` (code đã nói rồi)
  - ✓ `// TanStack Query caches aggressive, phải invalidateQueries thủ công khi update from other source`

- **Boy Scout Rule**: Mỗi khi chỉnh sửa file, để lại sạch hơn lúc ban đầu (rename biến, xóa dead code).

- **No Broken Windows**: Thấy bug nhỏ khi code feature → tạo issue hoặc fix luôn nếu < 15 phút.

---

## Quy tắc đặt tên

### Components — PascalCase

Tên file và export function đều PascalCase.

| ✓ Đúng | ✗ Sai |
|--------|-------|
| `ExamCard.tsx` | `exam-card.tsx` |
| `SubmitAnswerButton.tsx` | `submitAnswerButton.tsx` |
| `StudentExamList.tsx` | `student_exam_list.tsx` |
| `ExamDetailPanel.tsx` | `examDetailPanel.tsx` |
| `ResultSummary.tsx` | `result-summary.tsx` |

**Ví dụ:**
```typescript
// ✓ ĐÚNG
export function ExamCard({ exam }: { exam: Exam }) {
  return <div>{exam.title}</div>;
}
export default ExamCard;

// ✗ SAI
export function examCard({ exam }: { exam: Exam }) {
  return <div>{exam.title}</div>;
}
```

### Hooks — `use` Prefix

Tên bắt đầu `use` + PascalCase, file = camelCase `use*.ts`.

| ✓ Đúng | ✗ Sai |
|--------|-------|
| `useExamList.ts` | `getExamList.ts` |
| `useSubmitAnswer.ts` | `handleSubmitAnswer.ts` |
| `useAuthContext.ts` | `authHook.ts` |
| `useExamTimer.ts` | `examTimer.ts` |
| `useFormValidation.ts` | `validateForm.ts` |

**Ví dụ:**
```typescript
// ✓ ĐÚNG
// features/exam/hooks/useExamList.ts
export function useExamList() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: fetchExams,
  });
}

// ✗ SAI
export function getExamList() { // Tên không có prefix "use"
  return useQuery(/* ... */);
}
```

### Utilities & Helpers — camelCase

Tên file và export function đều camelCase, không `use` prefix.

| ✓ Đúng | ✗ Sai |
|--------|-------|
| `formatDate.ts` | `FormatDate.ts` |
| `parseScore.ts` | `parse-score.ts` |
| `validateEmail.ts` | `ValidateEmail.ts` |
| `calculateTotalScore.ts` | `calculate_total_score.ts` |
| `extractErrorMessage.ts` | `extract-error-message.ts` |

**Ví dụ:**
```typescript
// ✓ ĐÚNG
// lib/formatDate.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

// ✗ SAI
export function FormatDate(date: Date): string { // PascalCase không phù hợp utility
  return new Intl.DateTimeFormat('vi-VN').format(date);
}
```

### Constants — UPPER_SNAKE_CASE

Tất cả constants vào `constants.ts`, tên `UPPER_SNAKE_CASE`.

| ✓ Đúng | ✗ Sai |
|--------|-------|
| `EXAM_STATUS_LABELS` | `examStatusLabels` |
| `ERROR_MESSAGES` | `errorMessages` |
| `API_TIMEOUT_MS` | `apiTimeoutMs` |
| `PASSING_SCORE_PERCENT` | `passingScorePercent` |
| `MAX_RETRIES` | `maxRetries` |

**Ví dụ:**
```typescript
// ✓ ĐÚNG
// features/exam/constants.ts
export const EXAM_STATUS_LABELS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
} as const;

export const API_TIMEOUT_MS = 30000;

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Exam không tìm thấy',
  ALREADY_ENROLLED: 'Bạn đã enrolled',
} as const;

// ✗ SAI
export const examStatusLabels = { // camelCase không phù hợp
  draft: 'Draft',
  published: 'Published',
};
```

### Types & Interfaces — PascalCase

Tên file `types.ts`, tên type/interface `PascalCase`.

| ✓ Đúng | ✗ Sai |
|--------|-------|
| `ExamAttempt` | `examAttempt` |
| `SubmitAnswerPayload` | `submitAnswerPayload` |
| `StudentProfile` | `student_profile` |
| `ExamListResponse` | `exam_list_response` |
| `PaginatedResult<T>` | `paginatedResult` |

**Ví dụ:**
```typescript
// ✓ ĐÚNG
// features/exam/types.ts
export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  status: ExamStatus;
  startedAt: Date;
  submittedAt?: Date;
}

export type ExamStatus = 'draft' | 'in-progress' | 'submitted' | 'graded';

// ✗ SAI
export interface exam_attempt { // snake_case không phù hợp type
  id: string;
}
```

### Routes — kebab-case

Next.js App Router folders đều kebab-case.

| ✓ Đúng | ✗ Sai |
|--------|-------|
| `exam-delivery/` | `examDelivery/` |
| `(auth)/` | `(authentication)/` |
| `student-dashboard/` | `studentDashboard/` |
| `admin-panel/` | `adminPanel/` |
| `[exam-id]/` | `[examId]/` |

**Ví dụ:**
```
app/
  (auth)/
    login/
      page.tsx
    signup/
      page.tsx
  exam-delivery/
    [exam-id]/
      page.tsx
      loading.tsx
      error.tsx
  student-dashboard/
    page.tsx
```

---

## Cấu trúc tệp & Tổ chức

### Per-Feature Layout

Mỗi feature theo cấu trúc:

```
features/{feature-name}/
  api.ts                  ← TanStack Query hooks
  types.ts               ← TypeScript interfaces
  constants.ts           ← String labels, config
  components/
    index.ts             ← Barrel re-export
    {Component}.tsx
    _{SubComponent}.tsx  ← Prefix _ cho private component
  hooks/
    use{Hook}.ts
```

**Ví dụ thực tế:**

```
features/exam/
  api.ts                 # useGetExam, useSubmitExam, etc.
  types.ts              # Exam, ExamAttempt, SubmitRequest
  constants.ts          # EXAM_STATUS_LABELS, ERROR_MESSAGES
  components/
    index.ts
    ExamCard.tsx        # Main export
    ExamHeader.tsx      # Shared sub-component
    _ExamFooter.tsx     # Private (only used in ExamCard)
  hooks/
    useExamTimer.ts
    useExamValidation.ts
```

### Shared Packages

Turborepo monorepo có 3 shared packages:

#### `@pte/ui` — Generic UI Components
- **Khi sử dụng**: Component dùng ở 2+ features/apps
- **Nội dung**: Button, Modal, Card, Input, Badge, Skeleton, Dialog
- **KHÔNG**: Feature-specific logic (exam logic không vào @pte/ui)

```typescript
// ✓ Extract vào @pte/ui khi component dùng ở 2+ features
packages/ui/src/components/Button.tsx
packages/ui/src/components/Modal.tsx
packages/ui/src/components/Card.tsx

// ✗ KHÔNG extract exam-specific component vào @pte/ui
// ExamDeliveryPanel.tsx ở features/exam, không move vào @pte/ui
```

#### `@pte/api-client` — API Types & Fetch Helpers
- **Khi sử dụng**: API types, request definitions, error handling
- **Nội dung**: Generated types từ OpenAPI, fetch wrappers, API config
- **KHÔNG**: Feature-specific hooks (useExamList ở features/exam, không @pte/api-client)

```typescript
// ✓ @pte/api-client
packages/api-client/src/types/exam.ts (API response types)
packages/api-client/src/client.ts (fetch wrapper)

// ✗ KHÔNG
packages/api-client/src/hooks/useExamList.ts // feature-specific
```

#### `@pte/config` — ESLint & TypeScript Configuration
- **Khi sử dụng**: Base configuration base, không override `strict: false`
- **Nội dung**: eslint.config.mjs, tsconfig.json base, prettier config

```typescript
// ✓ ĐÚNG
packages/config/eslint.config.mjs
packages/config/tsconfig.json

// ✗ SAI
// Trong tsconfig.app.json, KHÔNG override:
{
  "extends": "@pte/config/tsconfig",
  "compilerOptions": {
    "strict": false // ✗ KHÔNG được override
  }
}
```

### Khi nào Extract sang Shared?

**Flow quyết định:**

```
Is component used in 2+ features?
├─ YES → Move to @pte/ui (tạo index.ts export)
└─ NO → Keep in features/{feature}

Is it feature-specific logic (exam, student, etc.)?
├─ YES → Keep in features/{feature}
└─ NO → Consider @pte/ui

Is it API client code or types?
├─ YES → Move to @pte/api-client
└─ NO → Keep in features
```

---

## Nguyên tắc SOLID cho React/Next.js

### S — Single Responsibility

Một component = một trách nhiệm (hiển thị, logic, hoặc load data).

**✗ Sai — ExamPage làm tất cả:**
```typescript
export default function ExamPage({ examId }: { examId: string }) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/exams/${examId}`)
      .then(r => r.json())
      .then(data => { setExam(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [examId]);

  if (loading) return <Skeleton />;
  if (error) return <ErrorBanner message={error} />;
  
  return (
    <div className="p-4">
      <h1>{exam?.title}</h1>
      <p>{exam?.description}</p>
      <button onClick={() => submitExam(exam!.id)}>Submit</button>
    </div>
  );
}
```

**✓ Đúng — Tách thành 3 component:**
```typescript
// features/exam/components/index.ts
export { ExamPage } from './ExamPage';
export { ExamDetail } from './ExamDetail';
export { ExamLoading } from './ExamLoading';
export { ExamError } from './ExamError';

// features/exam/components/ExamPage.tsx (Server Component, handle fetch)
export default async function ExamPage({ params }: { params: { examId: string } }) {
  const exam = await fetchExam(params.examId);
  return (
    <Suspense fallback={<ExamLoading />}>
      <ExamDetail exam={exam} />
    </Suspense>
  );
}

// features/exam/components/ExamDetail.tsx (Client Component, interactive)
'use client';
export function ExamDetail({ exam }: { exam: Exam }) {
  return (
    <div className="p-4">
      <h1>{exam.title}</h1>
      <p>{exam.description}</p>
      <SubmitButton examId={exam.id} />
    </div>
  );
}

// features/exam/components/ExamLoading.tsx
export function ExamLoading() {
  return <Skeleton className="h-64" />;
}

// features/exam/components/ExamError.tsx
'use client';
export function ExamError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4 text-red-600">
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

### O — Open/Closed

Composition over inheritance. Dùng render props, children, hooks — không class inheritance.

**✗ Sai — Class inheritance:**
```typescript
class Button extends HTMLButtonElement {
  color: 'primary' | 'secondary' = 'primary';
}

class PrimaryButton extends Button {
  color = 'primary';
}

class DangerButton extends Button {
  color = 'red';
}
```

**✓ Đúng — Function composition với variant:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant];

  const sizeClass = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }[size];

  return (
    <button className={`${variantClass} ${sizeClass} ${className}`} {...props} />
  );
}
```

### L — Liskov Substitution

Sub-component maintain parent contract. Không hidden requirements.

**✗ Sai — CustomButton break onClick contract:**
```typescript
interface CustomButtonProps {
  onClick?: () => void; // Yêu cầu async callback, khác Button
  onAsyncClick?: (data: Promise<void>) => void; // Hidden requirement
}

export function CustomButton({ onAsyncClick }: CustomButtonProps) {
  return (
    <button onClick={async () => {
      const result = await someAsyncOp();
      onAsyncClick?.(result);
    }} />
  );
}

// User kỳ vọng onClick synchronous như Button, nhưng CustomButton yêu cầu onAsyncClick
```

**✓ Đúng — CustomButton maintain contract:**
```typescript
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function CustomButton({ children, ...props }: CustomButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    try {
      props.onClick?.(e); // Call original onClick
    } finally {
      setLoading(false);
    }
  };

  return (
    <button {...props} onClick={handleClick} disabled={loading}>
      {children}
    </button>
  );
}
```

### I — Interface Segregation

Props interface chỉ include cần thiết, không bloated.

**✗ Sai — 50+ props:**
```typescript
interface InputProps {
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onFocus?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onSubmit?: () => void;
  value?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  aria-label?: string;
  aria-describedby?: string;
  // ... 30+ props khác
}
```

**✓ Đúng — Focused props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label>{label}</label>}
      <input
        className={`border ${error ? 'border-red-600' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### D — Dependency Inversion

Pass data via props, không hardcoded fetch.

**✗ Sai — Component hardcode fetch:**
```typescript
export function ExamDetail({ examId }: { examId: string }) {
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    // Hardcoded dependency
    fetch(`/api/exams/${examId}`)
      .then(r => r.json())
      .then(setExam);
  }, [examId]);

  return <div>{exam?.title}</div>;
}
```

**✓ Đúng — Props injection:**
```typescript
interface ExamDetailProps {
  exam: Exam; // Inject data via props
  onSubmit?: (examId: string) => void;
}

export function ExamDetail({ exam, onSubmit }: ExamDetailProps) {
  return (
    <div>
      <h1>{exam.title}</h1>
      <button onClick={() => onSubmit?.(exam.id)}>Submit</button>
    </div>
  );
}

// Parent handle fetch, pass exam
export default async function ExamPage({ params }) {
  const exam = await fetchExam(params.examId);
  return <ExamDetail exam={exam} />;
}
```

---

## Quy tắc Component

### Default: React Server Component

Mặc định tất cả component là Server Component (không `'use client'`).

Chỉ thêm `'use client'` khi component cần:
- `useState`, `useEffect`, `useCallback`
- `useContext` (client-specific context)
- Browser API (`localStorage`, `window`, `document`)
- Event listener (`onClick`, `onChange`, v.v.)

**✗ Sai — Thêm 'use client' không cần thiết:**
```typescript
'use client'; // ✗ Không cần, component không dùng state/effect/browser API

export function ExamList({ exams }: { exams: Exam[] }) {
  return (
    <ul>
      {exams.map(exam => (
        <li key={exam.id}>{exam.title}</li>
      ))}
    </ul>
  );
}
```

**✓ Đúng — Server Component, không 'use client':**
```typescript
// ✓ No 'use client' needed
export function ExamList({ exams }: { exams: Exam[] }) {
  return (
    <ul>
      {exams.map(exam => (
        <li key={exam.id}>{exam.title}</li>
      ))}
    </ul>
  );
}

// ✓ 'use client' ONLY when needed
'use client';

export function ExamFilter({
  onFilterChange,
}: {
  onFilterChange: (status: string) => void;
}) {
  const [status, setStatus] = useState('');

  return (
    <select
      value={status}
      onChange={(e) => {
        setStatus(e.target.value);
        onFilterChange(e.target.value);
      }}
    >
      <option value="">All</option>
      <option value="draft">Draft</option>
      <option value="published">Published</option>
    </select>
  );
}
```

### Max 150 dòng per Component

Component function vượt 150 dòng → extract sub-component.

**✗ Sai — ExamCard 180 dòng:**
```typescript
export function ExamCard({ exam }: { exam: Exam }) {
  // Header: 40 dòng
  const headerContent = (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <h3 className="font-bold">{exam.title}</h3>
        <p className="text-sm text-gray-600">{exam.description}</p>
      </div>
      <Badge status={exam.status} />
    </div>
  );

  // Body: 60 dòng
  const bodyContent = (
    <div className="space-y-4">
      <div>
        <span className="text-sm text-gray-600">Duration:</span>
        <p className="font-semibold">{exam.durationMinutes} minutes</p>
      </div>
      <div>
        <span className="text-sm text-gray-600">Questions:</span>
        <p className="font-semibold">{exam.questionCount}</p>
      </div>
      <div>
        <span className="text-sm text-gray-600">Passing Score:</span>
        <p className="font-semibold">{exam.passingScore}%</p>
      </div>
      {/* ... more fields ... */}
    </div>
  );

  // Footer: 40 dòng
  const footerContent = (
    <div className="flex gap-2 border-t pt-4">
      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded">
        Start Exam
      </button>
      <button className="flex-1 bg-gray-200 text-black px-4 py-2 rounded">
        Preview
      </button>
    </div>
  );

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      {headerContent}
      {bodyContent}
      {footerContent}
    </div>
  );
} // 180+ dòng total
```

**✓ Đúng — Tách thành components nhỏ:**
```typescript
// components/ExamCard.tsx (60 dòng)
export function ExamCard({ exam }: { exam: Exam }) {
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <ExamCardHeader exam={exam} />
      <ExamCardBody exam={exam} />
      <ExamCardFooter exam={exam} />
    </div>
  );
}

// components/_ExamCardHeader.tsx (40 dòng)
function ExamCardHeader({ exam }: { exam: Exam }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <h3 className="font-bold">{exam.title}</h3>
        <p className="text-sm text-gray-600">{exam.description}</p>
      </div>
      <Badge status={exam.status} />
    </div>
  );
}

// components/_ExamCardBody.tsx (60 dòng)
function ExamCardBody({ exam }: { exam: Exam }) {
  return (
    <div className="space-y-4 mt-4">
      <InfoRow label="Duration" value={`${exam.durationMinutes}m`} />
      <InfoRow label="Questions" value={String(exam.questionCount)} />
      <InfoRow label="Passing Score" value={`${exam.passingScore}%`} />
    </div>
  );
}

// components/_ExamCardFooter.tsx (40 dòng)
function ExamCardFooter({ exam }: { exam: Exam }) {
  return (
    <div className="flex gap-2 border-t pt-4 mt-4">
      <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded">
        Start Exam
      </button>
      <button className="flex-1 bg-gray-200 px-4 py-2 rounded">
        Preview
      </button>
    </div>
  );
}
```

### Const Constructor

Component function phải là `const`, không `function` declaration.

**✗ Sai:**
```typescript
export function ExamCard(props: ExamCardProps) {
  return <div>{props.exam.title}</div>;
}
```

**✓ Đúng:**
```typescript
export const ExamCard = (props: ExamCardProps) => {
  return <div>{props.exam.title}</div>;
};

// Hoặc Arrow function một dòng:
export const ExamCard = ({ exam }: ExamCardProps) => <div>{exam.title}</div>;
```

### Props Interface Required

Mỗi component phải có props interface, không `any` hoặc `props: any`.

**✗ Sai:**
```typescript
export const ExamCard = (props: any) => {
  return <div>{props.exam.title}</div>;
};

// Hoặc không declare interface
export const ExamCard = ({ exam, status, onSelect }: any) => {
  return <div>{exam.title}</div>;
};
```

**✓ Đúng:**
```typescript
interface ExamCardProps {
  exam: Exam;
  status?: ExamStatus;
  onSelect?: (examId: string) => void;
}

export const ExamCard = ({ exam, status, onSelect }: ExamCardProps) => {
  return (
    <div onClick={() => onSelect?.(exam.id)}>
      <h3>{exam.title}</h3>
      {status && <p>{status}</p>}
    </div>
  );
};
```

### No Inline Styles

KHÔNG dùng `style={{...}}`. Chỉ dùng Tailwind `className`.

**✗ Sai:**
```typescript
export const ExamCard = ({ exam }: ExamCardProps) => {
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{exam.title}</h3>
      <p style={{ color: '#666', fontSize: '14px' }}>{exam.description}</p>
    </div>
  );
};
```

**✓ Đúng:**
```typescript
export const ExamCard = ({ exam }: ExamCardProps) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-bold">{exam.title}</h3>
      <p className="text-sm text-gray-600">{exam.description}</p>
    </div>
  );
};
```

### No Magic Numbers

Mọi số có ý nghĩa → extract thành constant.

**✗ Sai:**
```typescript
const ExamTimer = ({ startTime }: { startTime: Date }) => {
  const elapsed = Date.now() - startTime.getTime();
  const remaining = 3600000 - elapsed; // Magic number: 1 hour in ms

  if (remaining < 300000) { // Magic number: 5 minutes in ms
    return <Warning>Less than 5 minutes remaining</Warning>;
  }

  return <span>{Math.floor(remaining / 60000)} minutes left</span>;
};
```

**✓ Đúng:**
```typescript
const EXAM_DURATION_MS = 60 * 60 * 1000; // 1 hour
const WARN_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const MINUTE_IN_MS = 60 * 1000;

const ExamTimer = ({ startTime }: { startTime: Date }) => {
  const elapsed = Date.now() - startTime.getTime();
  const remaining = EXAM_DURATION_MS - elapsed;

  if (remaining < WARN_THRESHOLD_MS) {
    return <Warning>Less than 5 minutes remaining</Warning>;
  }

  return <span>{Math.floor(remaining / MINUTE_IN_MS)} minutes left</span>;
};
```

---

## TypeScript Strict Mode

PTE web chạy `strict: true` (từ `@pte/config`). Không override.

### No `any` Type

KHÔNG dùng `any`. Dùng `unknown` + type narrowing hoặc define interface.

**✗ Sai:**
```typescript
function handleExamData(data: any) {
  return data.exam.id; // No type checking
}

const processResponse = (response: any) => {
  return response.data.students.map((s: any) => s.name);
};
```

**✓ Đúng:**
```typescript
// Option 1: Type narrowing with unknown
function handleExamData(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'exam' in data &&
    typeof (data as Record<string, unknown>).exam === 'object'
  ) {
    const exam = (data as Record<string, unknown>).exam as Record<string, unknown>;
    return exam.id as string;
  }
  throw new Error('Invalid data shape');
}

// Option 2: Define proper interface
interface ExamResponse {
  exam: { id: string };
}

function handleExamData(data: ExamResponse): string {
  return data.exam.id;
}
```

### Type Assertion Only with Comment

`as` chỉ dùng với comment giải thích lý do.

**✗ Sai:**
```typescript
const exam = data as Exam;
const students = response as StudentList[];
```

**✓ Đúng:**
```typescript
// API guarantees ExamResponse shape; need assertion for JSON parse
const exam = JSON.parse(examJson) as Exam;

// Server ensures only Exam role can access; runtime guarantee
const currentExam = examData as Exam;
```

### Return Type Required

Mỗi exported function phải có return type.

**✗ Sai:**
```typescript
export function getExamStatus(exam: Exam) {
  return exam.status;
}

export function calculateScore(answers: Answer[]) {
  return answers.reduce((sum, a) => sum + a.points, 0);
}
```

**✓ Đúng:**
```typescript
export function getExamStatus(exam: Exam): ExamStatus {
  return exam.status;
}

export function calculateScore(answers: Answer[]): number {
  return answers.reduce((sum, a) => sum + a.points, 0);
}
```

### No `// @ts-ignore`

KHÔNG dùng `@ts-ignore`. Fix type thay vì suppress.

**✗ Sai:**
```typescript
// @ts-ignore — data structure is complex
const examId = examData.exam.id;

function processExam(exam: unknown) {
  // @ts-ignore — we know this is safe
  return exam.title.toUpperCase();
}
```

**✓ Đúng:**
```typescript
// Define correct type
interface ExamData {
  exam: { id: string };
}
const examData: ExamData = JSON.parse(dataStr);
const examId = examData.exam.id;

// Use type guard
function processExam(exam: unknown): string {
  if (
    typeof exam === 'object' &&
    exam !== null &&
    'title' in exam &&
    typeof exam.title === 'string'
  ) {
    return exam.title.toUpperCase();
  }
  throw new Error('Invalid exam data');
}
```

---

## Mẫu Fetching Dữ liệu

### Client Component: TanStack Query

Tất cả API call ở client component đều dùng TanStack Query (`useQuery`, `useMutation`). KHÔNG fetch trực tiếp trong component body hoặc `useEffect`.

**✗ Sai:**
```typescript
'use client';

export function ExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/exams')
      .then(r => r.json())
      .then(data => {
        setExams(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Skeleton />;
  return <ul>{exams.map(e => <li key={e.id}>{e.title}</li>)}</ul>;
}
```

**✓ Đúng:**
```typescript
// features/exam/api.ts
export const useGetExams = () =>
  useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await fetch('/api/exams');
      if (!res.ok) throw new Error('Failed to fetch exams');
      return res.json() as Promise<Exam[]>;
    },
  });

// features/exam/components/ExamList.tsx
'use client';

export const ExamList = () => {
  const { data: exams, isLoading, error } = useGetExams();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!exams?.length) return <p>No exams found</p>;

  return (
    <ul>
      {exams.map(exam => (
        <li key={exam.id}>{exam.title}</li>
      ))}
    </ul>
  );
};
```

### Server Component: Async/Await

Server Component có thể fetch trực tiếp, KHÔNG dùng TanStack Query.

**✗ Sai — TanStack Query ở Server Component:**
```typescript
// ✗ WRONG: TanStack Query không dùng ở Server Component
export default function ExamPage() {
  const { data: exam } = useGetExam('exam-1'); // useGetExam return client hook

  return <ExamDetail exam={exam} />;
}
```

**✓ Đúng:**
```typescript
// ✓ CORRECT: Server Component async fetch
async function fetchExam(examId: string): Promise<Exam> {
  const res = await fetch(`/api/exams/${examId}`, { cache: 'revalidate' });
  if (!res.ok) throw new Error('Exam not found');
  return res.json();
}

export default async function ExamPage({ params }: { params: { examId: string } }) {
  const exam = await fetchExam(params.examId);

  return (
    <Suspense fallback={<ExamLoading />}>
      <ExamDetail exam={exam} />
    </Suspense>
  );
}
```

### Mixed Pattern: Server + Client

Server Component fetch data, pass to Client Component (TanStack Query).

**✓ Đúng:**
```typescript
// app/exams/page.tsx (Server Component)
export default async function ExamsPage() {
  const initialExams = await fetchExams();

  return (
    <Suspense fallback={<ExamListLoading />}>
      <ExamListClient initialData={initialExams} />
    </Suspense>
  );
}

// features/exam/components/ExamListClient.tsx (Client Component)
'use client';

interface ExamListClientProps {
  initialData: Exam[];
}

export function ExamListClient({ initialData }: ExamListClientProps) {
  const { data: exams = initialData } = useGetExams();

  return (
    <ul>
      {exams.map(exam => (
        <li key={exam.id}>{exam.title}</li>
      ))}
    </ul>
  );
}
```

### Never Mix Patterns

KHÔNG mix TanStack Query + direct `fetch()` trong cùng component.

**✗ Sai — Conflicting patterns:**
```typescript
'use client';

export function ExamPage({ examId }: { examId: string }) {
  // Pattern 1: TanStack Query
  const { data: exam } = useGetExam(examId);

  // Pattern 2: Direct fetch (WRONG!)
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    fetch(`/api/exams/${examId}/questions`).then(r => r.json()).then(setQuestions);
  }, [examId]);

  return <div>{exam?.title} — {questions.length} questions</div>;
}
```

**✓ Đúng — Unified pattern:**
```typescript
// features/exam/api.ts
export const useGetExam = (examId: string) =>
  useQuery({
    queryKey: ['exam', examId],
    queryFn: () => fetchExam(examId),
  });

export const useGetExamQuestions = (examId: string) =>
  useQuery({
    queryKey: ['exam', examId, 'questions'],
    queryFn: () => fetchExamQuestions(examId),
  });

// features/exam/components/ExamPage.tsx
'use client';

export function ExamPage({ examId }: { examId: string }) {
  const { data: exam } = useGetExam(examId);
  const { data: questions } = useGetExamQuestions(examId);

  return <div>{exam?.title} — {questions?.length} questions</div>;
}
```

---

## Quản lý Constants & String

### User-facing Strings vào Constants

Mọi string hiển thị cho user → `features/{feature}/constants.ts` hoặc `@pte/ui/constants.ts`.

KHÔNG hardcode string trong JSX.

**✗ Sai:**
```typescript
export function ExamCard({ exam }: { exam: Exam }) {
  return (
    <div>
      <h3>{exam.title}</h3>
      {exam.status === 'draft' && <p>Draft</p>}
      {exam.status === 'published' && <p>Published</p>}
      {!exam.published && <p>Not published yet</p>}
      <button>Start Exam</button>
      <button>Download Results</button>
    </div>
  );
}
```

**✓ Đúng:**
```typescript
// features/exam/constants.ts
export const EXAM_MESSAGES = {
  NOT_PUBLISHED: 'Not published yet',
} as const;

export const EXAM_STATUS_LABELS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
} as const;

export const EXAM_BUTTON_LABELS = {
  START: 'Start Exam',
  DOWNLOAD: 'Download Results',
  SUBMIT: 'Submit',
} as const;

// features/exam/components/ExamCard.tsx
import { EXAM_STATUS_LABELS, EXAM_BUTTON_LABELS, EXAM_MESSAGES } from '../constants';

export function ExamCard({ exam }: { exam: Exam }) {
  return (
    <div>
      <h3>{exam.title}</h3>
      {exam.status === 'draft' && <p>{EXAM_STATUS_LABELS.DRAFT}</p>}
      {exam.status === 'published' && <p>{EXAM_STATUS_LABELS.PUBLISHED}</p>}
      {!exam.published && <p>{EXAM_MESSAGES.NOT_PUBLISHED}</p>}
      <button>{EXAM_BUTTON_LABELS.START}</button>
      <button>{EXAM_BUTTON_LABELS.DOWNLOAD}</button>
    </div>
  );
}
```

### Error Messages

Tất cả error message vào constants, không inline.

**✗ Sai:**
```typescript
if (!exam) throw new Error('Exam not found');

if (exam.status !== 'published')
  throw new Error('Exam is not available for students');

if (attemptCount >= maxAttempts)
  throw new Error('You have exceeded maximum attempts');
```

**✓ Đúng:**
```typescript
// features/exam/constants.ts
export const EXAM_ERROR_MESSAGES = {
  NOT_FOUND: 'Exam not found',
  NOT_AVAILABLE: 'Exam is not available for students',
  MAX_ATTEMPTS_EXCEEDED: 'You have exceeded maximum attempts',
} as const;

// features/exam/api.ts
import { EXAM_ERROR_MESSAGES } from './constants';

export async function validateExamAccess(examId: string, attemptCount: number) {
  const exam = await fetchExam(examId);

  if (!exam) throw new Error(EXAM_ERROR_MESSAGES.NOT_FOUND);
  if (exam.status !== 'published')
    throw new Error(EXAM_ERROR_MESSAGES.NOT_AVAILABLE);
  if (attemptCount >= exam.maxAttempts)
    throw new Error(EXAM_ERROR_MESSAGES.MAX_ATTEMPTS_EXCEEDED);
}
```

### Config Constants

Config values (timeout, retry count, limits) → constants.

**✓ Đúng:**
```typescript
// features/exam/constants.ts
export const EXAM_CONFIG = {
  API_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  MAX_FILE_SIZE_MB: 10,
  POLLING_INTERVAL_MS: 5000,
} as const;

export const SUBMISSION_CONFIG = {
  MAX_ATTEMPTS: 3,
  SUBMISSION_TIMEOUT_MS: 60000,
} as const;
```

---

## Cấu trúc Route & Loading/Error

### kebab-case Folders

Next.js App Router: tất cả folder segments đều kebab-case.

```
app/
  (auth)/              ← kebab-case route group
    login/
      page.tsx
    signup/
      page.tsx
  exam-delivery/       ← kebab-case
    [exam-id]/         ← kebab-case param
      page.tsx
      loading.tsx
      error.tsx
  student-dashboard/   ← kebab-case
    page.tsx
```

### Loading States

Mỗi route có `loading.tsx` (Suspense fallback).

**✓ Đúng:**
```typescript
// app/exam-delivery/[exam-id]/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-40" />
    </div>
  );
}
```

### Error Boundaries

Mỗi route có `error.tsx` (Error boundary).

**✓ Đúng:**
```typescript
// app/exam-delivery/[exam-id]/error.tsx
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="p-4 text-red-600">
      <h1>Error loading exam</h1>
      <p>{error.message}</p>
      <button onClick={reset} className="mt-4 bg-blue-600 text-white px-4 py-2">
        Try again
      </button>
    </div>
  );
}
```

### Suspense Boundaries

Wrap async Server Component hoặc lazy Client Component bằng Suspense.

**✓ Đúng:**
```typescript
import { Suspense } from 'react';

export default async function ExamPage({ params }: { params: { examId: string } }) {
  return (
    <Suspense fallback={<ExamLoading />}>
      <ExamContent examId={params.examId} />
    </Suspense>
  );
}

// Hoặc lazy Client Component
const DynamicExamViewer = dynamic(() => import('./ExamViewer'), {
  loading: () => <ExamLoading />,
  ssr: false,
});
```

### Built-in Next.js Components

Luôn dùng `next/image`, `next/link`, `next/font` — không raw `<img>`, `<a>`, `@import`.

**✗ Sai:**
```typescript
// ✗ Raw <img> mất optimization
<img src="/logo.png" alt="Logo" />

// ✗ Raw <a> mất client-side navigation
<a href="/exams">View Exams</a>

// ✗ @import font mất preload
@import url('https://fonts.googleapis.com/css2?family=Roboto');
```

**✓ Đúng:**
```typescript
import Image from 'next/image';
import Link from 'next/link';
import { Roboto } from 'next/font/google';

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'] });

export function Header() {
  return (
    <div className={roboto.className}>
      <Image src="/logo.png" alt="Logo" width={40} height={40} />
      <Link href="/exams">View Exams</Link>
    </div>
  );
}
```

---

## Tailwind CSS & Styling

### No Inline Styles

KHÔNG dùng `style={{...}}`. Chỉ Tailwind `className`.

**✗ Sai:**
```typescript
<div style={{ padding: '16px', backgroundColor: '#f3f4f6' }}>
  <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Title</h1>
</div>
```

**✓ Đúng:**
```typescript
<div className="p-4 bg-gray-100">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### No Raw Color Codes

Dùng Tailwind palette, không hex/rgb hardcode.

**✗ Sai:**
```typescript
className="bg-[#1E88E5] text-[#FF5252]"
className="bg-[rgb(30, 136, 229)]"
```

**✓ Đúng:**
```typescript
className="bg-blue-600 text-red-500"
```

### Mobile-first Responsive

Tailwind responsive: mobile-first + breakpoint prefix (`md:`, `lg:`, `xl:`).

**✓ Đúng:**
```typescript
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>

<button className="w-full md:w-auto px-4 py-2">
  Responsive button
</button>
```

### No Magic Spacing

Dùng Tailwind scale, không arbitrary `p-[16px]`.

**✗ Sai:**
```typescript
className="p-[16px] gap-[12px] m-[24px]"
```

**✓ Đúng:**
```typescript
className="p-4 gap-3 m-6" // Tailwind scale: 4 = 16px, 3 = 12px, 6 = 24px
```

### Conditional Classes

Dùng `cn()` utility hoặc conditional literals, không concatenate strings.

**✗ Sai:**
```typescript
const buttonClass = variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200' + ' text-sm px-4';

const cardClass = isSelected ? 'border-2 border-blue-600' + (isHovered ? ' shadow-lg' : '');
```

**✓ Đúng:**
```typescript
import { cn } from '@/lib/cn'; // clsx or classnames equivalent

<button
  className={cn(
    'text-sm px-4 py-2',
    variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
  )}
/>

<div
  className={cn(
    'rounded border',
    isSelected && 'border-2 border-blue-600',
    isHovered && 'shadow-lg'
  )}
/>
```

---

## Quản lý Secrets

### Safe vs Unsafe Environment Variables

**`NEXT_PUBLIC_*` — SAFE cho client-side**
- Non-sensitive configuration
- API base URL, feature flags, app version
- Exposed to browser (visible in network requests, source)

**Server-side only (KHÔNG `NEXT_PUBLIC_`)**
- API secrets, private keys, OAuth credentials
- Database connection strings
- Internal tokens

**✗ Sai:**
```typescript
// ✗ NEVER! Secret exposed to client
export const GOOGLE_CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;

// ✗ NEVER! Hardcode secret
export const DB_PASSWORD = 'mysecretpassword123';

// ✗ NEVER! Secret in constants.ts
export const API_KEY = 'sk-abc123def456';
```

**✓ Đúng:**
```typescript
// ✓ Safe: public config
export const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pte.vn';
export const NEXT_PUBLIC_APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
export const NEXT_PUBLIC_FEATURE_ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_FEATURE_ANALYTICS_ENABLED === 'true';

// ✓ Safe: server-side only, NEVER used in browser
// lib/server-config.ts (only imported by Server Components / API routes)
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const DB_PASSWORD = process.env.DATABASE_PASSWORD!;

// ✓ Safe: lazy load server secrets
export async function getServerSecret(key: string): Promise<string> {
  return process.env[key] || (await fetchFromVault(key));
}
```

### `.env.local` in `.gitignore`

Luôn bỏ `.env.local` (development secrets) vào `.gitignore`.

**✓ .gitignore:**
```
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
```

**✗ NEVER commit:**
```
GOOGLE_OAUTH_SECRET=xyz
DATABASE_URL=postgresql://user:pass@host/db
API_SECRET_KEY=sk-abc123
```

---

## Lỗi thường gặp

### 1. Hardcoded String trong JSX

**Lỗi:** String không vào constants, khó maintain, i18n impossible.

**Ví dụ sai:**
```typescript
export function ExamStatus({ status }: { status: string }) {
  return <span>{status === 'draft' ? 'Draft' : 'Published'}</span>;
}
```

**Fix:**
```typescript
// constants.ts
export const EXAM_STATUS_LABELS = { DRAFT: 'Draft', PUBLISHED: 'Published' } as const;

// component
export function ExamStatus({ status }: { status: string }) {
  return <span>{EXAM_STATUS_LABELS[status as keyof typeof EXAM_STATUS_LABELS]}</span>;
}
```

### 2. Fetch trực tiếp trong `useEffect`

**Lỗi:** Race condition, memory leak khi unmount.

**Ví dụ sai:**
```typescript
useEffect(() => {
  fetch(`/api/exams/${examId}`)
    .then(r => r.json())
    .then(setExam);
}, [examId]);
```

**Fix:**
```typescript
// Dùng TanStack Query
const { data: exam } = useGetExam(examId);

// Hoặc abort fetch
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/exams/${examId}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setExam)
    .catch(err => !controller.signal.aborted && console.error(err));
  return () => controller.abort();
}, [examId]);
```

### 3. `any` Type

**Lỗi:** Mất type safety, refactor khó.

**Ví dụ sai:**
```typescript
function processExam(data: any) {
  return data.exam.score * 100; // Runtime error if missing
}
```

**Fix:**
```typescript
interface ExamData {
  exam: { score: number };
}

function processExam(data: ExamData): number {
  return data.exam.score * 100;
}
```

### 4. Component >150 dòng

**Lỗi:** Khó test, khó reuse, khó maintain.

**Fix:** Extract sub-component.

### 5. Inline Style thay vì Tailwind

**Lỗi:** Inconsistent design, hard-coded spacing, maintenance burden.

**Ví dụ sai:**
```typescript
<div style={{ padding: '16px', color: 'rgb(31, 41, 55)' }}>
```

**Fix:**
```typescript
<div className="p-4 text-gray-800">
```

### 6. Missing `loading.tsx` / `error.tsx` ở Route

**Lỗi:** User thấy màn hình trắng khi load thất bại.

**Fix:** Thêm `loading.tsx` và `error.tsx` cho mỗi route dynamic.

### 7. Mix Server + Client Component sai

**Lỗi:** Hydration mismatch, NEXT_RUNTIME error.

**Ví dụ sai:**
```typescript
// Server Component dùng useState
export default function Page() {
  const [count, setCount] = useState(0); // ✗ ERROR
}
```

**Fix:**
```typescript
'use client'; // Thêm khi cần browser API

export default function Page() {
  const [count, setCount] = useState(0);
}
```

### 8. `// @ts-ignore` không fix type

**Lỗi:** Mask real issues, technical debt.

**Ví dụ sai:**
```typescript
// @ts-ignore
const exam = examData.exam.id;
```

**Fix:**
```typescript
interface ExamData {
  exam: { id: string };
}
const exam = (examData as ExamData).exam.id;
```

---

## Checklist Code Review

Áp dụng cho mỗi PR trước merge:

### Naming & Structure
- [ ] Components có PascalCase file + export
- [ ] Hooks có `use` prefix
- [ ] Routes có kebab-case folders
- [ ] Constants là UPPER_SNAKE_CASE vào constants.ts
- [ ] Types vào types.ts

### TypeScript & Type Safety
- [ ] KHÔNG có `any` type (dùng `unknown` hoặc interface)
- [ ] Return type bắt buộc cho hàm exported
- [ ] Props interface defined cho mỗi component
- [ ] KHÔNG `// @ts-ignore` (fix type thay vì suppress)
- [ ] Type assertion `as` chỉ có khi có comment

### Component Rules
- [ ] Component function <150 dòng (extract sub-component nếu lớn hơn)
- [ ] File <300 dòng total (split nếu lớn hơn)
- [ ] Server Component by default (chỉ thêm `'use client'` khi cần)
- [ ] Props interface required (không `props: any`)
- [ ] KHÔNG inline style (chỉ Tailwind className)
- [ ] KHÔNG magic number/spacing (extract constant)

### Constants & Strings
- [ ] User-facing strings vào constants.ts (KHÔNG hardcode trong JSX)
- [ ] Error messages vào EXAM_ERROR_MESSAGES, etc.
- [ ] Config values extract thành constant
- [ ] Secrets KHÔNG vào constants.ts (dùng process.env)
- [ ] NEXT_PUBLIC_* chỉ cho non-sensitive config

### Data Fetching
- [ ] Client Component: API call via TanStack Query (api.ts)
- [ ] Server Component: async/await fetch (KHÔNG TanStack Query)
- [ ] KHÔNG fetch() trực tiếp trong component body
- [ ] KHÔNG mix TanStack Query + direct fetch
- [ ] Query keys consistent & descriptive

### Routing & Loading
- [ ] Mỗi route segment có loading.tsx (Suspense fallback)
- [ ] Mỗi route segment có error.tsx (Error boundary)
- [ ] Suspense boundaries đặt tại component level nhỏ nhất
- [ ] Dùng next/image, next/link, next/font (KHÔNG raw <img>, <a>, @import)

### ESLint & Formatting
- [ ] KHÔNG disable ESLint rule mà không comment
- [ ] KHÔNG `// @ts-ignore`
- [ ] Tailwind classes mobile-first (sm:, md:, lg:, xl:)
- [ ] KHÔNG arbitrary color `bg-[#...]` (dùng theme palette)
- [ ] KHÔNG arbitrary spacing `p-[16px]` (dùng Tailwind scale)

### Code Quality
- [ ] SOLID principles applied (S, O, L, I, D)
- [ ] DRY: KHÔNG duplicate code (extract function/hook)
- [ ] KISS: Simple solution preferred
- [ ] YAGNI: KHÔNG code "để phòng tương lai"
- [ ] Law of Demeter: KHÔNG chain >2 cấp
- [ ] CQS: Method OR return value OR change state, not both

### Secrets & Security
- [ ] `.env.local` bỏ vào `.gitignore`
- [ ] API secrets KHÔNG committed
- [ ] NEXT_PUBLIC_* chỉ non-sensitive config
- [ ] Anything with SECRET/KEY không có NEXT_PUBLIC_ prefix
- [ ] Server secrets only imported by Server Components

---

## Tài liệu tham khảo

- **Next.js 16:** https://nextjs.org/docs
- **TypeScript Strict Mode:** https://www.typescriptlang.org/tsconfig#strict
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **TanStack Query v5:** https://tanstack.com/query
- **React 19 Server Components:** https://react.dev/reference/rsc/server-components
- **@pte/config:** Xem `packages/config/` cho base ESLint + tsconfig

---

**Cuối cùng:** Nếu code không tuân thủ standard này, code review sẽ request changes. AI assistants được yêu cầu tự apply standards này.

