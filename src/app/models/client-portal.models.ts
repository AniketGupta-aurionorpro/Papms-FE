/**
 * Client Portal Models
 * Models for client onboarding, management, and portal operations
 */

export enum ClientStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

export interface ClientDto {
    id: number;
    userId: number;
    username: string;
    organizationId: number;
    organizationName: string;
    clientName: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
    balance: number;
    status: ClientStatus;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardClientRequest {
    clientName: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
}
