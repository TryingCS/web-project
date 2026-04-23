// User types
export type UserRole = 'learner' | 'creator' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  bio?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Course types
export interface Course {
  id: number;
  title: string;
  description: string;
  creator_id: number;
  creator_name?: string;
  image_url?: string;
  created_at?: string;
  sections?: Section[];
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  position: number;
  created_at?: string;
  pages?: Page[];
}

export interface Page {
  id: number;
  section_id: number;
  title: string;
  position: number;
  created_at?: string;
  blocks?: Block[];
}

// Block types
export type BlockType = 'text' | 'prediction' | 'quiz' | 'fill_blank' | 'youtube' | 'slider';

export interface Block {
  id: number;
  page_id: number;
  type: BlockType;
  content: BlockContent;
  position: number;
  created_at?: string;
}

export type BlockContent =
  | TextBlockContent
  | PredictionBlockContent
  | QuizBlockContent
  | FillBlankBlockContent
  | YoutubeBlockContent
  | SliderBlockContent;

export interface TextBlockContent {
  markdown: string;
}

export interface PredictionBlockContent {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizBlockContent {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface FillBlankBlockContent {
  text: string;
  answers: string[];
}

export interface YoutubeBlockContent {
  videoId: string;
  title?: string;
}

export interface SliderBlockContent {
  question: string;
  min: number;
  max: number;
  correctMin: number;
  correctMax: number;
  unit?: string;
  explanation: string;
}

// Progress types
export interface UserProgress {
  id: number;
  user_id: number;
  page_id: number;
  completed: boolean;
  completed_at?: string;
  page_title?: string;
  section_title?: string;
  course_title?: string;
}

export interface CourseProgress {
  completed_pages: number[];
  total_pages: number;
  completed_count: number;
  percentage: number;
}

// Quiz attempt
export interface QuizAttempt {
  score: number;
  correct: boolean;
}
