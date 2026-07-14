import { useState } from "react";
import { createStaffMember, getPayloadData } from "../../../lib/api.js";
import { isDemoMode } from "../../../lib/demoMode.js";
import { Button, Field } from "../../ui.jsx";
import { localizedStaffStatus, roleText, staffRoleOptions, staffStatusOptions } from "./staffHelpers.js";

export default function StaffCreateForm({ copy, language, onCancel, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "company_member",
    status: "active"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError(copy.name);
      return;
    }
    if (!form.email.trim()) {
      setError(copy.email);
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError(copy.password);
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        status: form.status
      };
      const payload = isDemoMode() ? { data: { id: `demo-staff-${Date.now()}`, ...body } } : await createStaffMember(body);
      const data = getPayloadData(payload);
      onSaved(data?.staff || data?.user || data);
    } catch (requestError) {
      setError(requestError?.message || copy.failedSave);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="t2-create-form" onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <Field label={copy.name} required><input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
      <Field label={copy.email} required><input autoComplete="email" inputMode="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
      <Field label={copy.password} required><input autoComplete="new-password" minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
      <Field label={copy.role}>
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          {staffRoleOptions().map((role) => <option key={role} value={role}>{roleText(role, language)}</option>)}
        </select>
      </Field>
      <Field label={copy.status}>
        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          {staffStatusOptions().map((status) => <option key={status} value={status}>{localizedStaffStatus(copy, status)}</option>)}
        </select>
      </Field>
      <div className="t2-modal-actions"><Button onClick={onCancel} tone="secondary">{copy.cancel}</Button><Button loading={loading} loadingLabel={copy.loading} type="submit">{copy.create}</Button></div>
    </form>
  );
}
