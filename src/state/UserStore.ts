import { Family, Profile } from 'models/types';
import create from 'zustand';

interface IUserStore {
  userId?: string;
  userEmail?: string;
  profile?: Profile;
  family?: Family;
  setUserId: (newUserId?: string) => void;
  setUserEmail: (newUserEmail?: string) => void;
  setProfile: (newProfile?: Profile) => void;
  setFamily: (newFamily?: Family) => void;
}

export const useUserStore = create<IUserStore>((set) => ({
  userId: undefined,
  userEmail: undefined,
  profile: undefined,
  family: undefined,
  setUserId: (newUserId?: string) => set({ userId: newUserId }),
  setUserEmail: (newUserEmail?: string) => set({ userEmail: newUserEmail }),
  setProfile: (newProfile?: Profile) => set({ profile: newProfile }),
  setFamily: (newFamily?: Family) => set({ family: newFamily }),
}));
