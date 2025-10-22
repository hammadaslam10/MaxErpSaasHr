import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:4001"],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle("MaxERP Leave Request API")
    .setDescription(
      "A comprehensive API for managing leave requests in a SaaS HR platform",
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addTag("Authentication", "User authentication endpoints")
    .addTag("Leave Management", "Leave request management endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 4001;

  await app.listen(port);
  console.log(`🚀 MaxERP Server running on port ${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api/docs`,
  );
  console.log("📖 Alternative docs at http://localhost:4002/api/docs");
}
bootstrap();
