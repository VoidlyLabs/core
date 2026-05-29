import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, ConfigurationModule, CategoryModule],
})
export class AdminModule {}
