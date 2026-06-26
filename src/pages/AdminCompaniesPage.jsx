import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { platformCompanies } from "../data/systemFlowData.js";

export default function AdminCompaniesPage() {
  return (
    <AppShell active="Companies" roleId="admin">
      <PageHeader
        title="All Companies"
        eyebrow="Review company records, subscription states, owners, projects, and recovery actions."
        actions={(
          <>
            <button className="filter-button" type="button">Filters</button>
            <button className="product-button" type="button">Create Company</button>
          </>
        )}
      />

      <Panel title="Company Directory">
        <div className="data-table">
          <div className="admin-data-row admin-data-row--head">
            <b>Company</b><b>Plan</b><b>Status</b><b>Projects</b><b>Revenue</b><b>Actions</b>
          </div>
          {platformCompanies.map((company) => (
            <div className="admin-data-row admin-data-row--companies" key={company.name}>
              <span><b>{company.name}</b><small>{company.owner} - {company.members} members</small></span>
              <span>{company.plan}</span>
              <Badge tone={statusTone(company.status)}>{company.status}</Badge>
              <span>{company.projects}</span>
              <span>{company.revenue}</span>
              <span className="row-actions">
                <a className="add-task-link" href="#/admin/companies/taqat">Details</a>
                <button type="button">{company.status === "Suspended" ? "Restore" : "Suspend"}</button>
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}

function statusTone(status) {
  if (status.includes("Pending") || status === "Trialing") return "orange";
  if (status === "Suspended") return "red";
  return "green";
}
