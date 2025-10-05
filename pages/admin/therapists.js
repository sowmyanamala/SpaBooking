import AdminLayout from "../../components/admin/layout";
import Therapists from "../../components/admin/therapists";
import withAuth from "../../components/admin/withAuth";

function TherapistsPage() {
  return (
    <AdminLayout
      title="Therapists"
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Therapists" }]}
    >
      <Therapists />
    </AdminLayout>
  );
}

export default withAuth(TherapistsPage);


