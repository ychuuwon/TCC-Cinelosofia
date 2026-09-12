const configuredApiUrl = process.env.REACT_APP_API_URL;
const isLocalFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const isLocalApi = !configuredApiUrl || /:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(configuredApiUrl);
const apiUrl = configuredApiUrl && (isLocalFrontend || !isLocalApi)
	? configuredApiUrl
	: (isLocalFrontend ? 'http://localhost:7777' : window.location.origin);
const normalizedApiUrl = apiUrl.replace(/\/$/, '');
const API_BASE = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

export default API_BASE;

export async function fetchWithTimeout(input, options = {}, timeoutMs = 20000) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(input, { ...options, signal: controller.signal });
	} finally {
		clearTimeout(timeout);
	}
}
