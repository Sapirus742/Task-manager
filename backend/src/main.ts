import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

 

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://example.com', // Разрешить только определенные источники
      methods: 'GET,HEAD,PUT,HONOR', // Разрешенные HTTP методы
      allowedHeaders: 'Content-Type, Authorization', // Разрешенные заголовки
    },
  });

  await app.listen(3000);

}

bootstrap();
