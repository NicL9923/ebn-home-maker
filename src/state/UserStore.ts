import { Family, Profile } from 'models/types';
import create from 'zustand';

interface IUserStore {
  userId?: string | null;
  userEmail?: string | null;
  profile?: Profile | null;
  family?: Family | null;
  setUserId: (newUserId?: string | null) => void;
  setUserEmail: (newUserEmail?: string | null) => void;
  setProfile: (newProfile?: Profile | null) => void;
  setFamily: (newFamily?: Family | null) => void;
}

export const useUserStore = create<IUserStore>((set) => ({
  userId: undefined,
  userEmail: undefined,
  profile: undefined,
  family: undefined,
  setUserId: (newUserId?: string | null) => set({ userId: newUserId }),
  setUserEmail: (newUserEmail?: string | null) => set({ userEmail: newUserEmail }),
  setProfile: (newProfile?: Profile | null) => set({ profile: newProfile }),
  setFamily: (newFamily?: Family | null) => set({ family: newFamily }),
}));
