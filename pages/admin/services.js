import AdminLayout from "../../components/admin/layout";
import Services from "../../components/admin/services";
import withAuth from "../../components/admin/withAuth";

function ServicesPage() {
  return (
    <AdminLayout
      title="Services"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Services" }]}
    >
      <Services />
    </AdminLayout>
  );
}

export default withAuth(ServicesPage);


