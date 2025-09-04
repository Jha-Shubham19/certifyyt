import type { GenerateMCQsOutput } from '@/ai/flows/generate-mcqs-from-video-title';

// This is a slimmed down version of the Firebase User object.
export type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

export type MCQ = GenerateMCQsOutput[0];

export type Certificate = {
  id: string;
  userId: string;
  userName: string;
  videoTitle: string;
  videoId?: string;
  playlistId?: string;
  issueDate: string;
  score: number;
};
