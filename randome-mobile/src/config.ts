import Constants from 'expo-constants';

type ExpoExtra = {
  apiBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

export const API_BASE_URL = extra.apiBaseUrl || 'https://randome-iota.vercel.app';
