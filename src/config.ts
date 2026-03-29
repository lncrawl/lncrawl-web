/** Dev server default; override with `VITE_API_BASE_URL` in `.env.development.local`. */
const DEV_DEFAULT_API = 'http://localhost:8080';

export const API_BASE_URL = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? DEV_DEFAULT_API);
