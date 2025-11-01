import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Task, TaskStatus } from '../../types';
import { Storage } from '../../utils/storage';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { useAuth } from '../../utils/auth';
import { useTheme } from '../../utils/theme';
import { useLanguage } from '../../utils/i18n';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

type FilterType = 'all' | 'pending' | 'completed';

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();
  const { logout, authState } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    await changeLanguage(newLang);
  };
  
  useEffect(() => {
    if (!authState?.isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    }
  }, [authState?.isAuthenticated, navigation]);

  const loadTasks = async () => {
    try {
      const loadedTasks = await Storage.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await Storage.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleComplete = async (task: Task) => {
    try {
      const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
      await Storage.updateTask(task.id, { status: newStatus });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getCounts = () => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  };

  const counts = getCounts();

  const FilterChip: React.FC<{ type: FilterType; label: string; count: number }> = ({
    type,
    label,
    count,
  }) => {
    const isActive = filter === type;
    return (
      <TouchableOpacity
        onPress={() => setFilter(type)}
        className={`px-4 py-2 rounded-full ${isActive ? 'bg-primary' : isDark ? 'bg-gray-800' : 'bg-shadow'}`}
        style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
      >
        <View className="flex-row items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Text
            className={`text-sm font-medium ${isActive ? 'text-text-primary' : isDark ? 'text-gray-300' : 'text-text-secondary'}`}
          >
            {label}
          </Text>
          <View
            className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-primary-dark' : isDark ? 'bg-gray-700' : 'bg-white'}`}
            style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
          >
            <Text
              className={`text-xs font-semibold ${isActive ? 'text-text-primary' : isDark ? 'text-gray-300' : 'text-text-secondary'}`}
            >
              {count}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-background'}`}>
      <View 
        className={`px-4 pb-2 ${isDark ? 'bg-gray-900' : 'bg-background'}`}
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <View className="flex-row justify-between items-center mb-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-text-primary'}`}>
            {t('tasks.myTasks')}
          </Text>
          <View className="flex-row" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <TouchableOpacity
              onPress={toggleLanguage}
              className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-shadow'}`}
              style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
            >
              <Text className={isDark ? 'text-white' : 'text-text-primary'}>
                {language === 'ar' ? 'EN' : 'AR'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleTheme}
              className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-shadow'}`}
              style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
            >
              <Text className={isDark ? 'text-white' : 'text-text-primary'}>
                {isDark ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={logout}
              className={`px-3 py-2 rounded-lg bg-error`}
            >
              <Text className="text-white text-sm">{t('common.buttons.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row mb-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <FilterChip type="all" label={t('common.status.all')} count={counts.all} />
          <FilterChip type="pending" label={t('common.status.pending')} count={counts.pending} />
          <FilterChip type="completed" label={t('common.status.completed')} count={counts.completed} />
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout}>
            <TaskCard
              task={item}
              onPress={() => (navigation.navigate as any)('TaskDetails', { taskId: item.id })}
              onDelete={() => handleDelete(item.id)}
              onComplete={() => handleComplete(item)}
            />
          </Animated.View>
        )}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title={t('tasks.emptyAll')}
            message={
              filter === 'all'
                ? t('tasks.emptyCreate')
                : t('tasks.emptyFiltered', { filter: t(`common.status.${filter}`) })
            }
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFC107" />
        }
      />

      <View className="px-4 pb-4">
        <Button
          title={t('common.buttons.addNewTask')}
          onPress={() => navigation.navigate('AddTask' as never)}
        />
      </View>
    </View>
  );
};

