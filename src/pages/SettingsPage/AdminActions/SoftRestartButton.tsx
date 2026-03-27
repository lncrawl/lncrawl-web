import { stringifyError } from '@/utils/errors';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Typography } from 'antd';
import axios from 'axios';
import { useState } from 'react';

export const SoftRestartButton: React.FC<any> = () => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await axios.post('/api/admin/soft-restart');
      message.success('Soft restart completed');
      window.location.reload();
    } catch (err) {
      message.error(stringifyError(err, 'Soft restart failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space vertical>
      <Popconfirm
        title="Soft restart the server?"
        description="Reloads configuration and services in-process. Active connections may briefly fail."
        okText="Restart"
        cancelText="Cancel"
        onConfirm={() => void handleConfirm()}
      >
        <Button
          danger
          loading={loading}
          icon={<ReloadOutlined />}
          style={{ minWidth: 200 }}
        >
          Soft Restart
        </Button>
      </Popconfirm>

      <Typography.Text type="secondary">
        Soft restart reloads server configuration and services without fully
        shutting down the app.
      </Typography.Text>
    </Space>
  );
};
