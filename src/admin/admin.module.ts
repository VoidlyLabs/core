import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [AuthModule, UsersModule, ConfigurationModule],
})
export class AdminModule {}
