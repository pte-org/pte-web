import type { ReactElement, ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  brand?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const AuthLayout = ({
  title,
  subtitle,
  brand,
  footer,
  children,
}: AuthLayoutProps): ReactElement => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {brand && <div className="mb-6 flex justify-center">{brand}</div>}
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && (
          <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
        )}
      </div>
    </div>
  );
};
