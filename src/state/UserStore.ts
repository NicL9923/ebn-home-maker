import { Family, UserProfile } from 'models/types';
import create from 'zustand';
import { useAppStore } from './AppStore';

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
  setProfile: (newProfile: UserProfile) => void;
  setFamily: (newFamily: Family) => void;
  setIsFetchingUser: (isFetching: boolean) => void;
  setIsFetchingProfile: (isFetching: boolean) => void;
  setIsFetchingFamily: (isFetching: boolean) => void;
  getProfile: () => void;
  getFamily: () => void;
}

export const useUserStore = create<IUserStore>((set, get) => ({
  userId: undefined,
  userEmail: undefined,
  profile: undefined,
  family: undefined,
  isFetchingUser: true,
  isFetchingProfile: true,
  isFetchingFamily: true,
  setUserId: (newUserId?: string) => set({ userId: newUserId }),
  setUserEmail: (newUserEmail?: string) => set({ userEmail: newUserEmail }),
  setProfile: (newProfile: UserProfile) => set({ profile: newProfile }),
  setFamily: (newFamily: Family) => set({ family: newFamily }),
  setIsFetchingUser: (isFetching: boolean) => set({ isFetchingUser: isFetching }),
  setIsFetchingProfile: (isFetching: boolean) => set({ isFetchingProfile: isFetching }),
  setIsFetchingFamily: (isFetching: boolean) => set({ isFetchingFamily: isFetching }),
  getProfile: () => {
    const firebase = useAppStore.getState().firebase;
    const userId = get().userId;

    if (userId) {
      set({ isFetchingProfile: true });
      firebase.getProfile(userId).then((doc) => {
        set({ isFetchingProfile: false });
        if (doc.exists()) set({ profile: doc.data() as UserProfile });
      });
    } else {
      set({ profile: undefined });
      set({ isFetchingProfile: false });
    }
  },
  getFamily: () => {
    const firebase = useAppStore.getState().firebase;
    const profile = get().profile;

    if (profile?.familyId) {
      set({ isFetchingFamily: true });
      firebase.getFamily(profile.familyId).then((doc) => {
        set({ isFetchingFamily: false });
        if (doc.exists()) set({ family: doc.data() as Family });
      });
    } else {
      set({ family: undefined });
      set({ isFetchingFamily: false });
    }
  },
}));
