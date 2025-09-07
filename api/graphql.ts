import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateHandler } from '@apollo/server/integrations/vercel';
import { typeDefs } from '../server/src/schema/typeDefs';
import { resolvers } from '../server/src/resolvers';
import { connectDatabase } from '../server/src/config/database';

// Connect to database
connectDatabase();

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: []
});

// Create and export the request handler
export default startServerAndCreateHandler(server, {
  context: async ({ req }: { req: VercelRequest }) => {
    return {
      headers: req.headers,
    };
  },
});