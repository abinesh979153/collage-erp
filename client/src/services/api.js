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
    const error = new Error(
      data.message || data.error?.message || `Request failed (${res.status})`
    );
    error.status = res.status;
    throw error;
  }

  if (blob) return res.blob();
  return res.status === 204 ? null : res.json();
}
