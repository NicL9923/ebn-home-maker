import { Family, UserProfile } from 'models/types';
import create from 'zustand';

interface IUserStore {
  userId?: string;
  userEmail?: string;
  profile?: UserProfile;
  family?: Family;
  isFetchingUser: boolean;
  isFetchingProfile: boolean;
  isFetchingFamily: boolean;
  setUserId: (newUserId?: string) => void;
  setUserEmail: (newUserEmail?: string) => void;
  setProfile: (newProfile?: UserProfile) => void;
  setFamily: (newFamily?: Family) => void;
  setIsFetchingUser: (isFetching: boolean) => void;
  setIsFetchingProfile: (isFetching: boolean) => void;
  setIsFetchingFamily: (isFetching: boolean) => void;
}

export const useUserStore = create<IUserStore>((set) => ({
  userId: undefined,
  userEmail: undefined,
  profile: undefined,
  family: undefined,
  isFetchingUser: true,
  isFetchingProfile: true,
  isFetchingFamily: true,
  setUserId: (newUserId?: string) => set({ userId: newUserId }),
  setUserEmail: (newUserEmail?: string) => set({ userEmail: newUserEmail }),
  setProfile: (newProfile?: UserProfile) => set({ profile: newProfile }),
  setFamily: (newFamily?: Family) => set({ family: newFamily }),
  setIsFetchingUser: (isFetching: boolean) => set({ isFetchingUser: isFetching }),
  setIsFetchingProfile: (isFetching: boolean) => set({ isFetchingProfile: isFetching }),
  setIsFetchingFamily: (isFetching: boolean) => set({ isFetchingFamily: isFetching }),
}));
