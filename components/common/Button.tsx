import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { isDark } = useTheme();

  const getBgColor = () => {
    if (disabled) return isDark ? 'rgb(75 85 99)' : 'bg-shadow';
    switch (variant) {
      case 'primary':
        return 'bg-primary';
      case 'secondary':
        return 'bg-shadow';
      case 'danger':
        return 'bg-error';
      default:
        return 'bg-primary';
    }
  };

  const getTextColor = () => {
    if (disabled) return isDark ? 'text-text-secondary' : 'text-text-secondary';
    if (variant === 'secondary') return 'text-text-primary';
    return 'text-white';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 px-6 rounded-lg items-center justify-center ${getBgColor()}`}
      style={[
        {
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#1E1E1E' : '#FFFFFF'} />
      ) : (
        <Text className={`text-base font-semibold ${getTextColor()}`} style={textStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

