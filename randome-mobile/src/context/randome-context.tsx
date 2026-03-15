import React, {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { API_BASE_URL } from '@/src/config';
import { getOrCreateDeviceId } from '@/src/lib/device';
import { prepareNotifications, scheduleReminderNotifications } from '@/src/lib/notifications';
import type { Reminder, Sentence, VideoImport } from '@/src/lib/types';

type RandomeContextValue = {
  deviceId: string | null;
  imports: VideoImport[];
  reminders: Reminder[];
  activeImport: VideoImport | null;
  activeSentence: Sentence | null;
  loading: boolean;
  refreshing: boolean;
  error: string;
  info: string;
  learningWindowStart: string;
  learningWindowEnd: string;
  dailyReminderCount: number;
  notificationStatus: string;
  setLearningWindowStart: (value: string) => void;
  setLearningWindowEnd: (value: string) => void;
  setDailyReminderCount: (value: number) => void;
  setActiveImportId: (value: string | null) => void;
  setActiveSentenceId: (value: string | null) => void;
  clearMessages: () => void;
  refresh: () => Promise<void>;
  createImport: (url: string) => Promise<void>;
  generateReminderNow: () => Promise<void>;
  scheduleDemoReminders: () => Promise<void>;
  markPracticed: (sentenceId: string) => Promise<void>;
  markSeen: (sentenceId: string) => Promise<void>;
  toggleStar: (sentenceId: string) => Promise<void>;
};

const RandomeContext = createContext<RandomeContextValue | null>(null);

type BootstrapResponse = {
  imports?: VideoImport[];
  reminders?: Reminder[];
};

export function RandomeProvider({ children }: React.PropsWithChildren) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [imports, setImports] = useState<VideoImport[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeImportId, setActiveImportId] = useState<string | null>(null);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [learningWindowStart, setLearningWindowStart] = useState('09:00');
  const [learningWindowEnd, setLearningWindowEnd] = useState('21:00');
  const [dailyReminderCount, setDailyReminderCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('unknown');

  const syncFromServer = useCallback(
    (
      data: BootstrapResponse,
      options?: { preferredImportId?: string | null; preferredSentenceId?: string | null }
    ) => {
    const nextImports = data.imports || [];
    const nextReminders = data.reminders || [];
    const preferredImportId = options?.preferredImportId ?? null;
    const preferredSentenceId = options?.preferredSentenceId ?? null;

    setImports(nextImports);
    setReminders(nextReminders);

    const currentImport =
      nextImports.find((item) => item.id === preferredImportId) || nextImports[0] || null;
    setActiveImportId(currentImport?.id || null);

    const currentSentence =
      currentImport?.sentences.find((sentence) => sentence.id === preferredSentenceId) ||
      currentImport?.sentences[0] ||
      null;

    setActiveSentenceId(currentSentence?.id || null);
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    async function prepare() {
      try {
        const [id, permission] = await Promise.all([getOrCreateDeviceId(), prepareNotifications()]);
        if (!mounted) return;

        setDeviceId(id);
        setNotificationStatus(permission);

        const response = await requestJson(`/api/bootstrap?deviceId=${encodeURIComponent(id)}`);
        if (!mounted) return;

        syncFromServer(response);
      } catch (cause) {
        if (!mounted) return;
        setError(asMessage(cause));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    prepare();

    return () => {
      mounted = false;
    };
  }, [syncFromServer]);

  const refresh = useCallback(async () => {
    if (!deviceId) {
      return;
    }

    setRefreshing(true);
    try {
      const response = await requestJson(`/api/bootstrap?deviceId=${encodeURIComponent(deviceId)}`);
      startTransition(() => {
        syncFromServer(response, {
          preferredImportId: activeImportId,
          preferredSentenceId: activeSentenceId,
        });
      });
    } catch (cause) {
      setError(asMessage(cause));
    } finally {
      setRefreshing(false);
    }
  }, [activeImportId, activeSentenceId, deviceId, syncFromServer]);

  const clearMessages = useCallback(() => {
    setError('');
    setInfo('');
  }, []);

  const createImport = useCallback(async (url: string) => {
    if (!deviceId) {
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const response = await requestJson('/api/import-youtube', {
        method: 'POST',
        body: JSON.stringify({
          deviceId,
          url,
          learningWindowStart,
          learningWindowEnd,
          dailyReminderCount,
        }),
      });

      syncFromServer(response);
      setInfo('유튜브 자막을 분석해 문장을 저장했습니다.');
    } catch (cause) {
      setError(asMessage(cause));
      throw cause;
    } finally {
      setLoading(false);
    }
  }, [clearMessages, dailyReminderCount, deviceId, learningWindowEnd, learningWindowStart, syncFromServer]);

  const generateReminderNow = useCallback(async () => {
    if (!deviceId) {
      return;
    }

    clearMessages();

    try {
      const response = await requestJson('/api/reminders/generate', {
        method: 'POST',
        body: JSON.stringify({ deviceId }),
      });

      syncFromServer(response, {
        preferredImportId: activeImportId,
        preferredSentenceId: activeSentenceId,
      });
      setInfo('랜덤 리마인드를 생성했습니다.');
    } catch (cause) {
      setError(asMessage(cause));
      throw cause;
    }
  }, [activeImportId, activeSentenceId, clearMessages, deviceId, syncFromServer]);

  const scheduleDemoReminders = useCallback(async () => {
    const activeImport = imports.find((item) => item.id === activeImportId) || imports[0];
    const previews = (activeImport?.sentences || []).slice(0, 3).map((sentence) => sentence.english);

    if (!previews.length) {
      setError('먼저 영상을 가져와 문장을 만들어주세요.');
      return;
    }

    await scheduleReminderNotifications(previews);
    setInfo('5초, 15초, 30초 후 로컬 알림이 울립니다.');
  }, [activeImportId, imports]);

  const markSeen = useCallback(async (sentenceId: string) => {
    await requestJson('/api/sentences/seen', {
      method: 'POST',
      body: JSON.stringify({ sentenceId }),
    });
    await refresh();
  }, [refresh]);

  const markPracticed = useCallback(async (sentenceId: string) => {
    await requestJson('/api/sentences/practiced', {
      method: 'POST',
      body: JSON.stringify({ sentenceId }),
    });
    await refresh();
  }, [refresh]);

  const toggleStar = useCallback(async (sentenceId: string) => {
    await requestJson('/api/sentences/star', {
      method: 'POST',
      body: JSON.stringify({ sentenceId }),
    });
    await refresh();
  }, [refresh]);

  const activeImport = useMemo(
    () => imports.find((item) => item.id === activeImportId) || imports[0] || null,
    [imports, activeImportId]
  );

  const activeSentence = useMemo(
    () =>
      activeImport?.sentences.find((sentence) => sentence.id === activeSentenceId) ||
      activeImport?.sentences[0] ||
      null,
    [activeImport, activeSentenceId]
  );

  const value = useMemo<RandomeContextValue>(
    () => ({
      deviceId,
      imports,
      reminders,
      activeImport,
      activeSentence,
      loading,
      refreshing,
      error,
      info,
      learningWindowStart,
      learningWindowEnd,
      dailyReminderCount,
      notificationStatus,
      setLearningWindowStart,
      setLearningWindowEnd,
      setDailyReminderCount,
      setActiveImportId,
      setActiveSentenceId,
      clearMessages,
      refresh,
      createImport,
      generateReminderNow,
      scheduleDemoReminders,
      markPracticed,
      markSeen,
      toggleStar,
    }),
    [
      deviceId,
      imports,
      reminders,
      activeImport,
      activeSentence,
      loading,
      refreshing,
      error,
      info,
      learningWindowStart,
      learningWindowEnd,
      dailyReminderCount,
      notificationStatus,
      clearMessages,
      refresh,
      createImport,
      generateReminderNow,
      scheduleDemoReminders,
      markPracticed,
      markSeen,
      toggleStar,
    ]
  );

  return <RandomeContext.Provider value={value}>{children}</RandomeContext.Provider>;
}

export function useRandome() {
  const value = useContext(RandomeContext);

  if (!value) {
    throw new Error('useRandome must be used inside RandomeProvider.');
  }

  return value;
}

async function requestJson(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let payload: any = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const detail = payload.details ? ` (${payload.details})` : '';
    throw new Error(`${payload.error || '요청 처리 중 문제가 발생했습니다.'}${detail}`);
  }

  return payload;
}

function asMessage(value: unknown) {
  if (value instanceof Error) {
    return value.message;
  }

  return String(value);
}
