import React, { createContext } from 'react';
import { FirebaseManager } from '../Firebase';
import { ProviderProps } from './providerTypes';

export const FirebaseContext = createContext({} as FirebaseManager);

const FirebaseProvider = ({ children }: ProviderProps) => {
  return <FirebaseContext.Provider value={new FirebaseManager()}>{children}</FirebaseContext.Provider>;
};

export default FirebaseProvider;
