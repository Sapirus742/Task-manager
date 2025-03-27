import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import {
  Competence,
  LoginResponseDto,
  PortfolioDto,
  ProjectDto,
  Role,
  SecuredUser,
  TeamDto,
  UserAccountStatus,
} from '../../../backend/src/common/types';

export const useMainStore = defineStore('main', () => {
  const state = reactive({
    userId: 0,
    username: 'unknown',
    firstname: 'unknown',
    lastname: 'unknown',
    roles: [] as Role[],
    userStatus: UserAccountStatus,
    group: 'unknown',
    telephone: 'unknown',
    competence: [] as Competence[],
    portfolio: [] as PortfolioDto[],
      team_leader: null as TeamDto | null,
      team_owner: [] as TeamDto[],
      project_initiator: [] as ProjectDto[],
      team: null as TeamDto | null,
  });

  const initAppState = (appState: LoginResponseDto) => {
    state.userId = appState.userId;
    state.username = appState.username;
    state.firstname = appState.firstname;
    state.lastname = appState.lastname;
    state.roles = appState.roles;
  };

  const getCurrentUser = (): SecuredUser => {
    return {
      id: state.userId,
      email: state.username,
      firstname: state.firstname,
      lastname: state.lastname,
      group: state.group,
      telephone: state.telephone,
      roles: state.roles,
      status: UserAccountStatus.active,
      competence: state.competence,
      portfolio: state.portfolio,
      team_leader: state.team_leader,
      team_owner: state.team_owner,
      project_initiator: state.project_initiator,
      team: state.team,
    };
  };

  const isAdmin = () => state.roles.some((r) => r === Role.admin);
  const isCustomer = () => state.roles.some((r) => r === Role.customer);
  const isDirectorate = () => state.roles.some((r) => r === Role.directorate);
  const isExpert = () => state.roles.some((r) => r === Role.expert); // Добавляем проверку для эксперта
  const isUser = () => state.roles.some((r) => r === Role.user); // Добавляем проверку для пользователя

  // Метод для проверки, может ли пользователь создавать проекты
  const canCreateProject = () => {
    return isAdmin() || isCustomer() || isDirectorate();
  };

  // Проверка возможности удаления проекта
  const canDeleteProject = (project?: ProjectDto) => {
    // Если проект не передан, возвращаем false
    if (!project) return false;
    
    // Админ или директорат могут удалять любые проекты
    if (isAdmin() || isDirectorate()) {
      return true;
    }
    
    // Customer может удалять только свои проекты
    if (isCustomer() && project.initiator.id === state.userId) {
      return true;
    }
    
    return false;
  };

  const canCreateTeam = () => {
    return isAdmin() || isDirectorate();
  };

  const canJoinTeam = () => {
    return isAdmin() || isUser()
  }

  const canEditTeam = (team: TeamDto) => {
    return isAdmin() || team.user_owner.id === state.userId;
  };

  const canDeleteTeam = (team: TeamDto) => {
    return isAdmin() || team.user_owner.id === state.userId;
  };

  getUserId: () => state.userId // Добавьте эту строку

  return {
    ...toRefs(state),
    initAppState,
    isAdmin,
    isCustomer,
    isDirectorate,
    isExpert, // Экспортируем метод isExpert
    isUser,   // Экспортируем метод isUser
    canCreateProject,
    canCreateTeam,
    canJoinTeam,
    getCurrentUser,
    canEditTeam,
    canDeleteTeam,
    canDeleteProject,
  };
});