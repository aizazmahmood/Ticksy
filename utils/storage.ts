import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, AuthState } from '../types';

const TASKS_KEY = '@tasks';
const AUTH_KEY = '@auth';
const THEME_KEY = '@theme';
const LANGUAGE_KEY = '@language';

export const Storage = {
  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      await this.saveTasks(tasks);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);
    await this.saveTasks(filtered);
  },

  // Auth
  async getAuthState(): Promise<AuthState> {
    try {
      const data = await AsyncStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Error loading auth state:', error);
      return { isAuthenticated: false, user: null };
    }
  },

  async saveAuthState(authState: AuthState): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  },

  async clearAuthState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  },

  // Theme
  async getTheme(): Promise<'light' | 'dark'> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as 'light' | 'dark') || 'light';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'light';
    }
  },

  async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  // Language
  async getLanguage(): Promise<'en' | 'ar'> {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_KEY);
      return (language as 'en' | 'ar') || 'en';
    } catch (error) {
      console.error('Error loading language:', error);
      return 'en';
    }
  },

  async saveLanguage(language: 'en' | 'ar'): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

