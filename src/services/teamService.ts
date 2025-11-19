import api from './api';

// ✅ Define types directly instead of importing/re-exporting
export interface Team {
    teamID: number;
    teamCode: string;
    teamName: string;
    description?: string;
    category?: string;
    schoolID: number;
    teacherID?: number;
    teacherName?: string;
    isActive: boolean;
    createdDate: Date;
    updatedDate?: Date;
}

export interface CreateTeamDto {
    teamCode: string;
    teamName: string;
    description?: string;
    category?: string;
    teacherID?: number;
}

export interface UpdateTeamDto {
    teamName?: string;
    description?: string;
    category?: string;
    teacherID?: number;
    isActive?: boolean;
}

export interface TeamMember {
    memberID: number;
    teamID: number;
    studentID: number;
    studentName: string;
    studentCode: string;
    className?: string;
    role?: string;
    joinDate: Date;
    isActive: boolean;
}

export interface AddTeamMembersDto {
    studentIds: number[];
}

class TeamService {
    async getAllTeams(activeOnly: boolean = true): Promise<Team[]> {
        const response = await api.get(`/team?activeOnly=${activeOnly}`);
        return response.data.data;
    }

    async getTeam(id: number): Promise<Team> {
        const response = await api.get(`/team/${id}`);
        return response.data.data;
    }

    async createTeam(data: CreateTeamDto): Promise<Team> {
        const response = await api.post('/team', data);
        return response.data.data;
    }

    async updateTeam(id: number, data: UpdateTeamDto): Promise<void> {
        await api.put(`/team/${id}`, data);
    }

    async deleteTeam(id: number): Promise<void> {
        await api.delete(`/team/${id}`);
    }

    async getMembers(teamId: number): Promise<TeamMember[]> {
        const response = await api.get(`/team/${teamId}/members`);
        return response.data.data;
    }

    async addMembers(teamId: number, studentIds: number[]): Promise<void> {
        await api.post(`/team/${teamId}/members`, { studentIds });
    }

    async removeMember(teamId: number, studentId: number): Promise<void> {
        await api.delete(`/team/${teamId}/members/${studentId}`);
    }

    async updateMemberRole(teamId: number, studentId: number, role: string): Promise<void> {
        await api.put(`/team/${teamId}/members/${studentId}`, { role });
    }
}

export const teamService = new TeamService();