import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../utils/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text
        className={`text-2xl font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-text-primary'}`}
      >
        {title}
      </Text>
      {message && (
        <Text
          className={`text-base text-center ${isDark ? 'text-gray-400' : 'text-text-secondary'}`}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

