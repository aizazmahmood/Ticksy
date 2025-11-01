import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../utils/auth';
import { Validation } from '../../utils/validation';
import { useTheme } from '../../utils/theme';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, authState } = useAuth();
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  
  useEffect(() => {
    if (authState?.isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    }
  }, [authState?.isAuthenticated, navigation]);

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email.trim()) {
      setEmailError(t('auth.emailRequired'));
      return;
    }
    if (!Validation.email(email)) {
      setEmailError(t('auth.emailInvalid'));
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return;
    }
    if (!Validation.password(password)) {
      setPasswordError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Navigation will be handled by App.tsx based on auth state
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-background'}`}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          <Text
            className={`text-3xl font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-text-primary'}`}
          >
            {t('auth.welcome')}
          </Text>
          <Text
            className={`text-base mb-8 text-center ${isDark ? 'text-gray-400' : 'text-text-secondary'}`}
          >
            {t('auth.signInMessage')}
          </Text>

          <Input
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            error={passwordError}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Button
            title={t('common.buttons.signIn')}
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

