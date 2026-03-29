import './fonts.css';
import './index.scss';

import { store } from '@/store';
import { Reader } from '@/store/_reader';
import { Button, Flex, Result, Spin } from 'antd';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReaderVerticalLayout } from './ReaderVerticalLayout';
import { useChapterPreloader } from './hooks/useChapterPreloader';
import { useWakeLock } from './hooks/useWakeLock';

export const NovelReaderPage: React.FC<any> = () => {
  useWakeLock();

  const { id } = useParams<{ id: string }>();
  const { data, job, loading, error, refresh } = useChapterPreloader(id);

  // Reset scroll position and speaking position when chapter is loaded
  useEffect(() => {
    if (!data) return;

    // reset scroll position
    window.scrollTo(0, 0);

    // reset speaking position
    store.dispatch(Reader.action.setSepakPosition(0));

    // stop speaking if chapter is done
    if (data && !data.content && data.chapter.is_done) {
      store.dispatch(Reader.action.setSpeaking(false));
    }
  }, [data]);

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: 'calc(100vh - 60px)' }}
      >
        <Spin size="large" style={{ margin: '50px 0' }} />
      </Flex>
    );
  }

  if (error || !data || !id) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: 'calc(100vh - 60px)' }}
      >
        <Result
          status="404"
          title="Failed to load chapter content"
          subTitle={error}
          extra={<Button onClick={refresh}>Retry</Button>}
        />
      </Flex>
    );
  }

  return <ReaderVerticalLayout key={id} data={data} job={job} />;
};
