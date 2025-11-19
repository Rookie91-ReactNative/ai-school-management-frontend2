import api from './api';

// ✅ Define types directly instead of importing/re-exporting
export enum EventType {
    Sports = 0,
    Academic = 1,
    Cultural = 2,
    Trip = 3,
    Other = 4
}

export interface ActivityEvent {
    eventID: number;
    eventCode: string;
    eventName: string;
    eventType: EventType;
    description?: string;
    venue?: string;
    startDate: Date;
    endDate: Date;
    teacherID?: number;
    schoolID: number;
    isActive: boolean;
    createdDate: Date;
    updatedDate?: Date;
}

export interface CreateEventDto {
    eventCode: string;
    eventName: string;
    eventType: EventType;
    description?: string;
    venue?: string;
    startDate: string;
    endDate: string;
    teacherID?: number;
}

export interface UpdateEventDto {
    eventName?: string;
    eventType?: EventType;
    description?: string;
    venue?: string;
    startDate?: string;
    endDate?: string;
    teacherID?: number;
    isActive?: boolean;
}

export interface EventParticipant {
    participantID: number;
    eventID: number;
    studentID: number;
    studentName: string;
    studentCode: string;
    role?: string;
    registrationDate: Date;
}

class EventService {
    async getAllEvents(activeOnly: boolean = true): Promise<ActivityEvent[]> {
        const response = await api.get(`/activityevent?activeOnly=${activeOnly}`);
        return response.data.data;
    }

    async getEvent(id: number): Promise<ActivityEvent> {
        const response = await api.get(`/activityevent/${id}`);
        return response.data.data;
    }

    async createEvent(data: CreateEventDto): Promise<ActivityEvent> {
        const response = await api.post('/activityevent', data);
        return response.data.data;
    }

    async updateEvent(id: number, data: UpdateEventDto): Promise<void> {
        await api.put(`/activityevent/${id}`, data);
    }

    async deleteEvent(id: number): Promise<void> {
        await api.delete(`/activityevent/${id}`);
    }

    async getParticipants(eventId: number): Promise<EventParticipant[]> {
        const response = await api.get(`/activityevent/${eventId}/participants`);
        return response.data.data;
    }

    async addParticipants(eventId: number, studentIds: number[]): Promise<void> {
        await api.post(`/activityevent/${eventId}/participants`, { studentIds });
    }

    async removeParticipant(eventId: number, studentId: number): Promise<void> {
        await api.delete(`/activityevent/${eventId}/participants/${studentId}`);
    }
}

export const eventService = new EventService();