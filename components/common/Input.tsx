import React from 'react';
import { TextInput, Text, View, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <View className="mb-4" style={containerStyle}>
      {label && (
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-text-primary'}`}>
          {label}
        </Text>
      )}
      <TextInput
        className={`px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-card border-shadow text-text-primary'}`}
        placeholderTextColor={isDark ? '#9CA3AF' : '#5F5F5F'}
        style={style}
        {...props}
      />
      {error && (
        <Text className="text-xs mt-1 text-error">
          {error}
        </Text>
      )}
    </View>
  );
};

