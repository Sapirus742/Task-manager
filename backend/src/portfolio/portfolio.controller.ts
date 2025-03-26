import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreatePortfolioDto, Role, UpdatePortfolioDto } from 'src/common/types';
import { RolesGuard } from 'src/auth/roles.guard';
import { PortfolioService } from './portfolio.service';
import { Portfolio } from 'src/orm/portfolio.entity';


@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Portfolio[]> {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number): Promise<Portfolio> {
    return this.portfolioService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() portfolio: CreatePortfolioDto): Promise<Portfolio> {
    return this.portfolioService.create(
      portfolio.status,
      portfolio.team,
      portfolio.user,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: number, @Body() updatePortfolioDto: UpdatePortfolioDto): Promise<Portfolio> {
      return this.portfolioService.update(id, updatePortfolioDto);
  }

  @Delete(':id')
  @Roles(Role.admin, Role.directorate) 
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: number): Promise<void> {
      return this.portfolioService.remove(id);
  }
}