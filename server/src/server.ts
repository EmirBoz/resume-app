import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { connectDatabase } from './config/database';
import { config } from './config/environment';
import { createContext } from './utils/auth';

async function startServer() {
  // Connect to database
  await connectDatabase();
  
  // Create Express app
  const app = express();
  const httpServer = http.createServer(app);
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: !config.isProduction,
    includeStacktraceInErrorResponses: !config.isProduction,
  });
  
  // Start Apollo Server
  await server.start();
  
  // CORS configuration
  const corsOptions = {
    origin: config.corsOrigins,
    credentials: true,
  };
  
  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    express.json({ limit: '10mb' }),
    expressMiddleware(server, {
      context: createContext,
    })
  );
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '1.0.0'
    });
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'CV GraphQL Server',
      graphql: '/graphql',
      health: '/health',
      environment: config.nodeEnv
    });
  });
  
  // Start HTTP server
  await new Promise<void>((resolve) => {
    httpServer.listen({ port: config.port }, resolve);
  });
  
  console.log(`🚀 GraphQL Server ready at http://localhost:${config.port}/graphql`);
  console.log(`❤️  Health check at http://localhost:${config.port}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await server.stop();
    httpServer.close();
  });
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});