import { Injectable, inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, from } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { setContext } from '@apollo/client/link/context';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApolloConfigService {
  
  createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
    // HTTP Link
    const http = httpLink.create({
      uri: environment.graphqlEndpoint
    });

    // Error Link
    const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        });
      }

      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
        
        // Handle specific network errors
        if (networkError.message.includes('Failed to fetch')) {
          console.warn('GraphQL server might be offline, falling back to static data');
        }
      }
    });

    // Retry Link
    const retryLink = new RetryLink({
      delay: {
        initial: 300,
        max: Infinity,
        jitter: true
      },
      attempts: {
        max: 3,
        retryIf: (error, _operation) => !!error
      }
    });

    // Combine links
    const link = from([
      errorLink,
      retryLink,
      http
    ]);

    // Cache configuration - Basitleştirilmiş versiyıon
    const cache = new InMemoryCache({
      addTypename: true,
      typePolicies: {
        Query: {
          fields: {
            getResumeData: {
              // Cache'i devre dışı bırak bu query için
              read(existing, { canRead }) {
                return existing;
              },
              merge(existing, incoming) {
                return incoming;
              }
            }
          }
        }
      }
    });

    return {
      link,
      cache,
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
          fetchPolicy: 'cache-first',
          notifyOnNetworkStatusChange: true
        },
        query: {
          errorPolicy: 'all',
          fetchPolicy: 'cache-first'
        },
        mutate: {
          errorPolicy: 'all'
        }
      },
      // Development mod'da devtools'ı aktif et
      connectToDevTools: !environment.production,
      // Cache'ı sıkıntıda varsayılan değerlere döndür
      assumeImmutableResults: false
    };
  }
}