import { InputNumber } from 'antd';

export const FrontendNumberInput: React.FC<{
  value: number;
  onChange: (n: number | null) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}> = ({ value, onChange, min, max, step = 1, suffix }) => {
  return (
    <InputNumber
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      controls
      changeOnWheel={false}
      style={{ width: '100%', maxWidth: 360 }}
      addonAfter={suffix}
    />
  );
};
