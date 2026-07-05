import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiArchive,
  FiBriefcase,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiEye,
  FiGlobe,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiRotateCcw,
  FiShield,
  FiTrash2,
  FiUser,
  FiUserPlus,
  FiUserX,
  FiX
} from "react-icons/fi";
import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import {
  createStaffMember,
  deleteStaffMember,
  forceDeleteStaffMember,
  getPayloadData,
  listStaff,
  restoreStaffMember,
  updateStaffMember
} from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { isDemoMode } from "../lib/demoMode.js";
import "../styles/employees.css";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "company_member",
  status: "active"
};

const roleOptions = [
  { value: "company_member", label: "Company Member" },
  { value: "company_manager", label: "Company Manager" }
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" }
];

const demoStaff = [
  {
    id: "demo-staff-1",
    name: "Aseel Harazeen",
    email: "aseel@teamoria.demo",
    phone: "+970 59 000 1101",
    role: "company_manager",
    status: "active",
    timezone: "Asia/Hebron",
    is_email_verified: true,
    created_at: "2026-05-14T09:00:00Z"
  },
  {
    id: "demo-staff-2",
    name: "Fares Namlah",
    email: "fares@teamoria.demo",
    phone: "+970 59 000 1102",
    role: "company_manager",
    status: "active",
    timezone: "Asia/Hebron",
    is_email_verified: true,
    created_at: "2026-05-18T10:30:00Z"
  },
  {
    id: "demo-staff-3",
    name: "Sarah Johnson",
    email: "sarah@teamoria.demo",
    phone: "+1 415 555 0188",
    role: "company_member",
    status: "active",
    timezone: "America/Los_Angeles",
    is_email_verified: true,
    created_at: "2026-06-02T13:15:00Z"
  },
  {
    id: "demo-staff-4",
    name: "Fatima Ali",
    email: "fatima@teamoria.demo",
    phone: "+970 59 000 1104",
    role: "company_member",
    status: "pending",
    timezone: "Asia/Hebron",
    is_email_verified: false,
    created_at: "2026-06-12T08:45:00Z"
  },
  {
    id: "demo-staff-5",
    name: "Leon Rivera",
    email: "leon@teamoria.demo",
    phone: "+1 646 555 0174",
    role: "company_member",
    status: "inactive",
    timezone: "America/New_York",
    is_email_verified: true,
    created_at: "2026-04-29T11:20:00Z"
  }
];

