import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './utils/theme';
import { AuthProvider, useAuth } from './utils/auth';
import { LanguageProvider, useLanguage } from './utils/i18n';
import { LoginScreen } from './components/auth/LoginScreen';
import { TaskList } from './components/tasks/TaskList';
import { TaskDetailsScreen } from './components/tasks/TaskDetailsScreen';
import { AddTaskScreen } from './components/tasks/AddTaskScreen';
import './global.css';

// Root navigator that includes all screens
const RootStack = createNativeStackNavigator({
  initialRouteName: 'Login',
  screens: {
    Login: {
      screen: LoginScreen,
      options: { headerShown: false },
    },
    Home: {
      screen: TaskList,
      options: { headerShown: false },
    },
    TaskDetails: {
      screen: TaskDetailsScreen,
      options: ({ route }: any) => ({
        title: '', // Will be handled dynamically if needed
        headerStyle: { backgroundColor: '#FFFDF6' },
        headerTintColor: '#1E1E1E',
      }),
    },
    AddTask: {
      screen: AddTaskScreen,
      options: {
        title: '', // Will be handled dynamically if needed
        headerStyle: { backgroundColor: '#FFFDF6' },
        headerTintColor: '#1E1E1E',
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

function RootNavigator() {
  const { authState, isInitialized } = useAuth();

  // Show loader while auth state is being loaded from storage
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF6' }}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  return <Navigation />;
}

function AppContent() {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFDF6' }}>
        <RootNavigator />
      </View>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
