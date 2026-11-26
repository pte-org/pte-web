import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROSTER_ROW_MESSAGES } from "../../../../features/examoperations/constants";
import { RosterCreateControls } from "../../../../features/examoperations/components/RosterCreateControls";

const hoisted = vi.hoisted(() => ({ locale: "vi" as "en" | "vi" }));

vi.mock("@pte/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pte/ui")>();
  return {
    ...actual,
    useLocale: () => ({
      locale: hoisted.locale,
      t: (_key: string, fallback?: string, values?: Record<string, string | number>) =>
        (fallback ?? _key).replace(/\{(\w+)\}/g, (_, k: string) => String(values?.[k] ?? `{${k}}`)),
    }),
  };
});

describe("RosterCreateControls bilingual rendering", () => {
  const issues = [
    { row: 4, field: "email" as const, message: ROSTER_ROW_MESSAGES.EMAIL_INVALID },
    { row: 6, field: "email" as const, message: ROSTER_ROW_MESSAGES.DUPLICATE_EMAIL_IN_BATCH },
  ];

  beforeEach(() => {
    hoisted.locale = "vi";
  });

  it("renders row errors and credentials checkbox in Vietnamese when locale is vi", () => {
    const html = renderToStaticMarkup(
      <RosterCreateControls
        rows={[]}
        rowIssues={issues}
        sendCredentialsEmail={false}
        onSendCredentialsEmailChange={vi.fn()}
        onCreate={vi.fn()}
        isPending={false}
        error={null}
        createLabel="Nhập học viên"
        creatingLabel="Đang tạo tài khoản..."
        checkboxId="test-checkbox"
      />,
    );

    expect(html).toContain("Cần sửa 2 lỗi trước khi tạo tài khoản");
    expect(html).toContain("Hãy sửa các ô này trong tệp Excel rồi tải lên lại. Chưa có tài khoản nào được tạo.");
    expect(html).toContain("Dòng 4");
    expect(html).toContain("Email không đúng định dạng.");
    expect(html).toContain("Dòng 6");
    expect(html).toContain("Email này xuất hiện nhiều hơn một lần trong tệp.");
    expect(html).toContain("Gửi email tên đăng nhập và mật khẩu tạm thời cho từng học viên");
    expect(html).toContain("Được gửi sau khi tạo tài khoản. Bạn cũng luôn có thể tải tệp thông tin đăng nhập.");
  });

  it("renders row errors and credentials checkbox in English when locale is en", () => {
    hoisted.locale = "en";
    const html = renderToStaticMarkup(
      <RosterCreateControls
        rows={[]}
        rowIssues={issues}
        sendCredentialsEmail={false}
        onSendCredentialsEmailChange={vi.fn()}
        onCreate={vi.fn()}
        isPending={false}
        error={null}
        createLabel="Create Accounts"
        creatingLabel="Creating accounts..."
        checkboxId="test-checkbox"
      />,
    );

    expect(html).toContain("2 problems must be fixed before any account is created");
    expect(html).toContain("Fix these cells in your Excel file and upload it again. Nothing has been created.");
    expect(html).toContain("Row 4");
    expect(html).toContain("Email is not a valid address.");
    expect(html).toContain("Row 6");
    expect(html).toContain("This email appears more than once in the file.");
    expect(html).toContain("E-mail each student their username and temporary password");
    expect(html).toContain("Sent after the accounts are created. You can always download the credentials file as well.");
  });
});
