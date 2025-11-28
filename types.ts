export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface Task {
  id: string;
  title: string;
  teacher: string;
  deadline: string; // ISO Date string
  description: string;
  priority: Priority;
  imageUrl?: string; // Base64 or URL
  completed: boolean;
  createdAt: number;
}

export interface ExtractedTaskData {
  title: string;
  teacher: string;
  deadline: string;
  description: string;
  priority: Priority;
}
