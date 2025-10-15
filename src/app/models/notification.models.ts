export interface NotificationDto {
  id: number;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
