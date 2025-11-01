export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  TaskDetails: { taskId: string };
  AddTask: undefined;
};

