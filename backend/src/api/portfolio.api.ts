import { api } from './axios';
import { CreatePortfolioDto, CreateProjectDto, PortfolioDto, ProjectDto, UpdatePortfolioDto, UpdateProjectDto} from '../../../backend/src/common/types';

export async function getAll(): Promise<PortfolioDto[]> {
  const response = await api.get('/portfolio');
  if (response.status == 200) {
    return response.data;
  }
  return [];
}

export async function get(id: number): Promise<PortfolioDto | undefined> {
  const response = await api.get('/portfolio/' + id);
  if (response.status == 200) {
    return response.data;
  }
  return;
}

export async function create(
  newPortfolio: CreatePortfolioDto
): Promise<PortfolioDto | undefined> {
  const response = await api.post('/portfolio', newPortfolio);
  if (response.status == 201) {
    return response.data;
  }
  return;
}

export async function update(
  id: number,
  payload: UpdatePortfolioDto
): Promise<PortfolioDto | undefined> {
  const response = await api.patch('/portfolio/' + id, payload);
  if (response.status == 200) {
    return response.data;
  }
  return;
}

export async function remove(id: number): Promise<PortfolioDto | undefined> {
  const response = await api.delete('/portfolio/' + id);
  if (response.status == 200) {
    return response.data;
  }
  return;
}