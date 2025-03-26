export enum Role {
  admin = 'admin',
  user = 'user',
  customer = 'customer',
  expert = 'expert',
  directorate = 'directorate',
}

export enum UserAccountStatus {
  active = 'active',
  pending = 'pending',
  inactive = 'inactive',
}

export enum UserCommandStatus {
  inTeam = 'In the team',
  expelled = 'Expelled',
}
    
export enum StatusProject {
  searchTeam = 'Search for team',
  teamFound = 'Team found',
}
    
export enum StatusIdea {
  new = 'New',
  underEditing = 'Under Editing',
  underApproval = 'Under Approval',
  approved = 'Approved',
  published = 'Published',
}
    
export enum StatusTeam {
  searchProject = 'Поиск проекта (Search for a project)',
  inProgress = 'В процессе работы (In progress)',
  delete = 'На удалении (Delete)',
}
    
export enum PrivacyTeam {
  open = 'Open',
  close = 'Close',
}
    
export enum Competence {
  no = 'No',
  html = 'HTML',
  typescript = 'TypeScript',
  postgresql = 'PostgeSQL',
}

export enum TaskStatus {
  new = 'new',
  inProgress = 'inProgress',
  done = 'done',
}
  
export interface LoginResponseDto {
  access_token: string;
  username: string;
  firstname: string;
  lastname: string;
  roles: Role[];
  userId: number;
}

export interface SignUpRequestDto {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface SignupResponseDto {
  success: boolean;
}

export interface CreateUserDto {
  name: string;
  firstname: string;
  lastname: string;
  password: string;
  roles: Role[];
  status: UserAccountStatus;
}

export interface UpdateUserDto {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  group: string;
  telephone: string;
  roles: Role[];
  status: UserAccountStatus;
  competence: Competence[];
  team_leader: number;
  team_owner: number[];
  portfolio: number[];
  project_initiator: number[];
  team: number;
}

export interface CreateProjectDto {
  name: string;
  problem: string;
  solution: string;
  result: string;
  resource: string;
  stack: Competence[];
  status: StatusProject;
  startProject: Date;
  stopProject: Date;
  maxUsers: string;
  customer: string;
  initiator: number;
}

export interface UpdateProjectDto {
  name?: string;
  problem?: string;
  solution?: string;
  result?: string;
  resource?: string;
  stack?: Competence[];
  status?: StatusProject;
  startProject?: Date;
  stopProject?: Date;
  maxUsers?: string;
  customer?: string;
  initiator?: number;
}

export interface CreateTeamDto {
  name: string,        
  description: string,        
  privacy: PrivacyTeam,      
  status: StatusTeam,
  user_leader: number,
  user: number[],
  project: number,
  user_owner: number,
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  privacy?: PrivacyTeam;
  status?: StatusTeam;
  user_leader?: number | null;
  user?: number[];
  project?: number | null;
  user_owner?: number;
}

export interface CreatePortfolioDto {
  status: UserCommandStatus;
  team: number;
  user: number;
}

export interface UpdatePortfolioDto {
  status: UserCommandStatus;
  team: number;
  user: number;
}

export type SecuredUser = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  group: string;
  telephone: string;
  roles: Role[];
  status: UserAccountStatus;
  competence: Competence[];
  team_leader: TeamDto | null;
  team_owner: TeamDto[];
  portfolio: PortfolioDto[];
  project_initiator: ProjectDto[];
  team: TeamDto | null;
};

export type TaskDto = {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  author: SecuredUser;
  assignee?: any;
};

export type ProjectDto = {
  id: number;
  name: string;
  problem: string;
  solution: string;
  result: string;
  resource: string;
  stack: Competence[]; 
  status: StatusProject; 
  startProject: Date;
  stopProject: Date;
  maxUsers: string;
  teams: TeamDto[];
  customer: string; 
  initiator: SecuredUser; 
};

export interface TeamDto {
  id: number;
  name: string;
  description: string;
  privacy: PrivacyTeam;
  status: StatusTeam;
  user_leader: SecuredUser | null;
  user: SecuredUser[];
  portfolio: PortfolioDto[];
  project: ProjectDto | null;
  user_owner: SecuredUser;
}

export type PortfolioDto = {
  id: number;
  entryDate: Date;
  exclusionDate: Date;
  status: UserCommandStatus;
  team: TeamDto;
  user: SecuredUser;
}

export type CreateUpdateTaskDto = Omit<TaskDto, 'id' | 'createdAt' | 'author'>;