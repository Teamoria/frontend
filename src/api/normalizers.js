export function getPayloadData(payload) {
  return payload?.data ?? payload;
}

export function cleanObject(body = {}) {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    })
  );
}

export function extractRows(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function extractPagination(data) {
  return data?.pagination || data?.meta || null;
}

export function normalizeCompanyBody(body = {}, { partial = false } = {}) {
  const cleanBody = cleanObject({
    name: body.name,
    industry: body.industry,
    website: body.website,
    address: body.address,
    logo_path: body.logo_path,
    status: body.status
  });

  if (!partial && !cleanBody.status) {
    cleanBody.status = "active";
  }

  return cleanBody;
}

export function normalizeStaffBody(body = {}, { partial = false } = {}) {
  const cleanBody = cleanObject({
    name: body.name,
    email: body.email,
    password: body.password,
    password_confirmation: body.password_confirmation,
    role: body.role,
    status: body.status
  });

  if (!partial && cleanBody.password && !cleanBody.password_confirmation) {
    cleanBody.password_confirmation = cleanBody.password;
  }

  return cleanBody;
}

export function normalizeCompanyProjectBody(body = {}) {
  return cleanObject({
    name: body.name,
    description: body.description,
    status: body.status,
    progress: body.progress,
    start_date: body.start_date,
    end_date: body.end_date
  });
}

export function normalizeTaskBody(body = {}, { partial = false } = {}) {
  const cleanBody = cleanObject({
    project_id: body.project_id,
    title: body.title,
    description: body.description,
    status: body.status,
    priority: body.priority,
    due_date: body.due_date,
    assignee_ids: Array.isArray(body.assignee_ids) ? body.assignee_ids.filter(Boolean) : body.assignee_ids,
    dependency_ids: Array.isArray(body.dependency_ids) ? body.dependency_ids.filter(Boolean) : body.dependency_ids
  });

  if (!partial) {
    cleanBody.status = cleanBody.status || "todo";
    cleanBody.priority = cleanBody.priority || "medium";
  }

  return cleanBody;
}

export function normalizePlanBody(body = {}) {
  return cleanObject({
    name: body.name,
    description: body.description,
    price_monthly: body.price_monthly,
    price_yearly: body.price_yearly,
    max_projects: body.max_projects,
    max_members: body.max_members,
    max_storage_mb: body.max_storage_mb,
    has_ai_features: body.has_ai_features
  });
}
