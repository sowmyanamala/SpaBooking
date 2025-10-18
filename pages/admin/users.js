import AdminLayout from "../../components/admin/layout";
import Users from "../../components/admin/users";
import withAuth from "../../components/admin/withAuth";

function UsersPage() {
  return (
    <AdminLayout
      title="Users"
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Users" }]}
    >
      <Users />
    </AdminLayout>
  );
}

export default withAuth(UsersPage);








