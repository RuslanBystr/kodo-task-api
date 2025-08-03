import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('KodoTask API')
    .setDescription('KodoTask API documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'Access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    customCss: `
      button { outline: none !important; }
      #swagger-ui { background: linear-gradient(45deg, #eafffa, #cceeff); }
      .swagger-ui>.topbar { background-color: #66aabb; }
      #swagger-ui .scheme-container { background-color: #77d9d9; }
      .swagger-ui .auth-wrapper>.btn { border: 2px solid #fff; background-color: #dff; }
    `,
    customSiteTitle: 'KodoTask API Docs',
  });
}
