import type { ConfigSection, ConfigUpdateRequest } from '@/types';
import { stringifyError } from '@/utils/errors';
import {
  Button,
  Col,
  Collapse,
  Flex,
  Grid,
  message,
  Row,
  Space,
  Typography,
} from 'antd';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import styles from './ApplicationSettings.module.scss';
import { ConfigPropertyRow } from './ConfigPropertyRow';
import {
  hasChange,
  normalizeConfigValue,
  rowKey,
  showConfigRowSeparator,
} from './helpers';

export const SectionEditor: React.FC<{
  sections: ConfigSection[];
  onReload: () => any;
}> = ({ sections, onReload }) => {
  const screens = Grid.useBreakpoint();
  const [messageApi, contextHolder] = message.useMessage();

  const [saving, setSaving] = useState(false);
  const [activeKey, setActiveKey] = useState(sections[0].key);
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const values: Record<string, any> = {};
    for (const section of sections) {
      for (const config of section.properties) {
        const k = rowKey(section, config);
        values[k] = config.sensitive ? '' : config.value;
      }
    }
    setValues(values);
  }, [sections]);

  const changeCount = useMemo(() => {
    const changes: Record<string, number> = {};
    for (const section of sections) {
      changes[section.key] = 0;
      for (const config of section.properties) {
        const k = rowKey(section, config);
        if (hasChange(config, values[k])) {
          changes[section.key]++;
        }
      }
    }
    return changes;
  }, [sections, values]);

  const hasChanges = useMemo(
    () => Object.values(changeCount).some((x) => x > 0),
    [changeCount]
  );

  const saveAll = async () => {
    if (!hasChanges) return;
    const updates: ConfigUpdateRequest[] = [];
    for (const section of sections) {
      for (const config of section.properties) {
        const k = rowKey(section, config);
        if (!hasChange(config, values[k])) {
          continue;
        }
        const parsed = normalizeConfigValue(config, values[k]);
        if (!parsed.ok) {
          messageApi.warning(`${k}: ${parsed.message}`);
          return;
        }
        updates.push({
          section: section.key,
          key: config.key,
          value: parsed.value,
        });
      }
    }
    try {
      setSaving(true);
      await axios.patch('/api/admin/configs', updates);
      messageApi.success('Saved all changes');
      onReload();
    } catch (err) {
      messageApi.error(stringifyError(err, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Flex vertical gap={16}>
      {contextHolder}

      <Collapse
        accordion
        bordered={false}
        expandIconPlacement="end"
        className={styles.sectionAccordion}
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key[0])}
        items={sections.map((section) => ({
          key: section.key,
          label: (
            <Space title={section.description}>
              <Typography.Text strong type="success">
                {section.display_name}
              </Typography.Text>
              {changeCount[section.key] > 0 && (
                <Typography.Text type="secondary">
                  ({changeCount[section.key]} update
                  {changeCount[section.key] !== 1 && 's'})
                </Typography.Text>
              )}
            </Space>
          ),
          children: (
            <Row gutter={[20, 24]} className={styles.propertiesRow}>
              {section.properties.map((config, index) => {
                const k = rowKey(section, config);
                return (
                  <Col key={k} xs={24} xl={12}>
                    <ConfigPropertyRow
                      config={config}
                      saving={saving}
                      value={values[k]}
                      onValueChange={(next) => {
                        setValues((prev) => ({ ...prev, [k]: next }));
                      }}
                      showSeparator={showConfigRowSeparator(
                        index,
                        section.properties.length,
                        Boolean(screens.xl)
                      )}
                    />
                  </Col>
                );
              })}
            </Row>
          ),
        }))}
      />

      <Flex align="flex-start" justify="space-between" gap={12} wrap="wrap">
        <Typography.Text type="secondary" style={{ fontSize: 12, flex: 1 }}>
          Changes are written to the server configuration file when you save.
          Some options may require a restart to take effect.
        </Typography.Text>
        <Flex gap={8} wrap="wrap" style={{ flexShrink: 0 }}>
          <Button onClick={onReload} disabled={!hasChanges || saving}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={saving}
            disabled={!hasChanges || saving}
            onClick={() => void saveAll()}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
