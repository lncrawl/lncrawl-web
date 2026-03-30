import type { Announcement } from '@/types';
import { stringifyError } from '@/utils/errors';
import { NotificationOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Select, Space, message } from 'antd';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { AnnouncementTypeLabels } from './utils';

const ALERT_TYPES = Object.entries(AnnouncementTypeLabels).map(
  ([value, label]) => ({ value, label })
);

export function useAnnouncementModal(
  onDone?: () => void
): [(editing?: Announcement) => void, React.ReactNode] {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement>();

  const openModal = useCallback(
    (editing?: Announcement) => {
      setEditing(editing);
      form.resetFields();
      setModalOpen(true);
    },
    [form]
  );

  const handleSubmit = async () => {
    let values: { title: string; message: string; type: string };
    try {
      values = await form.validateFields();
    } catch (err) {
      message.error(stringifyError(err, 'Failed to validate form'));
      return;
    }
    try {
      if (editing) {
        await axios.patch(`/api/announcement/${editing.id}`, values);
        message.success('Announcement updated');
      } else {
        await axios.post('/api/announcement', values);
        message.success('Announcement created');
      }
      setModalOpen(false);
      onDone?.();
    } catch (err) {
      message.error(stringifyError(err, 'Failed to save announcement'));
    }
  };

  const contextHolder = (
    <Modal
      width={560}
      destroyOnHidden
      open={modalOpen}
      onOk={handleSubmit}
      onCancel={() => setModalOpen(false)}
      okText={editing ? 'Update' : 'Create'}
      title={
        <Space>
          <NotificationOutlined />
          {editing ? 'Edit announcement' : 'New announcement'}
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        size="large"
        labelCol={{ style: { padding: 0 } }}
        initialValues={{
          title: editing?.title,
          message: editing?.message,
          type: editing?.type ?? 'info',
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Title is required' }]}
        >
          <Input
            placeholder="Short headline shown in the banner"
            maxLength={200}
            showCount
          />
        </Form.Item>
        <Form.Item
          name="message"
          label="Message"
          rules={[{ message: 'Message is required' }]}
        >
          <Input.TextArea
            rows={5}
            placeholder="Body text users see in the banner"
            maxLength={2000}
            showCount
          />
        </Form.Item>
        <Form.Item name="type" label="Banner style" initialValue="info">
          <Select options={ALERT_TYPES} />
        </Form.Item>
      </Form>
    </Modal>
  );

  return [openModal, contextHolder];
}
