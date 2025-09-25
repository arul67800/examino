'use client';

import React from 'react';
import apolloClient from './apollo-client';

// Create a simple context to provide the Apollo client
const ApolloContext = React.createContext(apolloClient);

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloContext.Provider value={apolloClient}>
      {children}
    </ApolloContext.Provider>
  );
}

export function useApollo() {
  return React.useContext(ApolloContext);
}