import { AxiosError } from 'axios';

export function stringifyError(
  err: any,
  _default: string = 'Oops! Something went wrong.'
) {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (data?.name === 'ER_DUP_ENTRY') {
      return 'Duplicate entry';
    }
    if (data?.error && typeof data?.error === 'string') {
      return data.error;
    }
    if (data?.detail && typeof data?.detail === 'string') {
      return data.detail;
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      return 'Not authorized';
    }
  } else if (err instanceof Error) {
    return `${err.name}: ${err.message}\n${err.stack}`;
  } else if (typeof err === 'object') {
    try {
      return JSON.stringify(err);
    } catch {}
  }

  return _default || String(err);
}
