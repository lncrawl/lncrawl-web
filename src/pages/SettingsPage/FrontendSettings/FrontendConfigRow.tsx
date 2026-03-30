import { Auth } from '@/store/_auth';
import type { ConfigState } from '@/store/_config';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { Col, Grid, Row } from 'antd';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FrontendConfigSection } from './FrontendConfigSection';
import { FrontendNumberInput } from './FrontendNumberInput';

export type FrontendConfigItem = {
  key: string;
  label: string;
  description: string;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  get: (s: ConfigState) => number;
  set: ActionCreatorWithPayload<number, string>;
  access?: (isLocal: boolean, isAdmin: boolean) => boolean;
};

export const FrontendConfigRow: React.FC<{
  rows: FrontendConfigItem[];
  state: ConfigState;
  screens: ReturnType<typeof Grid.useBreakpoint>;
}> = ({ rows, state, screens }) => {
  const dispatch = useDispatch();
  const isLocal = useSelector(Auth.select.isLocal);
  const isAdmin = useSelector(Auth.select.isAdmin);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => row.access?.(!!isLocal, !!isAdmin) ?? true);
  }, [rows, isLocal, isAdmin]);

  return (
    <Row gutter={[20, 24]} style={{ width: '100%' }}>
      {filteredRows.map((row, index) => (
        <Col key={row.key} xs={24} xl={12}>
          <FrontendConfigSection
            label={row.label}
            description={row.description}
            showSeparator={index >= (screens.xl ? 2 : 1)}
          >
            <FrontendNumberInput
              value={row.get(state)}
              onChange={(v) => v != null && dispatch(row.set(v))}
              min={row.min}
              max={row.max}
              step={row.step}
              suffix={row.suffix}
            />
          </FrontendConfigSection>
        </Col>
      ))}
    </Row>
  );
};
