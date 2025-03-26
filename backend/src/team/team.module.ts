import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from 'src/orm/team.entity';
import { TeamController } from './team.controller';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/orm/user.entity';
import { Project } from 'src/orm/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, User, Project])],
  providers: [TeamService, RolesGuard],
  exports: [TeamService],
  controllers: [TeamController],
})
export class TeamModule {}