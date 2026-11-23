import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("../../../../features/auth/api", () => ({
  useChangePassword: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  useSessionManager: () => ({ session: null, saveSession: vi.fn() }),
  useToast: () => ({ showToast: vi.fn() }),
}));

import { FirstPasswordChange } from "../../../../features/auth/components/FirstPasswordChange";
import { FIRST_PASSWORD_TEXT } from "../../../../features/auth/constants";

describe("FirstPasswordChange", () => {
  it("asks only for the new password twice and offers a way back to sign in", () => {
    const html = renderToStaticMarkup(
      <FirstPasswordChange currentPassword="temp" onChanged={() => undefined} onBack={() => undefined} />,
    );
    expect(html).toContain(FIRST_PASSWORD_TEXT.title);
    expect(html.match(/type="password"/g)).toHaveLength(2);
    expect(html).not.toContain("current-password");
    expect(html).toContain(FIRST_PASSWORD_TEXT.backToLogin);
  });
});
