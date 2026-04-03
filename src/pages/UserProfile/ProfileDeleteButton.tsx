import { Auth } from '@/store/_auth';
import { stringifyError } from '@/utils/errors';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Typography } from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const ProfileDeleteButton: React.FC = () => {
  const dispatch = useDispatch();
  const userId = useSelector(Auth.select.user)?.id;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete('/api/auth/me');
      if (userId) {
        dispatch(Auth.action.removeUserHistory(userId));
      }
      dispatch(Auth.action.logout());
      message.success('Your account has been deleted');
    } catch (err) {
      message.error(stringifyError(err));
      setDeleting(false);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <Popconfirm
        title="Delete account"
        description={
          <>
            <p>
              This will schedule your account for permanent deletion.{' '}
              <b>Are you sure you want to proceed?</b>
            </p>
            <Typography.Text type="secondary">
              If you change your mind within the next 30 days, you can contact
              lncrawl@pm.me to recover your account.
            </Typography.Text>
          </>
        }
        onConfirm={handleDelete}
        okText="Yes, delete my account"
        okType="danger"
        okButtonProps={{ loading: deleting }}
        cancelText="Cancel"
        disabled={deleting}
        styles={{ root: { maxWidth: 350 } }}
      >
        <Button
          block
          danger
          size="large"
          icon={<DeleteOutlined />}
          loading={deleting}
        >
          Delete my account
        </Button>
      </Popconfirm>
    </div>
  );
};
