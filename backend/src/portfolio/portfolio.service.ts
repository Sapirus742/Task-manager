import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePortfolioDto, UserCommandStatus } from 'src/common/types';
import { Portfolio } from 'src/orm/portfolio.entity';
import { Team } from 'src/orm/team.entity';
import { User } from 'src/orm/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Portfolio[]> {
    return this.portfolioRepository.find({ relations: ['team', 'user'] });
  }

  async findOne(id: number): Promise<Portfolio | any> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['team', 'user'],
    });
    return portfolio;
  }

  async create(
    status: UserCommandStatus,
    team: number,
    user: number,
  ): Promise<Portfolio> {
    const portfolio = new Portfolio();
    portfolio.status = status;
    const teamEntity = await this.teamRepository.findOne({ where: { id: team } });
    const userEntity = await this.userRepository.findOne({ where: { id: user } });

    if (!teamEntity) {
        throw new NotFoundException(`Initiator with id ${team} not found`);
    }
    if (!userEntity) {
        throw new NotFoundException(`Initiator with id ${user} not found`);
    }
    portfolio.team = teamEntity;
    portfolio.user = userEntity;
    return this.portfolioRepository.save(portfolio);
  }

  async update(id: number, updatePortfolioDto: UpdatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id } });

    if (!portfolio) {
        throw new NotFoundException(`Project with id ${id} not found`);
    }

    // Обновите поля проекта
    Object.assign(portfolio, updatePortfolioDto);

    return this.portfolioRepository.save(portfolio);
  }

  async remove(id: number): Promise<void> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id } });

    if (!portfolio) {
        throw new NotFoundException(`Project with id ${id} not found`);
    }

    await this.portfolioRepository.remove(portfolio);
  }
}