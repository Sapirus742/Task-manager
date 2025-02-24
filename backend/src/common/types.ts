export enum Role {

    admin = 'admin',
  
    user = 'user',
  
  }
  
   
  
  export enum UserAccountStatus {
  
    active = 'active',
  
    pending = 'pending',
  
    inactive = 'inactive',
  
  }
  
  export interface LoginResponseDto {
    userId: number;
  
    access_token: string;
  
    username: string;
  
    firstname: string;
  
    lastname: string;
  
    roles: Role[];
  
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
  
   
  
  export type UpdateUserDto = Omit<CreateUserDto, 'password'>;
  
   
  
  export type SecuredUser = {
  
    id: number;
  
    name: string;
  
    firstname: string;
  
    lastname: string;
  
    roles: Role[];
  
    status: UserAccountStatus;
  
  };

  export enum TaskStatus {

    new = 'new',
  
    inProgress = 'inProgress',
  
    done = 'done',
  
  }
  
   
  
  export type TaskDto = {
  
    id: number;
  
    title: string;
  
    status: TaskStatus;
  
    createdAt: Date;
  
    author: SecuredUser;

    assignee?: any;
  
  };
  
   
  
  export type CreateUpdateTaskDto = Omit<TaskDto, 'id' | 'createdAt' | 'author'>;