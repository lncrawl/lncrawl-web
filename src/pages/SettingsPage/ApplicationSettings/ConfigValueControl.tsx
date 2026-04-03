import type { ConfigProperty } from '@/types';
import { Input, InputNumber, Switch } from 'antd';

export const ConfigValueControl: React.FC<{
  config: ConfigProperty;
  value: unknown;
  saving: boolean;
  onValueChange: (next: unknown) => void;
}> = ({ config: c, value: v, saving, onValueChange }) => {
  if (c.sensitive) {
    return (
      <Input.Password
        name={c.key}
        visibilityToggle
        disabled={saving}
        autoComplete="new-password"
        value={String(v || '')}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={String(c.value || 'Enter secret string')}
      />
    );
  }

  if (c.value_kind === 'boolean') {
    return (
      <Switch
        disabled={saving}
        checked={Boolean(v)}
        onChange={(checked) => onValueChange(checked)}
      />
    );
  }

  if (c.value_kind === 'number') {
    return (
      <InputNumber
        name={c.key}
        disabled={saving}
        autoComplete="off"
        value={typeof v === 'number' ? v : v ? Number(v) : null}
        onChange={(n) => onValueChange(n ?? null)}
        placeholder="Enter a number"
        style={{ width: '100%', maxWidth: 360 }}
      />
    );
  }

  if (c.value_kind === 'string') {
    return (
      <Input
        name={c.key}
        disabled={saving}
        autoComplete="off"
        value={String(v || '')}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Enter a string"
      />
    );
  }

  const str = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
  return (
    <Input.TextArea
      name={c.key}
      disabled={saving}
      autoComplete="off"
      value={str}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder="Enter any text value"
      autoSize={{ minRows: 3, maxRows: 14 }}
      style={{
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        fontSize: 12,
      }}
    />
  );
};
