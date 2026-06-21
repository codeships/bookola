import { Platform } from 'react-native';

export const softShadow = Platform.select({
  ios: {
    shadowColor: '#10243E',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  android: {
    elevation: 6,
  },
  default: {
    shadowColor: '#10243E',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
});
