import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/orm/user.entity';
import * as bcrypt from 'bcrypt';
import { Role, UpdateUserDto, UserAccountStatus } from 'src/common/types';
import { Team } from 'src/orm/team.entity';
import { Portfolio } from 'src/orm/portfolio.entity';
import { Project } from 'src/orm/project.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email: username },
      relations: ['team_leader','team_owner','portfolio','project_initiator','team'],
    });
  }

  async findOneById(id: number): Promise<User | any> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['team_leader','team_owner','portfolio','project_initiator','team'],
    });
    return user;
  }

  async create(
    username: string,
    password: string,
    firstname: string,
    lastname: string,
    roles: Role[] = [Role.user],
    status = UserAccountStatus.pending,
  ): Promise<User> {
    const user = new User();
    user.email = username;
    user.firstname = firstname;
    user.lastname = lastname;
    user.passwordHash = await bcrypt.hash(password, 5);
    user.roles = roles;
    user.status = status;
    const createdUser = await this.userRepository.save(user);
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['team_leader','team_owner','portfolio','project_initiator','team'] });
  }

  

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
        throw new NotFoundException(`Project with id ${id} not found`);
    }

    Object.assign(user, updateUserDto);

    if (updateUserDto.team_owner) {
      const teamOwners = await this.teamRepository.find({where: {id: In(updateUserDto.team_owner)}});
      user.team_owner = teamOwners; // Установите связь
  }

  if (updateUserDto.portfolio) {
      const portfolios = await this.portfolioRepository.find({where: {id: In(updateUserDto.portfolio)}});
      user.portfolio = portfolios; // Установите связь
  }

  if (updateUserDto.project_initiator) {
      const projectInitiators = await this.projectRepository.find({where: {id: In(updateUserDto.project_initiator)}});
      user.project_initiator = projectInitiators; // Установите связь
  }

    return this.userRepository.save(user);
  }
}