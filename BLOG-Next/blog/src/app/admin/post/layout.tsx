import { MenuAdmin } from "@/components/Admin/MenuAdmin";
import { requireLoginSessionOrRedirect } from "@/lib/login/manage-login";

type AdminPostLayoutProps = {
  children: React.ReactNode;
}

export default async function AdminPostLayout({
  children,
}: Readonly<AdminPostLayoutProps>) {
  await requireLoginSessionOrRedirect()
  return (
    <>
      <MenuAdmin />
      {children}
    </>
  );
}
