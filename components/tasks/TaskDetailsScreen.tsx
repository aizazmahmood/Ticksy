import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Task, TaskStatus } from '../../types';
import { Storage } from '../../utils/storage';
import { Button } from '../common/Button';
import { useTheme } from '../../utils/theme';
import { useLanguage } from '../../utils/i18n';

export const TaskDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { taskId } = route.params as { taskId: string };
  const [task, setTask] = useState<Task | null>(null);
  const { isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const tasks = await Storage.getTasks();
      const foundTask = tasks.find((t) => t.id === taskId);
      setTask(foundTask || null);
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!task) return;
    try {
      const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
      await Storage.updateTask(task.id, { status: newStatus });
      await loadTask();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('tasks.notSet');
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!task) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-background'}`}>
        <Text className={isDark ? 'text-white' : 'text-text-primary'}>{t('tasks.emptyAll')}</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-background'}`}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-card'}`}>
          <View className="flex-row justify-between items-start mb-4">
            <Text
              className={`flex-1 text-2xl font-bold ${isDark ? 'text-white' : 'text-text-primary'}`}
              style={task.status === 'completed' ? { textDecorationLine: 'line-through', opacity: 0.6 } : {}}
            >
              {task.title}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${task.status === 'completed' ? 'bg-success' : 'bg-pending-chip'}`}
            >
              <Text className="text-xs font-medium text-text-primary">
                {task.status === 'completed' ? t('common.status.completed') : t('common.status.pending')}
              </Text>
            </View>
          </View>

          {task.description && (
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-text-secondary'}`}>
                {t('tasks.description')}
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-text-primary'}`}>
                {task.description}
              </Text>
            </View>
          )}

          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-text-secondary'}`}>
              {t('tasks.dueDate')}
            </Text>
            <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-text-primary'}`}>
              {formatDate(task.dueDate)}
            </Text>
          </View>

          <View>
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-text-secondary'}`}>
              {t('tasks.created')}
            </Text>
            <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-text-primary'}`}>
              {formatDate(task.createdAt)}
            </Text>
          </View>
        </View>

        <Button
          title={task.status === 'completed' ? t('common.buttons.markPending') : t('common.buttons.markCompleted')}
          onPress={handleToggleStatus}
          variant={task.status === 'completed' ? 'secondary' : 'primary'}
        />
      </ScrollView>
    </View>
  );
};

