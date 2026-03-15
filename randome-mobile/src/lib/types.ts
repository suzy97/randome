export type Sentence = {
  id: string;
  english: string;
  korean: string;
  pattern: string;
  reason: string;
  example: string;
  cloze: string;
  choices: string[];
  answer: string;
  seenCount: number;
  practicedCount: number;
  starred: boolean;
};

export type VideoImport = {
  id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  sourceTitle: string;
  learningWindowStart: string;
  learningWindowEnd: string;
  dailyReminderCount: number;
  importedAt: string;
  sentences: Sentence[];
};

export type Reminder = {
  id: string;
  sentenceId: string;
  title: string;
  preview: string;
  deliveredAt: string;
  deliveredAtLabel: string;
  opened: boolean;
};
