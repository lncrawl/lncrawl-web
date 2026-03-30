import type { ConfigState } from '@/store/_config';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';

export interface FrontendConfigItemBase {
  key: string;
  label: string;
  description: string;
  access?: (isLocal: boolean, isAdmin: boolean) => boolean;
}

export interface FrontendBooleanConfigItem extends FrontendConfigItemBase {
  kind: 'boolean';
  get: (s: ConfigState) => boolean;
  set: ActionCreatorWithPayload<boolean, string>;
}

export interface FrontendNumberConfigItem extends FrontendConfigItemBase {
  kind: 'number';
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  get: (s: ConfigState) => number;
  set: ActionCreatorWithPayload<number, string>;
}

export type FrontendConfigItem =
  | FrontendNumberConfigItem
  | FrontendBooleanConfigItem;

export function isBooleanItem(
  row: FrontendConfigItem
): row is FrontendBooleanConfigItem {
  return 'kind' in row && row.kind === 'boolean';
}

export function isNumberItem(
  row: FrontendConfigItem
): row is FrontendNumberConfigItem {
  return 'kind' in row && row.kind === 'number';
}
