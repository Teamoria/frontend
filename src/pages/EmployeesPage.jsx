import { useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiEye,
  FiFilter,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiMoreHorizontal,
  FiShare2,
  FiTrendingUp,
  FiUploadCloud,
  FiUserPlus,
  FiUsers,
  FiUserX,
  FiX,
  FiZap
} from "react-icons/fi";
import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import { employees, roles } from "../data/teamoriaData.js";

export default function EmployeesPage() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const employeeRows = employees.map((employee, index) => ({
    ...employee,
    department: ["Engineering", "Operations", "Product", "Design"][index] || "Operations",
    accessRole: index === 0 ? "Admin" : index === 2 ? "Manager" : "Member",
    project: ["Project Alpha", "Project Beta", "Project Gamma", "Project Alpha"][index] || "Project Alpha",
    title: ["Senior Product Designer", "General Manager", "Project Manager", "Frontend Engineer"][index] || employee.role,
    location: ["Chicago, IL (HQ)", "Ramallah, PS", "Amman, JO", "Remote"][index] || "Remote",
    productivity: [94, 91, 87, 76][index] || 82,
    tasks: [128, 112, 94, 41][index] || 64,
    onTime: [98.2, 96.4, 92.8, 88.1][index] || 90.5
  }));
  const profileEmployee = selectedEmployee || employeeRows[0];

  return (
    <AppShell active="Employees" user="Aseel Harazeen" role="Company Owner" roleId="general-manager">
      <PageHeader
        title="Team Directory"
        eyebrow="Manage employees, access roles, account status, and company-wide workforce visibility."
        actions={(
          <button className="product-button" type="button" onClick={() => setIsEmployeeModalOpen(true)}>
            <FiUserPlus aria-hidden="true" />
            Add Employee
          </button>
        )}
      />

      <section className="employees-summary-grid" aria-label="Employee overview">
        <article className="employees-summary-card">
          <small>Total Members</small>
          <div>
            <strong>1,284</strong>
            <span>+12%</span>
          </div>
        </article>
        <article className="employees-summary-card">
          <small>Active Now</small>
          <div>
            <strong>942</strong>
            <div className="employees-mini-stack" aria-hidden="true">
              <i>AA</i>
              <i>AH</i>
              <i>+5</i>
            </div>
          </div>
        </article>
        <article className="employees-summary-card">
          <small>On Leave</small>
          <div>
            <strong>43</strong>
            <span className="employees-summary-muted">Scheduled</span>
          </div>
        </article>
      </section>

      <section className="employees-layout">
        <Panel title="Employee Directory" className="employees-directory-panel">
          <div className="employees-filter-bar">
            <div>
              <label>
                <span>Role</span>
                <select defaultValue="all">
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                </select>
              </label>
              <label>
                <span>Status</span>
                <select defaultValue="all">
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="away">Away</option>
                  <option value="on-leave">On Leave</option>
                  <option value="invited">Invited</option>
                </select>
              </label>
              <label>
                <span>Project</span>
                <select defaultValue="all">
                  <option value="all">All Projects</option>
                  <option value="alpha">Project Alpha</option>
                  <option value="beta">Project Beta</option>
                  <option value="gamma">Project Gamma</option>
                </select>
              </label>
              <button className="employees-clear-filter" type="button">Clear Filters</button>
            </div>
            <button className="filter-button" type="button">
              <FiFilter aria-hidden="true" />
              More Filters
            </button>
          </div>

          <div className="employees-table-wrap">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Productivity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeeRows.map((employee) => (
                  <tr
                    className={selectedEmployee?.email === employee.email ? "is-selected" : ""}
                    key={employee.email}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <td>
                      <div className="employees-identity">
                        <span>{getInitials(employee.name)}</span>
                        <div>
                          <b>{employee.name}</b>
                          <small>{employee.title}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a className="employees-email" href={`mailto:${employee.email}`}>
                        <FiMail aria-hidden="true" />
                        {employee.email}
                      </a>
                    </td>
                    <td>
                      <span className={`employees-role-pill employees-role-pill--${employee.accessRole.toLowerCase()}`}>
                        {employee.accessRole}
                      </span>
                      <small className="employees-role-note">{employee.role}</small>
                    </td>
                    <td>{employee.department}</td>
                    <td>
                      <span className={`employees-status employees-status--${getStatusClass(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="employees-productivity" aria-label={`${employee.productivity}% productivity`}>
                        <span><i style={{ width: `${employee.productivity}%` }} /></span>
                        <b>{employee.productivity}%</b>
                      </div>
                    </td>
                    <td>
                      <div className="employees-actions">
                        <button
                          type="button"
                          title="View profile"
                          aria-label={`View ${employee.name} profile`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedEmployee(employee);
                          }}
                        >
                          <FiEye aria-hidden="true" />
                        </button>
                        <button type="button" title="Edit role" aria-label={`Edit ${employee.name} role`} onClick={(event) => event.stopPropagation()}>
                          <FiEdit2 aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          title={employee.status === "Invited" ? "Cancel invite" : "Deactivate user"}
                          aria-label={`${employee.status === "Invited" ? "Cancel invite for" : "Deactivate"} ${employee.name}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <FiUserX aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="employees-pagination">
            <p>Showing 1 to {employeeRows.length} of 1,284 members</p>
            <div>
              <button type="button" disabled aria-label="Previous page"><FiChevronLeft aria-hidden="true" /></button>
              <button className="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button" aria-label="Next page"><FiChevronRight aria-hidden="true" /></button>
            </div>
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

      {isEmployeeModalOpen ? (
        <div className="employees-modal-overlay" role="presentation">
          <section className="employees-modal" role="dialog" aria-modal="true" aria-labelledby="add-employee-title">
            <header>
              <h2 id="add-employee-title">Add New Employee</h2>
              <button type="button" onClick={() => setIsEmployeeModalOpen(false)} aria-label="Close add employee modal">
                <FiX aria-hidden="true" />
              </button>
            </header>
            <form>
              <label>
                <span>Full Name</span>
                <input type="text" placeholder="e.g. Alex Rivera" />
              </label>
              <label>
                <span>Email Address</span>
                <input type="email" placeholder="alex.r@teamoria.ai" />
              </label>
              <div className="employees-modal-grid">
                <label>
                  <span>Role</span>
                  <select defaultValue="member">
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label>
                  <span>Department</span>
                  <select defaultValue="engineering">
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="product">Product</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Project Assignment</span>
                <select defaultValue="alpha">
                  <option value="alpha">Project Alpha</option>
                  <option value="beta">Project Beta</option>
                  <option value="gamma">Project Gamma</option>
                </select>
              </label>
            </form>
            <footer>
              <button className="filter-button" type="button" onClick={() => setIsEmployeeModalOpen(false)}>Cancel</button>
              <button className="product-button" type="button">Add Employee</button>
            </footer>
          </section>
        </div>
      ) : null}

      {selectedEmployee ? (
        <EmployeeProfileDrawer employee={profileEmployee} onClose={() => setSelectedEmployee(null)} />
      ) : null}
    </AppShell>
  );
}

function EmployeeProfileDrawer({ employee, onClose }) {
  return (
    <div className="employee-profile-overlay" role="presentation" onClick={onClose}>
      <aside
        className="employee-profile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${employee.name} profile`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="employee-profile-drawer-head">
          <div>
            <button type="button" onClick={onClose} aria-label="Close employee profile">
              <FiX aria-hidden="true" />
            </button>
            <nav aria-label="Profile breadcrumb">
              <span>Directory</span>
              <b>{employee.name}</b>
            </nav>
          </div>
          <div>
            <button type="button" aria-label="Share profile"><FiShare2 aria-hidden="true" /></button>
            <button type="button" aria-label="More profile actions"><FiMoreHorizontal aria-hidden="true" /></button>
          </div>
        </header>

        <div className="employee-profile-scroll">
          <section className="employee-profile-hero">
            <div className="employee-profile-avatar">
              <span>{getInitials(employee.name)}</span>
              <i aria-hidden="true" />
            </div>
            <h2>{employee.name}</h2>
            <p>{employee.title}</p>
            <em><i aria-hidden="true" /> Currently Online</em>
          </section>

          <section className="employee-profile-actions" aria-label="Profile actions">
            <button type="button"><FiEdit2 aria-hidden="true" /><span>Edit Profile</span></button>
            <button type="button"><FiBriefcase aria-hidden="true" /><span>Assign Project</span></button>
            <button type="button" className="primary"><FiMessageSquare aria-hidden="true" /><span>Message</span></button>
          </section>

          <section>
            <h3 className="employee-profile-section-title">Contact Information</h3>
            <div className="employee-profile-details">
              <ProfileDetail icon={<FiMail aria-hidden="true" />} label="Work Email" value={employee.email} />
              <ProfileDetail icon={<FiUsers aria-hidden="true" />} label="Department" value={`${employee.department} & Strategy`} />
              <ProfileDetail icon={<FiMapPin aria-hidden="true" />} label="Location" value={employee.location} />
            </div>
          </section>

          <section>
            <h3 className="employee-profile-section-title">Performance Overview</h3>
            <article className="employee-ai-score-card">
              <div>
                <small>AI Productivity Score</small>
                <FiZap aria-hidden="true" />
              </div>
              <div className="employee-score-value">
                <strong>{employee.productivity}%</strong>
                <span><FiTrendingUp aria-hidden="true" /> +4%</span>
              </div>
              <div className="employee-ai-progress"><i style={{ width: `${employee.productivity}%` }} /></div>
            </article>
            <div className="employee-profile-stat-grid">
              <article>
                <FiCheckCircle aria-hidden="true" />
                <div><small>Tasks Completed</small><b>{employee.tasks}</b></div>
              </article>
              <article>
                <FiClock aria-hidden="true" />
                <div><small>On-time Delivery</small><b>{employee.onTime}%</b></div>
              </article>
            </div>
          </section>

          <section>
            <div className="employee-profile-timeline-head">
              <h3 className="employee-profile-section-title">Active Projects</h3>
              <button type="button">View All</button>
            </div>
            <div className="employee-active-projects">
              <ProjectProgress title="Design System Audit" progress={75} />
              <ProjectProgress title="Mobile App V2.0" progress={42} tone="secondary" />
            </div>
          </section>

          <section>
            <div className="employee-profile-timeline-head">
              <h3 className="employee-profile-section-title">Recent Activity</h3>
              <button type="button">View Log</button>
            </div>
            <div className="employee-profile-timeline">
              <TimelineItem icon={<FiCheckCircle aria-hidden="true" />} title="Completed Task" text={`${employee.project} UI Audit`} time="2 hours ago - Product Design" />
              <TimelineItem icon={<FiUsers aria-hidden="true" />} title="Joined Meeting" text="Sprint Planning - Q4 Strategy" time="Today at 10:30 AM - Zoom" />
              <TimelineItem icon={<FiUploadCloud aria-hidden="true" />} title="Uploaded File" text="Final_Design_Specs_v2.fig" time="Yesterday at 4:45 PM - 12MB" />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function ProjectProgress({ title, progress, tone = "primary" }) {
  return (
    <article className="employee-project-progress">
      <div>
        <b>{title}</b>
        <span>{progress}%</span>
      </div>
      <p><i className={`tone-${tone}`} style={{ width: `${progress}%` }} /></p>
    </article>
  );
}

function ProfileDetail({ icon, label, value }) {
  return (
    <div>
      {icon}
      <span><small>{label}</small><b>{value}</b></span>
    </div>
  );
}

function TimelineItem({ icon, title, text, time }) {
  return (
    <article>
      <span>{icon}</span>
      <div>
        <p><b>{title}:</b> {text}</p>
        <small>{time}</small>
      </div>
    </article>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}
