import { Auth } from '@/store/_auth';
import { OutputFormat, type Job } from '@/types';
import { stringifyError } from '@/utils/errors';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Modal, Row, Typography, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const MakeArtifactButton: React.FC<{
  novelId: string;
}> = ({ novelId }) => {
  const navigate = useNavigate();
  const authUser = useSelector(Auth.select.user);
  const [messageApi, contextHolder] = message.useMessage();

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<OutputFormat[]>([]);

  const [changing, setChanging] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleSelected = (value: string) => {
    setSelected((p) => ({ ...p, [value]: !p[value] }));
  };

  useEffect(() => {
    const getEnabledFormats = async () => {
      setLoading(true);
      try {
        const result = await axios.get<string[]>(
          '/api/artifact/enabled-formats'
        );
        setOptions(result.data);
      } catch (err) {
        setOptions([OutputFormat.epub]);
      } finally {
        setLoading(false);
      }
    };
    getEnabledFormats();
  }, [authUser?.id]);

  const handleMakeArtifact = async (formats: OutputFormat[]) => {
    if (!formats.length) {
      return messageApi.warning('Please select at least one format');
    }
    try {
      setChanging(true);
      const result = await axios.post<Job>('/api/job/create/make-artifacts', {
        novel_id: novelId,
        formats,
      });
      setOpen(false);
      navigate(`/job/${result.data.id}`);
    } catch (err) {
      console.error(err);
      messageApi.error(stringifyError(err));
    } finally {
      setChanging(false);
    }
  };

  const handleOpenModal = () => {
    if (loading) return;
    if (options.length === 1) {
      handleMakeArtifact(options);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      {contextHolder}

      <Button
        shape="round"
        loading={loading}
        icon={<AppstoreAddOutlined />}
        onClick={handleOpenModal}
        disabled={loading || options.length === 0}
      >
        Make Artifact
      </Button>

      <Modal
        width={400}
        open={open}
        destroyOnHidden
        loading={changing}
        okText="Create"
        onOk={() =>
          handleMakeArtifact(Object.keys(selected).filter((v) => selected[v]))
        }
        onCancel={() => setOpen(false)}
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            <AppstoreAddOutlined /> Make Artifact
          </Typography.Title>
        }
      >
        <Row>
          {options.map((value) => (
            <Col xs={12} key={value}>
              <Checkbox
                checked={selected[value]}
                onClick={() => toggleSelected(value)}
                style={{
                  width: '100%',
                  borderRadius: 0,
                  padding: '5px 10px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  justifyContent: 'flex-start',
                }}
              >
                {value}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Modal>
    </>
  );
};
