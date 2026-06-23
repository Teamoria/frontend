import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import { employees, roles } from "../data/teamoriaData.js";

export default function EmployeesPage() {
  return (
    <AppShell active="Employees" user="Aseel Harazeen" role="General Manager" roleId="general-manager">
      <PageHeader
        title="Employees & Permissions"
        eyebrow="Manage company users, roles, workspace visibility, and account status."
        actions={<button className="product-button" type="button">Add Employee</button>}
      />

      <section className="employees-layout">
        <Panel title="Employee Directory">
          <div className="data-table">
            <div className="data-row data-row--head"><b>Name</b><b>Role</b><b>Company</b><b>Projects</b><b>Status</b></div>
            {employees.map((employee) => (
              <div className="data-row" key={employee.email}>
                <span><b>{employee.name}</b><small>{employee.email}</small></span>
                <span>{employee.role}</span>
                <span>{employee.company}</span>
                <span>{employee.projects}</span>
                <em>{employee.status}</em>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Role Matrix">
          <div className="role-matrix">
            {roles.map((role) => (
              <article key={role.id}>
                <b>{role.label}</b>
                <span>{role.ar}</span>
                <p>{role.scope}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