export default function EmployeesPage() {
  const { user } = useAuth();
  const isDemo = isDemoMode();
  const [rows, setRows] = useState([]);
  const [demoRows, setDemoRows] = useState(demoStaff);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0, has_more: false });
  const [filters, setFilters] = useState({ role: "all", status: "all", archived: false });
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const summary = useMemo(() => {
    const active = rows.filter((employee) => employee.status === "active").length;
    const pending = rows.filter((employee) => employee.status === "pending").length;
    return {
      total: pagination.total || rows.length,
      active,
      pending
    };
  }, [pagination.total, rows]);

  useEffect(() => {
    loadStaff();
  }, [page, filters.role, filters.status, filters.archived, demoRows]);

  async function loadStaff() {
    setIsLoading(true);

    if (isDemo) {
      const filteredRows = demoRows
        .filter((employee) => filters.role === "all" || employee.role === filters.role)
        .filter((employee) => filters.status === "all" || employee.status === filters.status)
        .map(normalizeEmployee);

      setRows(filteredRows);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: filteredRows.length,
        total: filteredRows.length,
        has_more: false
      });
      setStatus({ type: "", message: "" });
      setIsLoading(false);
      return;
    }

    try {
      const payload = await listStaff({
        page,
        archived: filters.archived,
        roles: filters.role === "all" ? undefined : [filters.role],
        statuses: filters.status === "all" ? undefined : [filters.status]
      });
      const data = getPayloadData(payload);
      const staffRows = data?.staff || data?.users || data?.data || data || [];
      setRows(Array.isArray(staffRows) ? staffRows.map(normalizeEmployee) : []);
      setPagination(data?.pagination || payload?.pagination || { current_page: page, last_page: 1, per_page: 10, total: staffRows.length || 0, has_more: false });
    } catch (error) {
      if (error.status === 404) {
        const previewRows = demoStaff
          .filter((employee) => filters.role === "all" || employee.role === filters.role)
          .filter((employee) => filters.status === "all" || employee.status === filters.status)
          .map(normalizeEmployee);

        setRows(previewRows);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: previewRows.length,
          total: previewRows.length,
          has_more: false
        });
        setStatus({
          type: "error",
          message: "Staff API route is not connected yet. Showing preview data for the owner workspace."
        });
      } else {
        setRows([]);
        setStatus({ type: "error", message: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setForm(emptyForm);
    setSelectedEmployee(null);
    setModalMode("create");
    setStatus({ type: "", message: "" });
  }

  function openEditModal(employee) {
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      password: "",
      password_confirmation: "",
      role: employee.role || "company_member",
      status: employee.status || "active"
    });
    setSelectedEmployee(employee);
    setModalMode("edit");
    setStatus({ type: "", message: "" });
  }

  function closeModal() {
    setModalMode(null);
    setForm(emptyForm);
    setIsSaving(false);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setStatus({ type: "", message: "" });

    if (isDemo) {
      const nextEmployee = normalizeEmployee({
        id: selectedEmployee?.id || `demo-staff-${Date.now()}`,
        ...selectedEmployee,
        ...form,
        phone: selectedEmployee?.phone || "+970 59 000 1199",
        is_email_verified: selectedEmployee?.is_email_verified ?? false,
        created_at: selectedEmployee?.created_at || new Date().toISOString()
      });

      setDemoRows((current) => (
        modalMode === "edit"
          ? current.map((employee) => employee.id === nextEmployee.id ? nextEmployee : employee)
          : [nextEmployee, ...current]
      ));
      setPagination((current) => ({
        ...current,
        total: modalMode === "edit" ? current.total : current.total + 1
      }));
      setStatus({ type: "success", message: modalMode === "edit" ? "Demo employee updated locally." : "Demo employee added locally." });
      closeModal();
      setIsSaving(false);
      return;
    }

    try {
      if (modalMode === "edit" && selectedEmployee?.id) {
        await updateStaffMember(selectedEmployee.id, form);
        setStatus({ type: "success", message: "Employee updated successfully." });
      } else {
        await createStaffMember(form);
        setStatus({ type: "success", message: "Employee created successfully." });
      }

      closeModal();
      await loadStaff();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function runAction(action, successMessage) {
    setStatus({ type: "", message: "" });

    if (isDemo) {
      setStatus({ type: "success", message: `${successMessage} Demo mode only.` });
      setSelectedEmployee(null);
      return;
    }

    try {
      await action();
      setStatus({ type: "success", message: successMessage });
      setSelectedEmployee(null);
      await loadStaff();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  function changeFilter(field, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <AppShell active="Employees" user={user?.name || "Company Owner"} role="Company Owner" roleId="owner">
      <div className="employees-page">
      <PageHeader
        title="Team Directory"
        eyebrow={isDemo ? "Demo staff directory for frontend edits without backend." : "Manage company managers and members through the Staff API."}
        actions={(
          <button className="product-button" type="button" onClick={openCreateModal}>
            <FiUserPlus aria-hidden="true" />
            Add Employee
          </button>
        )}
      />

      <section className="employees-summary-grid" aria-label="Employee overview">
        <SummaryCard label="Total Staff" value={summary.total} note={isDemo ? "Demo data" : filters.archived ? "Archived view" : "Live API"} />
        <SummaryCard label="Active" value={summary.active} note="Current page" />
        <SummaryCard label="Pending" value={summary.pending} note="Awaiting action" muted />
      </section>

      {status.message ? <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p> : null}

      <section className="employees-layout">
        <Panel title="Employee Directory" className="employees-directory-panel">
          <div className="employees-filter-bar">
            <div>
              <label>
                <span>Role</span>
                <select value={filters.role} onChange={(event) => changeFilter("role", event.target.value)}>
                  <option value="all">All Roles</option>
                  {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select value={filters.status} onChange={(event) => changeFilter("status", event.target.value)}>
                  <option value="all">All Statuses</option>
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                <span>View</span>
                <select value={filters.archived ? "archived" : "active"} onChange={(event) => changeFilter("archived", event.target.value === "archived")}>
                  <option value="active">Active Records</option>
                  <option value="archived">Archived Records</option>
                </select>
              </label>
              <button
                className="employees-clear-filter"
                type="button"
                onClick={() => {
                  setPage(1);
                  setFilters({ role: "all", status: "all", archived: false });
                }}
              >
                Clear Filters
              </button>
            </div>
            <button className="filter-button" type="button" onClick={loadStaff}>
              <FiRefreshCw aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="employees-table-wrap">
            <div className="container--scroll-x">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Timezone</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <MessageRow text={isDemo ? "Loading demo staff..." : "Loading staff from API..."} />
                  ) : rows.length === 0 ? (
                    <MessageRow text="No staff members found." />
                  ) : rows.map((employee) => (
                    <tr
                      className={selectedEmployee?.id === employee.id ? "is-selected" : ""}
                      key={employee.id || employee.email}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <td>
                        <div className="employees-identity">
                          <span>{getInitials(employee.name || employee.email)}</span>
                          <div>
                            <b>{employee.name || "Unnamed employee"}</b>
                            <small>{employee.phone || "No phone"}</small>
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
                        <span className={`employees-role-pill employees-role-pill--${getRoleClass(employee.role)}`}>
                          {formatLabel(employee.role)}
                        </span>
                      </td>
                      <td>
                        <span className={`employees-status employees-status--${getStatusClass(employee.status)}`}>
                          {formatLabel(employee.status)}
                        </span>
                      </td>
                      <td>{employee.timezone || "UTC"}</td>
                      <td>{employee.is_email_verified ? "Yes" : "No"}</td>
                      <td>
                        <div className="employees-actions">
                          <button type="button" title="View profile" aria-label={`View ${employee.name} profile`} onClick={(event) => event.stopPropagation()}>
                            <FiEye aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title="Edit employee"
                            aria-label={`Edit ${employee.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditModal(employee);
                            }}
                          >
                            <FiEdit2 aria-hidden="true" />
                          </button>
                          {filters.archived ? (
                            <>
                              <button
                                type="button"
                                title="Restore employee"
                                aria-label={`Restore ${employee.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  runAction(() => restoreStaffMember(employee.id), "Employee restored successfully.");
                                }}
                              >
                                <FiRotateCcw aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                title="Delete permanently"
                                aria-label={`Delete ${employee.name} permanently`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  runAction(() => forceDeleteStaffMember(employee.id), "Employee permanently deleted.");
                                }}
                              >
                                <FiTrash2 aria-hidden="true" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              title="Archive employee"
                              aria-label={`Archive ${employee.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                runAction(() => deleteStaffMember(employee.id), "Employee archived successfully.");
                              }}
                            >
                              <FiUserX aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="employees-pagination">
            <p>Page {pagination.current_page || page} of {pagination.last_page || 1} - {pagination.total || rows.length} records</p>
            <div>
              <button type="button" disabled={page <= 1 || isLoading} aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))}>
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button className="active" type="button">{page}</button>
              <button type="button" disabled={!pagination.has_more && page >= pagination.last_page} aria-label="Next page" onClick={() => setPage((current) => current + 1)}>
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </Panel>

      </section>

      {modalMode ? (
        <EmployeeModal
          form={form}
          isSaving={isSaving}
          mode={modalMode}
          onClose={closeModal}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
        />
      ) : null}

      {selectedEmployee && !modalMode ? (
        <EmployeeProfileDrawer
          employee={selectedEmployee}
          onArchive={() => runAction(() => deleteStaffMember(selectedEmployee.id), "Employee archived successfully.")}
          onClose={() => setSelectedEmployee(null)}
          onEdit={() => openEditModal(selectedEmployee)}
          showArchive={!filters.archived}
        />
      ) : null}
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, note, muted = false }) {
  return (
    <article className="employees-summary-card">
      <small>{label}</small>
      <div>
        <strong>{value}</strong>
        <span className={muted ? "employees-summary-muted" : ""}>{note}</span>
      </div>
    </article>
  );
}

function MessageRow({ text }) {
  return (
    <tr>
      <td className="employees-empty-cell" colSpan="7">{text}</td>
    </tr>
  );
}

function EmployeeModal({ form, isSaving, mode, onClose, onFieldChange, onSubmit }) {
  const isEdit = mode === "edit";

  return createPortal(
    <div className="employees-modal-overlay" role="presentation">
      <section className="employees-modal" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
        <header>
          <h2 id="employee-modal-title">{isEdit ? "Edit Employee" : "Add New Employee"}</h2>
          <button type="button" onClick={onClose} aria-label="Close employee modal">
            <FiX aria-hidden="true" />
          </button>
        </header>
        <form id="employee-form" onSubmit={onSubmit}>
          <label>
            <span>Full Name</span>
            <input required type="text" value={form.name} onChange={(event) => onFieldChange("name", event.target.value)} placeholder="e.g. Alex Rivera" />
          </label>
          <label>
            <span>Email Address</span>
            <input required type="email" value={form.email} onChange={(event) => onFieldChange("email", event.target.value)} placeholder="alex.r@teamoria.ai" />
          </label>
          <div className="employees-modal-grid">
            <label>
              <span>Role</span>
              <select value={form.role} onChange={(event) => onFieldChange("role", event.target.value)}>
                {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={form.status} onChange={(event) => onFieldChange("status", event.target.value)}>
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="employees-modal-grid">
            <label>
              <span>{isEdit ? "New Password" : "Password"}</span>
              <input required={!isEdit} type="password" value={form.password} onChange={(event) => onFieldChange("password", event.target.value)} placeholder={isEdit ? "Leave blank to keep current" : "Password"} />
            </label>
            <label>
              <span>Confirm Password</span>
              <input required={!isEdit} type="password" value={form.password_confirmation} onChange={(event) => onFieldChange("password_confirmation", event.target.value)} placeholder="Confirm password" />
            </label>
          </div>
        </form>
        <footer>
          <button className="filter-button" type="button" onClick={onClose}>Cancel</button>
          <button className="product-button" type="submit" form="employee-form" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Add Employee"}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}

function EmployeeProfileDrawer({ employee, onArchive, onClose, onEdit, showArchive }) {
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
            <span>Employee profile</span>
            <b>Team Directory</b>
          </div>
          <button type="button" onClick={onClose} aria-label="Close employee profile">
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="employee-profile-scroll">
          <section className="employee-profile-hero">
            <div className="employee-profile-avatar">
              <span>{getInitials(employee.name || employee.email)}</span>
              <i aria-hidden="true" />
            </div>
            <div>
              <h2>{employee.name || "Unnamed employee"}</h2>
              <p>{formatLabel(employee.role)}</p>
              <a href={`mailto:${employee.email}`}>{employee.email || "No email"}</a>
            </div>
            <em className={`employee-profile-status employee-profile-status--${getStatusClass(employee.status)}`}>
              <i aria-hidden="true" />
              {formatLabel(employee.status)}
            </em>
          </section>

          <section className="employee-profile-actions" aria-label="Profile actions">
            <button type="button" onClick={onEdit}><FiEdit2 aria-hidden="true" /><span>Edit</span></button>
            {showArchive ? (
              <button type="button" onClick={onArchive}><FiArchive aria-hidden="true" /><span>Archive</span></button>
            ) : null}
            <a href={`mailto:${employee.email}`}><FiMail aria-hidden="true" /><span>Email</span></a>
          </section>

          <section className="employee-profile-section">
            <h3 className="employee-profile-section-title">Contact information</h3>
            <div className="employee-profile-details">
              <ProfileDetail icon={FiMail} label="Work email" value={employee.email || "No email"} />
              <ProfileDetail icon={FiPhone} label="Phone" value={employee.phone || "No phone"} />
              <ProfileDetail icon={FiGlobe} label="Timezone" value={employee.timezone || "UTC"} />
            </div>
          </section>

          <section className="employee-profile-section">
            <h3 className="employee-profile-section-title">Account status</h3>
            <div className="employee-profile-details">
              <ProfileDetail icon={FiCheckCircle} label="Status" value={formatLabel(employee.status)} />
              <ProfileDetail icon={FiShield} label="Email verified" value={employee.is_email_verified ? "Verified" : "Not verified"} />
            </div>
          </section>

          <section className="employee-profile-section">
            <h3 className="employee-profile-section-title">Role & permissions</h3>
            <div className="employee-profile-details">
              <ProfileDetail icon={FiBriefcase} label="Role" value={formatLabel(employee.role)} />
              <ProfileDetail icon={FiUser} label="Access scope" value={employee.role === "company_manager" ? "Can manage company work" : "Assigned workspace access"} />
            </div>
          </section>

          <section className="employee-profile-section">
            <h3 className="employee-profile-section-title">Activity</h3>
            <div className="employee-profile-details">
              <ProfileDetail icon={FiClock} label="Joined" value={formatDate(employee.created_at)} />
              <ProfileDetail icon={FiRefreshCw} label="Last updated" value={formatDate(employee.updated_at)} />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function ProfileDetail({ icon: Icon, label, value }) {
  return (
    <div>
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span><small>{label}</small><b>{value}</b></span>
    </div>
  );
}


function normalizeEmployee(employee) {
  return {
    id: employee.id,
    name: employee.name || employee.full_name || "",
    email: employee.email || "",
    phone: employee.phone || "",
    role: employee.role || "company_member",
    status: employee.status || employee.account_status || "active",
    timezone: employee.timezone || "UTC",
    is_email_verified: Boolean(employee.is_email_verified ?? employee.email_verified ?? employee.email_verified_at),
    created_at: employee.created_at,
    updated_at: employee.updated_at,
    deleted_at: employee.deleted_at
  };
}

function getInitials(value) {
  return String(value || "User")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function getRoleClass(role) {
  if (role === "company_manager") return "manager";
  if (role === "company_member") return "member";
  return "admin";
}

function getStatusClass(status) {
  return String(status || "active").toLowerCase().replace(/\s+/g, "-");
}

function formatLabel(value) {
  return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
