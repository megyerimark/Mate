import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QuoteRequestPayload {
  name: string;
  email: string;
  phone: string;
  deadline: string;
  source_language: string;
  target_language: string;
  message: string;
  privacy_accepted: boolean;
  website: string; // honeypot, embernek üres marad
}

/** Laravel validációs hiba válasza (422). */
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);

  send(payload: QuoteRequestPayload, file: File | null): Observable<{ message: string }> {
    const body = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      body.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
    }
    if (file) body.append('document', file);
    return this.http.post<{ message: string }>(`${environment.apiUrl}/api/quote-requests`, body);
  }
}
