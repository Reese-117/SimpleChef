import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

/**
 * Light theme with WCAG AA contrast.
 * Proposal palette: Sea Green primary, Sandy Yellow accent.
 */
export const chefLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E8B57',
    primaryContainer: '#C8E6C9',
    secondary: '#F4A261',
    secondaryContainer: '#F4D7B5',
    surface: '#FAFAFA',
    background: '#FFFFFF',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    surfaceVariant: '#E7E0EC',
    outline: '#79747E',
  },
};

/**
 * Dark theme with WCAG AA contrast.
 */
export const chefDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4CAF7A',
    secondary: '#F4A261',
    surface: '#1C1B1F',
    background: '#121212',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',
    surfaceVariant: '#49483E',
    outline: '#938F99',
  },
};
