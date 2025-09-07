import { authResolvers } from './auth';
import { resumeResolvers } from './resume';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...resumeResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...resumeResolvers.Mutation,
  },
  Subscription: {
    ...resumeResolvers.Subscription,
  },
};