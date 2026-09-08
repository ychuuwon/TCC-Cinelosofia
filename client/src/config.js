const configuredApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:7777';
const normalizedApiUrl = configuredApiUrl.replace(/\/$/, '');
const API_BASE = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

export default API_BASE;
