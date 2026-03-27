import type { ConfigProperty, ConfigSection } from '@/types';
import { isEqual } from 'lodash';

export function rowKey(
  section: ConfigSection,
  property: ConfigProperty
): string {
  return `${section.key}.${property.key}`;
}

export function hasChange(config: ConfigProperty, value: any): boolean {
  if (config.sensitive) {
    return String(value).length > 0;
  }
  return !isEqual(config.value, value);
}

export function normalizeConfigValue(c: ConfigProperty, raw: unknown) {
  if (c.value_kind === 'boolean') {
    return { ok: true, value: Boolean(raw) };
  }
  if (c.value_kind === 'number') {
    if (raw === null || raw === undefined || raw === '') {
      return { ok: false, message: 'Enter a valid number' };
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      return { ok: false, message: 'Enter a valid number' };
    }
    return { ok: true, value: Math.trunc(num) };
  }
  if (
    c.value_kind === 'any' &&
    typeof c.value === 'object' &&
    c.value !== null
  ) {
    if (typeof raw !== 'string') {
      return { ok: false, message: 'Invalid value' };
    }
    try {
      return { ok: true, value: JSON.parse(raw) as unknown };
    } catch {
      return { ok: false, message: 'Value must be valid JSON' };
    }
  }
  return { ok: true, value: raw };
}
