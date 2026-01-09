import api from './api';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
}

export interface UserConfig {
  uid: string;
  top5Limit: number;
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateEmail: async (newEmail: string): Promise<void> => {
    await api.put('/profile/email', { newEmail });
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/profile/password', { currentPassword, newPassword });
  },
};

export const configService = {
  getConfig: async (): Promise<UserConfig> => {
    const response = await api.get('/config');
    return response.data;
  },

  updateTop5Limit: async (top5Limit: number): Promise<void> => {
    await api.put('/config/top5-limit', { top5Limit });
  },
};

