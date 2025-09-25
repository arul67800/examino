import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
    credentials: true,
  });
  
  const port = process.env.PORT ?? 8001;
  await app.listen(port);
  console.log(`🚀 NestJS API Server is running on http://localhost:${port}`);
  console.log(`📊 GraphQL Playground is available at http://localhost:${port}/graphql`);
}
bootstrap();
