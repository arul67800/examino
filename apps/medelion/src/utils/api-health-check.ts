/**
 * Simple utility to check if the GraphQL API is reachable
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/graphql';

export const checkApiHealth = async (): Promise<{
  isReachable: boolean;
  error?: string;
  responseTime?: number;
}> => {
  const startTime = Date.now();
  
  try {
    // Simple GraphQL introspection query to check if the server is up
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query IntrospectionQuery {
            __schema {
              queryType {
                name
              }
            }
          }
        `
      }),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.__schema) {
        return {
          isReachable: true,
          responseTime,
        };
      } else {
        return {
          isReachable: false,
          error: 'Invalid GraphQL response',
          responseTime,
        };
      }
    } else {
      return {
        isReachable: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      isReachable: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
};

export const logApiHealth = async () => {
  console.log('🔍 Checking API health...');
  const result = await checkApiHealth();
  
  if (result.isReachable) {
    console.log('✅ API is reachable', {
      url: API_URL,
      responseTime: `${result.responseTime}ms`
    });
  } else {
    console.error('❌ API is not reachable', {
      url: API_URL,
      error: result.error,
      responseTime: `${result.responseTime}ms`
    });
  }
  
  return result;
};