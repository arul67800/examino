import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/graphql';
console.log('🔗 Apollo Client connecting to:', apiUrl);

const httpLink = createHttpLink({
  uri: apiUrl,
  credentials: 'include',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;