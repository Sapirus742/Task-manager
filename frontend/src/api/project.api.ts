import { api } from './axios';
import { CreateProjectDto, ProjectDto, UpdateProjectDto} from '../../../backend/src/common/types';

export async function getAll(): Promise<ProjectDto[]> {
  const response = await api.get('/project');
  if (response.status == 200) {
    return response.data;
  }
  return [];
}

export async function get(id: number): Promise<ProjectDto | undefined> {
  const response = await api.get('/project/' + id);
  if (response.status == 200) {
    return response.data;
  }
  return;
}

export async function create(
  newProject: CreateProjectDto
): Promise<ProjectDto | undefined> {
  const response = await api.post('/project', newProject);
  if (response.status == 201) {
    return response.data;
  }
  return;
}

export async function update(id: number, payload: UpdateProjectDto): Promise<ProjectDto | undefined> {
  try {
    if (!id) {
      throw new Error('ID проекта не указан');
    }
    
    console.log('[API] PATCH /project/' + id, payload);
    const response = await api.patch(`/project/${id}`, payload);
    
    if (response.status === 200) {
      console.log('[API] Проект обновлен:', response.data);
      return response.data;
    }
    throw new Error(response.data?.message || 'Ошибка обновления проекта');
  } catch (error) {
    console.error('[API] Ошибка запроса:', error);
    throw error;
  }
}

export async function remove(id: number): Promise<ProjectDto | undefined> {
  const response = await api.delete('/project/' + id);
  if (response.status == 200) {
    return response.data;
  }
  return;
  
}