const BASE = '/api';

export async function api(path, { method = 'GET', body, params, blob } = {}) {
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    : '';

  let res;

  try {
    res = await fetch(BASE + path + qs, {
      method,
      credentials: 'include',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(localStorage.getItem('accessToken')
          ? { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }
          : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      data.message || data.error?.message || `Request failed (${res.status})`;
    const details = data.error?.details;
    const detailMessage = Array.isArray(details)
      ? details.map(item => `${item.path || 'field'}: ${item.message}`).join('; ')
      : '';
    const error = new Error(
      detailMessage ? `${message} — ${detailMessage}` : message
    );
    error.status = res.status;
    error.details = details;
    throw error;
  }

  if (blob) return res.blob();
  return res.status === 204 ? null : res.json();
}
