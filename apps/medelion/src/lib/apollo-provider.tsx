'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import apolloClient from './apollo-client';

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}

// Keep the custom hook for backward compatibility if needed elsewhere
export function useApollo() {
  return apolloClient;
}