import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: theme === 'light' ? colors.tertiary : colors.primary,
          borderColor: colors.border
        }
      ]} 
      onPress={toggleTheme}
    >
      <Text style={[
        styles.text,
        { color: theme === 'light' ? 'white' : colors.tertiary }
      ]}>
        {theme === 'light' ? '🌙' : '☀️'} {theme.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});