import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@pte/ui";

vi.mock("../../../../features/auth/api", () => ({
  useChangePassword: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  useSessionManager: () => ({ session: null, saveSession: vi.fn() }),
  useToast: () => ({ showToast: vi.fn() }),
}));

import { FirstPasswordChange } from "../../../../features/auth/components/FirstPasswordChange";
import { FIRST_PASSWORD_TEXT_VI } from "../../../../features/auth/authVietnamese";

describe("FirstPasswordChange", () => {
  it("asks only for the new password twice and offers a way back to sign in", () => {
    // The language switch starts on Vietnamese until a stored choice is read after hydration.
    const html = renderToStaticMarkup(
      <LocaleProvider>
        <FirstPasswordChange currentPassword="temp" onChanged={() => undefined} onBack={() => undefined} />
      </LocaleProvider>,
    );
    expect(html).toContain(FIRST_PASSWORD_TEXT_VI.title);
    expect(html.match(/type="password"/g)).toHaveLength(2);
    expect(html).not.toContain("current-password");
    expect(html).toContain(FIRST_PASSWORD_TEXT_VI.backToLogin);
  });
});
