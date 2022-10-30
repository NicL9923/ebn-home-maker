import { SnackbarData } from 'models/types';
import create from 'zustand';

interface IAppStore {
  themePreference: ThemeType;
  snackbarData?: SnackbarData | undefined;
  setThemePreference: (newThemePreference: ThemeType) => void;
  setSnackbarData: (snackbarData: SnackbarData | undefined) => void;
}

export const useAppStore = create<IAppStore>((set) => ({
  themePreference: ThemeType.Light,
  snackbarData: undefined,
  setThemePreference: (newThemePreference: ThemeType) => set({ themePreference: newThemePreference }),
  setSnackbarData: (snackbarData: SnackbarData | undefined) => set({ snackbarData }),
}));

import { ThemeType } from '../constants';
