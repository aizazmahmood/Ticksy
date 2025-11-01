import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Task } from '../../types';
import { useTheme } from '../../utils/theme';
import { useLanguage } from '../../utils/i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onDelete: () => void;
  onComplete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onDelete, onComplete }) => {
  const { isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const swipeableRef = useRef<Swipeable>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    
    // Animate card sliding out to the right
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
      slideAnim.setValue(0);
      setIsDeleting(false);
    });
  };

  const handleRightSwipeOpen = () => {
    // Auto-trigger delete after a short delay when fully swiped
    deleteTimeoutRef.current = setTimeout(() => {
      swipeableRef.current?.close();
      handleDelete();
    }, 300);
  };

  const handleRightSwipeClose = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 1],
    });

    return (
      <Animated.View style={[styles.rightAction, { transform: [{ scale }], opacity }]}>
        <View style={styles.actionButton} className="justify-center items-center bg-error">
          <MaterialCommunityIcons name="delete" size={28} color="#FFFFFF" />
        </View>
      </Animated.View>
    );
  };

  const handleComplete = () => {
    if (isCompleting) return;
    setIsCompleting(true);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    
    // First, close the swipeable
    swipeableRef.current?.close();
    
    // Small delay to show the check mark, then trigger action and slide back
    completeTimeoutRef.current = setTimeout(() => {
      onComplete();
      
      // Animate slide back in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start(() => {
        setIsCompleting(false);
      });
    }, 200);
  };

  const handleLeftSwipeOpen = () => {
    // Auto-trigger complete after a short delay when fully swiped
    completeTimeoutRef.current = setTimeout(() => {
      handleComplete();
    }, 300);
  };

  const handleLeftSwipeClose = () => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 1],
    });

    const iconScale = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1.2, 1],
    });

    return (
      <Animated.View style={[styles.leftAction, { transform: [{ scale }], opacity }]}>
        <View style={styles.actionButton} className="justify-center items-center bg-success">
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            {task.status === 'completed' ? (
              <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="check" size={28} color="#FFFFFF" />
            )}
          </Animated.View>
        </View>
      </Animated.View>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dueDate = formatDate(task.dueDate);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <Animated.View
        style={[
          { transform: [{ translateX: slideAnim }] },
          (isDeleting || isCompleting) && { opacity: 0.7 }
        ]}
      >
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
          rightThreshold={60}
          leftThreshold={60}
          overshootRight={false}
          overshootLeft={false}
          onSwipeableWillOpen={(direction) => {
            if (direction === 'right') {
              handleRightSwipeOpen();
            } else if (direction === 'left') {
              handleLeftSwipeOpen();
            }
          }}
          onSwipeableWillClose={() => {
            handleRightSwipeClose();
            handleLeftSwipeClose();
          }}
        >
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={isDeleting || isCompleting}
            className={`mb-3 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-card'}`}
            style={[
              isDark ? { borderColor: '#374151', borderWidth: 1 } : { borderColor: '#E8E8E8', borderWidth: 1 },
              { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
            ]}
          >
          <View className="flex-row justify-between items-start mb-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Text
              className={`flex-1 text-lg font-semibold ${isDark ? 'text-white' : 'text-text-primary'}`}
              style={[
                { textAlign: isRTL ? 'right' : 'left' },
                task.status === 'completed' ? { textDecorationLine: 'line-through', opacity: 0.6 } : {}
              ]}
            >
              {task.title}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${task.status === 'completed' ? 'bg-success' : 'bg-pending-chip'}`}
              style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
            >
              <Text className="text-xs font-medium text-text-primary">
                {task.status === 'completed' ? t('common.status.done') : t('common.status.pending')}
              </Text>
            </View>
          </View>

          {task.description && (
            <Text
              className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-text-secondary'}`}
              numberOfLines={2}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {task.description}
            </Text>
          )}

          {dueDate && (
            <Text 
              className={`text-xs ${isDark ? 'text-gray-500' : 'text-text-secondary'}`}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {t('tasks.due')}: {dueDate}
            </Text>
          )}
        </TouchableOpacity>
      </Swipeable>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  leftAction: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  actionButton: {
    width: 80,
    height: 60,
    borderRadius: 30,
    marginVertical: 8,
  },
});

