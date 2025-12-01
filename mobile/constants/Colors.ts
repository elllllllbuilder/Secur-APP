/**
 * app+ App Color System
 * Brand colors: #03fcec (app), #03b1fc (blue), #0384fc (dark blue)
 */

// app+ Brand Colors
export const appColors = {
  primary: '#fc0303ff',    // Main app
  secondary: '#20fc03ff',  // Blue
  tertiary: '#fc03e7ff',   // Dark blue
};

const tintColorLight = appColors.tertiary;
const tintColorDark = appColors.primary;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: appColors.primary,
    secondary: appColors.secondary,
    tertiary: appColors.tertiary,
    card: '#f8f9fa',
    border: '#e9ecef',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: appColors.primary,
    secondary: appColors.secondary,
    tertiary: appColors.tertiary,
    card: '#1f2937',
    border: '#374151',
  },
};
