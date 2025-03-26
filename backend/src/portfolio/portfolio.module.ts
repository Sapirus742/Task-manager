import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/orm/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Portfolio } from 'src/orm/portfolio.entity';
import { Team } from 'src/orm/team.entity';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, User, Team])],
  controllers: [PortfolioController],
  exports: [PortfolioService],
  providers: [PortfolioService, RolesGuard],
})
export class PortfolioModule {}