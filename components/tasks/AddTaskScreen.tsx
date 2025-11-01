import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../../types';
import { Storage } from '../../utils/storage';
import { Validation } from '../../utils/validation';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useTheme } from '../../utils/theme';
import { useLanguage } from '../../utils/i18n';

export const AddTaskScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSave = async () => {
    setTitleError('');

    if (!Validation.taskTitle(title)) {
      setTitleError(t('tasks.titleRequired'));
      return;
    }

    setLoading(true);
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'pending',
        dueDate: dueDate?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await Storage.addTask(newTask);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-background'}`}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-text-primary'}`}>
          {t('tasks.addNewTask')}
        </Text>

        <Input
          label={`${t('tasks.title')} *`}
          placeholder={t('tasks.titlePlaceholder')}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setTitleError('');
          }}
          error={titleError}
        />

        <Input
          label={t('tasks.description')}
          placeholder={t('tasks.descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-text-secondary'}`}>
            {t('tasks.dueDateOptional')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className={`px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-card border-shadow'}`}
          >
            <Text className={dueDate ? (isDark ? 'text-white' : 'text-text-primary') : (isDark ? 'text-gray-500' : 'text-text-secondary')}>
              {dueDate ? formatDate(dueDate) : t('tasks.selectDate')}
            </Text>
          </TouchableOpacity>
          {dueDate && (
            <TouchableOpacity
              onPress={() => setDueDate(null)}
              className="mt-2"
            >
              <Text className="text-sm text-error">{t('tasks.clearDate')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            onTouchCancel={() => setShowDatePicker(false)}
          />
        )}

        {Platform.OS === 'ios' && showDatePicker && (
          <View className="flex-row justify-end mb-4">
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              className="px-4 py-2"
            >
              <Text className="text-primary font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        )}

        <Button
          title={t('common.buttons.saveTask')}
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
};

