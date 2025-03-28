import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TeamService } from './team.service';
import { Roles } from 'src/auth/roles.decorator';
import { CreateTeamDto, Role, UpdateTeamDto } from 'src/common/types';
import { RolesGuard } from 'src/auth/roles.guard';
import { Team } from 'src/orm/team.entity';

@Controller('team')

export class TeamController {
  private readonly logger = new Logger(TeamController.name);

  constructor(private teamService: TeamService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Team[]> {
    return this.teamService.findAll();
  }
 
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number): Promise<Team> {
    return this.teamService.findOne(id);
  }

  @Get('by-project/:projectId')
  async findByProjectId(@Param('projectId') projectId: number): Promise<Team | null> {
    return this.teamService.findByProjectId(projectId);
  }

  
  @Post()
  @Roles(Role.admin, Role.customer, Role.directorate)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() team: CreateTeamDto): Promise<Team> {
    return this.teamService.create(
      team.name,
      team.description,
      team.privacy,
      team.status,
      team.user_leader,
      team.user,
      team.project,
      team.user_owner,
    );
  }
  
  @Patch(':id')
  @Roles(Role.admin, Role.customer, Role.directorate, Role.user)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: number,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    return this.teamService.update(id, updateTeamDto);
  }
 
  @Delete(':id')
  @Roles(Role.admin, Role.customer, Role.directorate) 
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: number): Promise<void> {
      return this.teamService.remove(id);
  }
}