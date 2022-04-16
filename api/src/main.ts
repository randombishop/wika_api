import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * NestJS boilerplate code to start the API server
 * and integrate Swagger documentation
 */
async function bootstrap() {
  // Create Nest APP
  const app = await NestFactory.create(AppModule);
  // Add Swagger Module
  const config = new DocumentBuilder()
    .setTitle('Wika Network')
    .setDescription('Wika Network API to perform offchain queries')
    .setVersion('1.0')
    .addTag('wika')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  // Start the Nest app
  await app.listen(3000);
}
bootstrap();
