import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { DocumentResponseDto } from "../models/document.models";

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl + '/api/organizations';

  approveDocument(organizationId: number, documentId: number): Observable<DocumentResponseDto> {
    return this.http.put<DocumentResponseDto>(
      `${this.baseUrl}/${organizationId}/documents/${documentId}/approve`,
      {}
    );
  }

  rejectDocument(organizationId: number, documentId: number): Observable<DocumentResponseDto> {
    return this.http.put<DocumentResponseDto>(
      `${this.baseUrl}/${organizationId}/documents/${documentId}/reject`,
      {}
    );
  }

  // NEW: Get proxy URL for document content (bypasses Cloudinary 401)
  getDocumentContentUrl(organizationId: number, documentId: number): string {
    return `${this.baseUrl}/${organizationId}/documents/${documentId}/content`;
  }
}
