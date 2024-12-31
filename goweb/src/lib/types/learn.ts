export type LessonCategory = 'basics' | 'fundamentals' | 'advanced';
export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  duration: string;
  difficulty: string;
  thumbnail?: string;
  status?: LessonStatus;
}