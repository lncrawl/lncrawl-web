import { store } from '@/store';
import { Config } from '@/store/_config';
import { Reader } from '@/store/_reader';
import { type Job, type ReadChapter } from '@/types';
import { stringifyError } from '@/utils/errors';
import { formatFromNow } from '@/utils/time';
import axios from 'axios';
import { LRUCache } from 'lru-cache';
import { useCallback, useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useSelector } from 'react-redux';

const CONTENT_CLEANER_REGEX = /<p>(\s+)|(&nbsp;)+<\/p>(\n|\s|<br\/>)+/gim;

const fetchJobs = new LRUCache<string, Promise<Job>>({ max: 1000 });
const cache = new LRUCache<string, Promise<ReadChapter>>({ max: 1000 });

// eslint-disable-next-line react-refresh/only-export-components
const ChapterHeader: React.FC<{ data: ReadChapter }> = ({ data }) => {
  return (
    <>
      <h1 style={{ marginBottom: 6 }}>{data.chapter.title.trim()}</h1>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 25 }}>
        {data.chapter.serial} of {data.novel.chapter_count}
        <span> | </span>
        Updated {formatFromNow(data.chapter.updated_at)}
      </div>
    </>
  );
};

function formatChapterContent(data: ReadChapter): ReadChapter {
  if (!data.content) return data;
  const header = renderToStaticMarkup(<ChapterHeader data={data} />);
  const clean = data.content.replace(CONTENT_CLEANER_REGEX, '');
  data.content = header + clean;
  return data;
}

async function fetchChapterCached(id: string): Promise<ReadChapter> {
  if (!cache.has(id)) {
    const promise = axios
      .get<ReadChapter>(`/api/chapter/${id}/read`)
      .then((res) => formatChapterContent(res.data));
    cache.set(id, promise);
  }
  return cache.get(id)!;
}

function createFetchJob(chapterId: string): Promise<Job> | undefined {
  const state = store.getState();
  const autoFetch = Reader.select.autoFetch(state);
  if (autoFetch && !fetchJobs.has(chapterId)) {
    const promise = axios
      .get<Job>(`/api/chapter/${chapterId}/fetch`)
      .then((res) => res.data);
    fetchJobs.set(chapterId, promise);
  }
  return fetchJobs.get(chapterId);
}

async function fetchJob(
  chapterId: string,
  jobId: string
): Promise<Job | undefined> {
  try {
    const { data } = await axios.get<Job>(`/api/job/${jobId}`);
    fetchJobs.set(chapterId, Promise.resolve(data));
    return data;
  } catch {}
}

export function useChapterPreloader(chapterId?: string) {
  const chapterFetchPollIntervalMs = useSelector(
    Config.select.chapterFetchPollIntervalMs
  );
  const readerPreloadNextChapter = useSelector(
    Config.select.readerPreloadNextChapter
  );
  const [refreshId, setRefreshId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<ReadChapter>();
  const [job, setJob] = useState<Job>();

  // current chapter content data
  useEffect(() => {
    if (!chapterId) {
      setData(undefined);
      setJob(undefined);
      setError('No chapter ID in URL');
      setLoading(false);
      return;
    }
    queueMicrotask(async () => {
      setLoading(true);
      setError(undefined);
      try {
        // delete cache if there is a fetch request in progress
        if (fetchJobs.has(chapterId)) {
          cache.delete(chapterId);
        } else {
          setJob(undefined);
        }
        // fetch chapter data
        const data = await fetchChapterCached(chapterId);
        setData(data);
      } catch (err) {
        setError(stringifyError(err));
      } finally {
        setLoading(false);
      }
    });
  }, [chapterId, refreshId]);

  // preload chapters and create fetch job if chapter is unavailable
  useEffect(() => {
    if (!data) return;

    // create job if chapter is unavailable and auto fetch is enabled
    queueMicrotask(async () => {
      if (data.chapter.id && !data.chapter.is_done) {
        try {
          const promise = createFetchJob(data.chapter.id);
          if (promise) {
            const job = await promise;
            setJob(job);
          }
        } catch {}
      } else {
        setJob(undefined);
      }
    });

    // preload next chapter
    if (readerPreloadNextChapter) {
      queueMicrotask(async () => {
        if (data.next_id) {
          try {
            const next = await fetchChapterCached(data.next_id!);
            if (!next.chapter.is_done) {
              createFetchJob(next.chapter.id);
            }
          } catch {}
        }
      });
    }

    // TODO: Disabling previous chapter preloading for now.
    // // preload previous chapter
    // queueMicrotask(async () => {
    //   if (data.previous_id) {
    //     try {
    //       const prev = await fetchChapterCached(data.previous_id!);
    //       if (!prev.chapter.is_done) {
    //         setJob(await createFetchJob(prev.chapter.id));
    //       }
    //     } catch {}
    //   }
    // });
  }, [data, readerPreloadNextChapter]);

  // Polls fetch job status and refreshes chapter when job is done
  useEffect(() => {
    if (!job?.id || !data?.chapter.id || data.chapter.is_done) {
      return;
    }
    const id = data.chapter.id;
    if (job.is_done) {
      cache.delete(id); // clear cached chapter content.
      setRefreshId((v) => v + 1); // fetch latest chapter content.
    } else {
      const iid = setInterval(() => {
        void fetchJob(id, job.id).then(setJob); // update fetch job status.
      }, chapterFetchPollIntervalMs);
      return () => clearInterval(iid);
    }
  }, [
    data?.chapter.id,
    data?.chapter.is_done,
    job?.is_done,
    job?.id,
    chapterFetchPollIntervalMs,
  ]);

  /// Refresh chapter content
  const refresh = useCallback(() => {
    // setLoading(true);
    setRefreshId((v) => v + 1);
  }, []);

  return { data, job, loading, error, refresh };
}
