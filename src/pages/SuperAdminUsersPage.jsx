import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiEye,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiX,
  FiZap
} from "react-icons/fi";
import { SuperAdminShell } from "./SuperAdminConsolePage.jsx";
import {
  createUser,
  deleteUser,
  listCompanies,
  listUsers,
  restoreUser,
  updateUser
} from "../lib/api.js";
import "../styles/super-admin-console.css";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "company_member",
  phone: "",
  status: "active",
  timezone: "Asia/Hebron",
  company_id: ""
};

const roleOptions = ["admin", "company_owner", "company_manager", "company_member"];
const statusOptions = ["pending", "active", "suspended", "inactive"];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [archived, setArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [formState, setFormState] = useState({ open: false, mode: "create", user: null });

  const filteredUsers = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return users;

    return users.filter((user) => {
      return [user.name, user.email, user.company?.name || user.company, user.role, user.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(cleanQuery));
    });
  }, [query, users]);

  async function loadUsers(nextPage = page, nextArchived = archived) {
    setStatus({ loading: true, error: "" });
    try {
      const payload = await listUsers({ page: nextPage, archived: nextArchived });
      setUsers(payload?.data?.users || []);
      setPagination(payload?.data?.pagination || {});
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  useEffect(() => {
    loadUsers(page, archived);
  }, [page, archived]);

  useEffect(() => {
    let ignore = false;

    listCompanies()
      .then((payload) => {
        if (!ignore) {
          setCompanies(payload?.data?.companies || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCompanies([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  function handleArchivedChange(event) {
    setPage(1);
    setArchived(event.target.checked);
  }

  async function handleDelete(userId) {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(userId);
    loadUsers();
  }

  async function handleRestore(userId) {
    await restoreUser(userId);
    loadUsers();
  }

  const total = pagination.total ?? users.length;
  const userMetrics = [
    { label: "Total Users", value: formatNumber(total), detail: "From API pagination", icon: FiUsers, tone: "primary" },
    { label: "Loaded Rows", value: formatNumber(users.length), detail: archived ? "Archived view" : "Active view", icon: FiZap, tone: "secondary" },
    { label: "Active Users", value: formatNumber(users.filter((user) => user.status === "active").length), detail: "Current page", icon: FiUserPlus, tone: "neutral" },
    { label: "Verified Users", value: "Placeholder", detail: "Waiting for backend field", icon: FiUserCheck, tone: "alert" }
  ];

  return (
    <SuperAdminShell active="User Management">
      <div className="super-admin-page">
        <header className="super-admin-heading super-admin-heading--management">
          <div>
            <span className="super-admin-kicker">Admin</span>
            <h1>User Management</h1>
            <p>Manage user accounts across Teamoria with role, company, and account-status controls.</p>
          </div>
          <div className="super-admin-action-row">
            <label className="super-admin-archive-toggle">
              <input checked={archived} onChange={handleArchivedChange} type="checkbox" />
              <span>Archived</span>
            </label>
            <button className="super-admin-primary-action" type="button" onClick={() => setFormState({ open: true, mode: "create", user: null })}>
              <FiPlus aria-hidden="true" />
              <span>Create User</span>
            </button>
          </div>
        </header>

        <section className="super-admin-metrics" aria-label="User management metrics">
          {userMetrics.map((metric) => (
            <UserMetric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="super-admin-panel super-admin-users-panel">
          <div className="super-admin-management-toolbar super-admin-user-filters">
            <label className="super-admin-management-search">
              <FiSearch aria-hidden="true" />
              <input onChange={(event) => setQuery(event.target.value)} placeholder="Search users by name or email..." value={query} />
            </label>
            <div className="super-admin-management-controls">
              <button type="button" onClick={() => loadUsers()}>
                <FiRefreshCw aria-hidden="true" />
                <span>Refresh</span>
              </button>
              <button type="button">
                <FiFilter aria-hidden="true" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {status.error ? <p className="super-admin-state super-admin-state--error">{status.error}</p> : null}
          {status.loading ? <p className="super-admin-state">Loading users...</p> : null}

          <div className="super-admin-table-wrap">
            <div className="container--scroll-x">
              <table className="super-admin-management-table super-admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {!status.loading && filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6">No users found.</td>
                    </tr>
                  ) : null}
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className="super-admin-user-avatar tone-primary">{getInitials(user.name || user.email)}</span>
                        <span className="super-admin-user-cell">
                          <b>{user.name || "Unnamed user"}</b>
                          <small>{user.email}</small>
                        </span>
                      </td>
                      <td>{user.company?.name || user.company || "-"}</td>
                      <td>
                        <span className={`super-admin-role-pill tone-${roleTone(user.role)}`}>{formatLabel(user.role)}</span>
                      </td>
                      <td>
                        <span className={`super-admin-status ${user.status === "active" ? "active" : ""} ${user.status === "suspended" ? "suspended" : ""}`}>
                          <i />
                          {formatLabel(user.status)}
                        </span>
                      </td>
                      <td>{formatDate(user.last_login_at)}</td>
                      <td>
                        <div className="super-admin-row-actions">
                          <button type="button" title="Edit user" onClick={() => setFormState({ open: true, mode: "edit", user })}>
                            <FiEdit2 aria-hidden="true" />
                          </button>
                          {archived ? (
                            <button type="button" title="Restore user" onClick={() => handleRestore(user.id)}>
                              <FiRefreshCw aria-hidden="true" />
                            </button>
                          ) : (
                            <button type="button" title="Delete user" onClick={() => handleDelete(user.id)}>
                              <FiTrash2 aria-hidden="true" />
                            </button>
                          )}
                          <button type="button" aria-label={`Open actions for ${user.name || user.email}`}>
                            <FiMoreVertical aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination pagination={pagination} page={page} setPage={setPage} totalLabel="users" />
        </section>
      </div>
      {formState.open ? (
        <UserModal
          companies={companies}
          mode={formState.mode}
          onClose={() => setFormState({ open: false, mode: "create", user: null })}
          onSaved={() => {
            setFormState({ open: false, mode: "create", user: null });
            loadUsers();
          }}
          user={formState.user}
        />
      ) : null}
    </SuperAdminShell>
  );
}

function UserModal({ companies, mode, onClose, onSaved, user }) {
  const [form, setForm] = useState(() => userToForm(user));
  const [status, setStatus] = useState({ loading: false, error: "" });
  const isEdit = mode === "edit";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      if (isEdit) {
        const { password, password_confirmation, ...body } = form;
        await updateUser(user.id, cleanBody(body));
      } else {
        await createUser(cleanBody(form));
      }
      onSaved();
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <div className="super-admin-modal-layer" role="presentation">
      <button className="super-admin-modal-backdrop" type="button" aria-label="Close user modal" onClick={onClose} />
      <section className="super-admin-add-user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
        <header>
          <h2 id="user-modal-title">{isEdit ? "Edit User" : "Add New User"}</h2>
          <button type="button" aria-label="Close user modal" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          {status.error ? <p className="super-admin-state super-admin-state--error">{status.error}</p> : null}
          <div className="super-admin-modal-field">
            <label htmlFor="user-name">Full Name</label>
            <input id="user-name" required value={form.name} onChange={(event) => updateField("name", event.target.value)} type="text" />
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="user-email">Email Address</label>
            <input id="user-email" required value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" />
          </div>
          {!isEdit ? (
            <>
              <div className="super-admin-modal-field">
                <label htmlFor="user-password">Password</label>
                <div className="super-admin-password-field">
                  <input id="user-password" required value={form.password} onChange={(event) => {
                    updateField("password", event.target.value);
                    updateField("password_confirmation", event.target.value);
                  }} type="password" />
                  <button type="button" aria-label="Password field">
                    <FiEye aria-hidden="true" />
                  </button>
                </div>
              </div>
            </>
          ) : null}
          <div className="super-admin-modal-field">
            <label htmlFor="user-company">Company</label>
            <select id="user-company" value={form.company_id} onChange={(event) => updateField("company_id", event.target.value)}>
              <option value="">No company</option>
              {companies.map((company) => (
                <option value={company.id} key={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="user-role">Role</label>
            <select id="user-role" required value={form.role} onChange={(event) => updateField("role", event.target.value)}>
              {roleOptions.map((role) => <option value={role} key={role}>{formatLabel(role)}</option>)}
            </select>
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="user-status">Status</label>
            <select id="user-status" required value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              {statusOptions.map((item) => <option value={item} key={item}>{formatLabel(item)}</option>)}
            </select>
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="user-phone">Phone</label>
            <input id="user-phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} type="tel" />
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="user-timezone">Timezone</label>
            <input id="user-timezone" value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)} type="text" />
          </div>

          <footer>
            <button className="super-admin-modal-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="super-admin-modal-submit" disabled={status.loading} type="submit">
              {status.loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Pagination({ page, pagination, setPage, totalLabel }) {
  const lastPage = pagination.last_page || pagination.total_pages || pagination.pages || 1;
  const total = pagination.total || 0;

  return (
    <footer className="super-admin-pagination">
      <p>Showing page {page} of {lastPage} for {formatNumber(total)} {totalLabel}</p>
      <nav aria-label={`${totalLabel} pagination`}>
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</button>
        <button className="active" type="button">{page}</button>
        <button type="button" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)}>Next</button>
      </nav>
    </footer>
  );
}

function UserMetric({ detail, icon: Icon, label, tone, value }) {
  return (
    <article className={`super-admin-metric tone-${tone}`}>
      <div className="super-admin-metric-head">
        <span>
          <Icon aria-hidden="true" />
        </span>
      </div>
      <p>{label}</p>
      <div className="super-admin-metric-value">
        <strong>{value}</strong>
      </div>
      <small>{detail}</small>
    </article>
  );
}

function userToForm(user) {
  if (!user) return emptyForm;

  return {
    ...emptyForm,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "company_member",
    phone: user.phone || "",
    status: user.status || "active",
    timezone: user.timezone || "Asia/Hebron",
    company_id: user.company_id || user.company?.id || ""
  };
}

function cleanBody(body) {
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== ""));
}

function getInitials(value) {
  return String(value)
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatLabel(value) {
  if (!value) return "-";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function roleTone(role) {
  if (role === "admin" || role === "company_owner") return "admin";
  if (role === "company_manager") return "manager";
  return "employee";
}
