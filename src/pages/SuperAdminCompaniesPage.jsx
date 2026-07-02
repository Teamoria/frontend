import { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiEdit2,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX
} from "react-icons/fi";
import { SuperAdminShell } from "./SuperAdminConsolePage.jsx";
import {
  createCompany,
  deleteCompany,
  listCompanies,
  restoreCompany,
  updateCompany
} from "../lib/api.js";
import "../styles/super-admin-console.css";

const emptyCompanyForm = {
  name: "",
  industry: "",
  website: "",
  address: "",
  logo_path: "",
  status: "active"
};

const companyStatuses = ["active", "inactive", "suspended"];

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [archived, setArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [formState, setFormState] = useState({ open: false, mode: "create", company: null });

  const filteredCompanies = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return companies;

    return companies.filter((company) => {
      return [company.name, company.industry, company.website, company.address, company.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(cleanQuery));
    });
  }, [companies, query]);

  async function loadCompanies(nextPage = page, nextArchived = archived) {
    setStatus({ loading: true, error: "" });
    try {
      const payload = await listCompanies({ page: nextPage, archived: nextArchived });
      setCompanies(payload?.data?.companies || []);
      setPagination(payload?.data?.pagination || {});
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  useEffect(() => {
    loadCompanies(page, archived);
  }, [page, archived]);

  function handleArchivedChange(event) {
    setPage(1);
    setArchived(event.target.checked);
  }

  async function handleDelete(companyId) {
    if (!window.confirm("Delete this company?")) return;
    await deleteCompany(companyId);
    loadCompanies();
  }

  async function handleRestore(companyId) {
    await restoreCompany(companyId);
    loadCompanies();
  }

  const total = pagination.total ?? companies.length;
  const companyMetrics = [
    { label: "Total Companies", value: formatNumber(total), detail: "From API pagination", icon: FiBriefcase, tone: "primary" },
    { label: "Active Companies", value: formatNumber(companies.filter((company) => company.status === "active").length), detail: "Current page", icon: FiCheckCircle, tone: "alert" },
    { label: "Loaded Rows", value: formatNumber(companies.length), detail: archived ? "Archived view" : "Active view", icon: FiUsers, tone: "secondary" },
    { label: "Dashboard Stats", value: "Partial", detail: "Counts only until stats API exists", icon: FiBriefcase, tone: "neutral" }
  ];

  return (
    <SuperAdminShell active="Companies Management">
      <div className="super-admin-page">
        <header className="super-admin-heading super-admin-heading--management">
          <div>
            <span className="super-admin-kicker">Admin</span>
            <h1>Companies Management</h1>
            <p>Manage tenant companies, status, web presence, and archived records across Teamoria.</p>
          </div>
          <div className="super-admin-action-row">
            <label className="super-admin-archive-toggle">
              <input checked={archived} onChange={handleArchivedChange} type="checkbox" />
              <span>Archived</span>
            </label>
            <button className="super-admin-primary-action" type="button" onClick={() => setFormState({ open: true, mode: "create", company: null })}>
              <FiPlus aria-hidden="true" />
              <span>Add Company</span>
            </button>
          </div>
        </header>

        <section className="super-admin-metrics" aria-label="Company management metrics">
          {companyMetrics.map((metric) => (
            <CompanyMetric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="super-admin-panel super-admin-companies-panel">
          <div className="super-admin-management-toolbar">
            <label className="super-admin-management-search">
              <FiSearch aria-hidden="true" />
              <input onChange={(event) => setQuery(event.target.value)} placeholder="Search companies, industries, websites..." value={query} />
            </label>
            <div className="super-admin-management-controls">
              <button type="button" onClick={() => loadCompanies()}>
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
          {status.loading ? <p className="super-admin-state">Loading companies...</p> : null}

          <div className="super-admin-table-wrap">
            <div className="container--scroll-x">
              <table className="super-admin-management-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Address</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {!status.loading && filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="8">No companies found.</td>
                    </tr>
                  ) : null}
                  {filteredCompanies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <span className="super-admin-company-code tone-primary">{getInitials(company.name)}</span>
                        <b>{company.name || "Unnamed company"}</b>
                      </td>
                      <td>{company.industry || "-"}</td>
                      <td>{company.website ? <a href={company.website} rel="noreferrer" target="_blank">{company.website}</a> : "-"}</td>
                      <td>
                        <span className={`super-admin-status ${company.status === "active" ? "active" : ""} ${company.status === "suspended" ? "suspended" : ""}`}>
                          <i />
                          {formatLabel(company.status)}
                        </span>
                      </td>
                      <td>{company.address || "-"}</td>
                      <td>{formatDate(company.created_at)}</td>
                      <td>{formatDate(company.updated_at)}</td>
                      <td>
                        <div className="super-admin-row-actions">
                          <button type="button" title="Edit company" onClick={() => setFormState({ open: true, mode: "edit", company })}>
                            <FiEdit2 aria-hidden="true" />
                          </button>
                          {archived ? (
                            <button type="button" title="Restore company" onClick={() => handleRestore(company.id)}>
                              <FiRefreshCw aria-hidden="true" />
                            </button>
                          ) : (
                            <button type="button" title="Delete company" onClick={() => handleDelete(company.id)}>
                              <FiTrash2 aria-hidden="true" />
                            </button>
                          )}
                          <button type="button" aria-label={`Open actions for ${company.name}`}>
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

          <Pagination pagination={pagination} page={page} setPage={setPage} totalLabel="companies" />
        </section>
      </div>
      {formState.open ? (
        <CompanyModal
          company={formState.company}
          mode={formState.mode}
          onClose={() => setFormState({ open: false, mode: "create", company: null })}
          onSaved={() => {
            setFormState({ open: false, mode: "create", company: null });
            loadCompanies();
          }}
        />
      ) : null}
    </SuperAdminShell>
  );
}

function CompanyModal({ company, mode, onClose, onSaved }) {
  const [form, setForm] = useState(() => companyToForm(company));
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
        await updateCompany(company.id, cleanBody(form));
      } else {
        await createCompany(cleanBody(form));
      }
      onSaved();
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <div className="super-admin-modal-layer" role="presentation">
      <button className="super-admin-modal-backdrop" type="button" aria-label="Close company modal" onClick={onClose} />
      <section className="super-admin-add-user-modal super-admin-register-company-modal" role="dialog" aria-modal="true" aria-labelledby="company-modal-title">
        <header>
          <h2 id="company-modal-title">{isEdit ? "Edit Company" : "Register New Company"}</h2>
          <button type="button" aria-label="Close company modal" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          {status.error ? <p className="super-admin-state super-admin-state--error">{status.error}</p> : null}
          <div className="super-admin-modal-field">
            <label htmlFor="company-name">Company Name</label>
            <input id="company-name" required value={form.name} onChange={(event) => updateField("name", event.target.value)} type="text" />
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="company-industry">Industry</label>
            <input id="company-industry" value={form.industry} onChange={(event) => updateField("industry", event.target.value)} type="text" />
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="company-website">Website</label>
            <input id="company-website" value={form.website} onChange={(event) => updateField("website", event.target.value)} placeholder="https://example.com" type="url" />
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="company-address">Address</label>
            <input id="company-address" value={form.address} onChange={(event) => updateField("address", event.target.value)} type="text" />
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="company-logo">Company Logo Path</label>
            <input id="company-logo" value={form.logo_path} onChange={(event) => updateField("logo_path", event.target.value)} type="text" />
          </div>
          <div className="super-admin-modal-field">
            <label htmlFor="company-status">Status</label>
            <select id="company-status" required value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              {companyStatuses.map((item) => <option value={item} key={item}>{formatLabel(item)}</option>)}
            </select>
          </div>

          <footer>
            <button className="super-admin-modal-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="super-admin-modal-submit" disabled={status.loading} type="submit">
              {status.loading ? "Saving..." : isEdit ? "Save Changes" : "Register Company"}
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

function CompanyMetric({ detail, icon: Icon, label, tone, value }) {
  return (
    <article className={`super-admin-metric tone-${tone}`}>
      <div className="super-admin-metric-head">
        <span>
          <Icon aria-hidden="true" />
        </span>
        <em>
          <FiCheckCircle aria-hidden="true" />
        </em>
      </div>
      <p>{label}</p>
      <div className="super-admin-metric-value">
        <strong>{value}</strong>
      </div>
      <small>{detail}</small>
    </article>
  );
}

function companyToForm(company) {
  if (!company) return emptyCompanyForm;

  return {
    name: company.name || "",
    industry: company.industry || "",
    website: company.website || "",
    address: company.address || "",
    logo_path: company.logo_path || "",
    status: company.status || "active"
  };
}

function cleanBody(body) {
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== ""));
}

function getInitials(value) {
  return String(value || "Company")
    .split(/\s/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CO";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatLabel(value) {
  if (!value) return "-";
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}
