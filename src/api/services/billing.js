import { apiRequest } from "../http.js";
import { cleanObject, normalizePlanBody } from "../normalizers.js";

export function listBillingPlans() {
  return apiRequest("/billing/plans", { auth: true });
}

export function getCompanySubscription() {
  return apiRequest("/company/subscription", { auth: true });
}

export function subscribeToPlan({ plan_id, billing_cycle, reference_number }) {
  return apiRequest("/company/subscription", {
    method: "POST",
    auth: true,
    body: cleanObject({ plan_id, billing_cycle, reference_number })
  });
}

export function listAdminPlans({ page } = {}) {
  return apiRequest("/admin/plans", { auth: true, query: { page } });
}

export function createAdminPlan(body) {
  return apiRequest("/admin/plans", {
    method: "POST",
    auth: true,
    body: normalizePlanBody(body)
  });
}

export function getAdminPlan(planId) {
  return apiRequest(`/admin/plans/${planId}`, { auth: true });
}

export function updateAdminPlan(planId, body, { method = "PUT" } = {}) {
  return apiRequest(`/admin/plans/${planId}`, {
    method,
    auth: true,
    body: normalizePlanBody(body)
  });
}

export function patchAdminPlan(planId, body) {
  return updateAdminPlan(planId, body, { method: "PATCH" });
}

export function deleteAdminPlan(planId) {
  return apiRequest(`/admin/plans/${planId}`, { method: "DELETE", auth: true });
}

export function listAdminSubscriptions({ status, per_page, page } = {}) {
  return apiRequest("/admin/subscriptions", {
    auth: true,
    query: { status, per_page, page }
  });
}

export function cancelAdminSubscription(subscriptionId) {
  return apiRequest(`/admin/subscriptions/${subscriptionId}/cancel`, { method: "PATCH", auth: true });
}

export function listAdminPayments() {
  return apiRequest("/admin/payments", { auth: true });
}

export function confirmAdminPayment(paymentId) {
  return apiRequest(`/admin/payments/${paymentId}/confirm`, { method: "PATCH", auth: true });
}
