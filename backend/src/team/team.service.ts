import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/orm/user.entity';
import * as bcrypt from 'bcrypt';
import { PrivacyTeam, Role, StatusTeam, UpdateTeamDto, UpdateUserDto, UserAccountStatus } from 'src/common/types';
import { Team } from 'src/orm/team.entity';
import { Project } from 'src/orm/project.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({ 
      relations: ['user_leader', 'user', 'portfolio', 'project', 'user_owner'] 
    });
  }
  
  async findOne(id: number): Promise<Team | any> {
    return this.teamRepository.findOne({
      where: { id },
      relations: ['user_leader', 'user', 'portfolio', 'project', 'user_owner'],
    });
  }

  async findByProjectId(projectId: number): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { project: { id: projectId } },
      relations: ['user_leader', 'user', 'user_owner', 'project'],
    });
  }
  
  async create(
    name: string,        
    description: string,        
    privacy: PrivacyTeam,    
    status: StatusTeam,
    user_leader: number,
    user: number[],
    project: number,
    user_owner: number,
  ): Promise<Team> {
    const team = new Team();
    team.name = name;
    team.description = description;
    team.privacy = privacy;
    team.status = status;

    // Загружаем связанные сущности
    const [user_leaderEntity, userEntities, projectEntity, user_ownerEntity] = await Promise.all([
      this.userRepository.findOne({ where: { id: user_leader } }),
      this.userRepository.find({ where: { id: In(user) } }),
      this.projectRepository.findOne({ where: { id: project } }),
      this.userRepository.findOne({ where: { id: user_owner } })
    ]);

    // Проверяем, что все сущности найдены
    if (!user_leaderEntity) throw new NotFoundException(`Leader with id ${user_leader} not found`);
    if (userEntities.length === 0) throw new NotFoundException(`No users found with ids ${user.join(', ')}`);
    if (!projectEntity) throw new NotFoundException(`Project with id ${project} not found`);
    if (!user_ownerEntity) throw new NotFoundException(`Owner with id ${user_owner} not found`);

    // Устанавливаем связи
    team.user_leader = user_leaderEntity;
    team.user = userEntities;
    team.project = projectEntity;
    team.user_owner = user_ownerEntity;

    return this.teamRepository.save(team);
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['user', 'user_leader', 'project', 'user_owner']
    });
  
    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }
  
    // Обновляем участников команды
    if (updateTeamDto.user !== undefined) {
      const users = await this.userRepository.find({
        where: { id: In(updateTeamDto.user) }
      });
      if (users.length !== updateTeamDto.user.length) {
        throw new NotFoundException('One or more users not found');
      }
      team.user = users;
    }
  
    // Обновляем тимлида - ФИКСИРОВАННАЯ ЧАСТЬ
    if (updateTeamDto.user_leader !== undefined) {
      if (updateTeamDto.user_leader === null) {
        team.user_leader = null;
      } else {
        const leader = await this.userRepository.findOne({ 
          where: { id: updateTeamDto.user_leader }
        });
        if (!leader) {
          throw new NotFoundException(`Leader with id ${updateTeamDto.user_leader} not found`);
        }
        // Проверяем, что новый лидер есть в списке участников
        if (!team.user.some(u => u.id === leader.id)) {
          throw new BadRequestException('Leader must be a team member');
        }
        team.user_leader = leader;
      }
    }
  
    // Обновляем проект
    if (updateTeamDto.project !== undefined) {
      team.project = updateTeamDto.project
        ? await this.projectRepository.findOneBy({ id: updateTeamDto.project })
        : null;
      
      if (updateTeamDto.project && !team.project) {
        throw new NotFoundException(`Project with id ${updateTeamDto.project} not found`);
      }
    }
  
    // Обновляем остальные поля
    if (updateTeamDto.name !== undefined) team.name = updateTeamDto.name;
    if (updateTeamDto.description !== undefined) team.description = updateTeamDto.description;
    if (updateTeamDto.privacy !== undefined) team.privacy = updateTeamDto.privacy;
    if (updateTeamDto.status !== undefined) team.status = updateTeamDto.status;
  
    return this.teamRepository.save(team);
  }

  async remove(id: number): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    await this.teamRepository.remove(team);
  }
}