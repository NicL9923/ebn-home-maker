import { SnackbarData } from 'models/types';
import create from 'zustand';

interface IAppStore {
  snackbarData?: SnackbarData | undefined;
  setSnackbarData: (snackbarData: SnackbarData | undefined) => void;
}

export const useAppStore = create<IAppStore>((set) => ({
  snackbarData: undefined,
  setSnackbarData: (snackbarData: SnackbarData | undefined) => set({ snackbarData }),
}));
