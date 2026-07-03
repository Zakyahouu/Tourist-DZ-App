import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1e293b',
    background: '#F8F7F4',
    tint: '#D6A64C',
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: '#D6A64C',
    primary: '#1F5B3A',
    secondary: '#4C8B5B',
    accent: '#D6A64C',
    bronze: '#A97B43',
    card: '#FFFFFF',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    tint: '#D6A64C',
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#D6A64C',
    primary: '#1F5B3A',
    secondary: '#4C8B5B',
    accent: '#D6A64C',
    bronze: '#A97B43',
    card: '#1e293b',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Poppins',
    sansMedium: 'Poppins-Medium',
    sansSemiBold: 'Poppins-SemiBold',
    sansBold: 'Poppins-Bold',
    arabic: 'Cairo',
    arabicBold: 'Cairo-Bold',
    serif: 'ui-serif',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Poppins',
    sansMedium: 'Poppins-Medium',
    sansSemiBold: 'Poppins-SemiBold',
    sansBold: 'Poppins-Bold',
    arabic: 'Cairo',
    arabicBold: 'Cairo-Bold',
    serif: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: "'Poppins', system-ui, -apple-system, sans-serif",
    sansMedium: "'Poppins-Medium', system-ui, -apple-system, sans-serif",
    sansSemiBold: "'Poppins-SemiBold', system-ui, -apple-system, sans-serif",
    sansBold: "'Poppins-Bold', system-ui, -apple-system, sans-serif",
    arabic: "'Cairo', system-ui, sans-serif",
    arabicBold: "'Cairo-Bold', system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
