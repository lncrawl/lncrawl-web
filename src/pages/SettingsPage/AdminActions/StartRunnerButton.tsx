import { stringifyError } from '@/utils/errors';
import { PlayCircleFilled } from '@ant-design/icons';
import { Button, message } from 'antd';
import axios from 'axios';
import { useState } from 'react';

export const StartRunnerButton: React.FC<{
  onComplete: () => void | Promise<void>;
}> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await axios.post('/api/admin/runner/start');
      message.success('Runner started');
      await onComplete();
    } catch (err) {
      message.error(stringifyError(err, 'Failed to start runner'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      loading={loading}
      onClick={() => void handleClick()}
      icon={<PlayCircleFilled />}
    >
      Start runner
    </Button>
  );
};
