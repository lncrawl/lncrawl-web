import { store } from '@/store';
import { Reader } from '@/store/_reader';
import type { ReadChapter } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getVoices } from '../../SettingsPage/ReaderSettings/VoiceSettings';

export function useSpeechSynthesis(
  contentEl: HTMLDivElement | null,
  data: ReadChapter
) {
  const navigate = useNavigate();

  const voiceName = useSelector(Reader.select.voice);
  const speaking = useSelector(Reader.select.speaking);
  const position = useSelector(Reader.select.speakPosition);
  const voiceSpeed = useSelector(Reader.select.voiceSpeed);
  const voicePitch = useSelector(Reader.select.voicePitch);

  const [loading, setLoading] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const voice = useMemo(
    () => voices.find((x) => x.name === voiceName) || voices[0],
    [voices, voiceName]
  );

  useEffect(() => {
    getVoices()
      .then(setVoices)
      .finally(() => setLoading(false));

    const aborter = new AbortController();
    window.addEventListener(
      'beforeunload',
      () => {
        window.speechSynthesis.cancel();
        store.dispatch(Reader.action.setSpeaking(false));
      },
      { signal: aborter.signal }
    );
    return () => aborter.abort();
  }, []);

  useEffect(() => {
    if (loading || !contentEl || !speaking || !voice || !data.content) {
      return;
    }

    if (position >= contentEl.children.length) {
      if (data.next_id) {
        navigate(`/read/${data.next_id}`);
      } else {
        store.dispatch(Reader.action.setSpeaking(false));
      }
      store.dispatch(Reader.action.setSepakPosition(0));
      return;
    }

    const childEl = contentEl.children[position];

    const text = childEl.textContent;
    if (!text?.length) {
      store.dispatch(Reader.action.setSepakPosition(position + 1));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;

    utterance.addEventListener('end', () => {
      store.dispatch(Reader.action.setSepakPosition(position + 1));
    });

    const tid = setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);

    return () => {
      clearTimeout(tid);
      requestAnimationFrame(() => {
        window.speechSynthesis.cancel();
      });
    };
  }, [
    data,
    contentEl,
    speaking,
    voice,
    voiceSpeed,
    voicePitch,
    position,
    loading,
    navigate,
  ]);
}
