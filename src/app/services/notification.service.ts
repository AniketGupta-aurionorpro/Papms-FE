import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import {
  NotificationDto,
  UnreadCountResponse
} from "../models/notification.models";

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) { }

  private url = environment.apiUrl + '/notifications';

  getMyNotifications(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.url}`, { params });
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.url}/unread-count`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${notificationId}/read`, {});
  }
}
