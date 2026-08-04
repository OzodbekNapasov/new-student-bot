import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RepositoriesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
