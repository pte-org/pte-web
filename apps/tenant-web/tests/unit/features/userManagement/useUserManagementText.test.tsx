import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CredentialDisplay, LocaleProvider } from "@pte/ui";
import { useUserManagementText } from "../../../../features/userManagement/hooks/useUserManagementText";

const Copy = () => {
  const text = useUserManagementText();
  return (
    <div>
      <h1>{text.credentialsTitle}</h1>
      <p>{text.emailDelivery("a@b.com")}</p>
      <p>{text.noEmailDelivery}</p>
      <span>{text.temporaryPassword}</span>
      <span>{text.done}</span>
      <CredentialDisplay credential="secret" label={text.temporaryPassword} />
    </div>
  );
};

describe("account credential dialogs copy", () => {
  const html = renderToStaticMarkup(
    <LocaleProvider>
      <Copy />
    </LocaleProvider>,
  );

  it("is shown in Vietnamese by default, with the email filled in", () => {
    expect(html).toContain("Mật khẩu tạm thời");
    expect(html).toContain("gửi tới a@b.com");
    expect(html).toContain("không gửi qua email");
    expect(html).toContain("Xong");
  });

  it("translates the shared credential box too", () => {
    expect(html).toContain("Hiện");
    expect(html).toContain("Sao chép");
    expect(html).toContain("chỉ hiển thị một lần");
    expect(html).not.toContain("Show");
  });
});
