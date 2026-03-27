import { stringifyError } from '@/utils/errors';
import { XFilled } from '@ant-design/icons';
import { Button, message } from 'antd';
import axios from 'axios';
import { useState } from 'react';

export const StopRunnerButton: React.FC<{
  onComplete: () => void | Promise<void>;
}> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await axios.post('/api/admin/runner/stop');
      message.success('Runner stopped');
      await onComplete();
    } catch (err) {
      message.error(stringifyError(err, 'Failed to stop runner'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button danger loading={loading} onClick={() => void handleClick()} icon={<XFilled />}>
      Stop runner
    </Button>
  );
};
