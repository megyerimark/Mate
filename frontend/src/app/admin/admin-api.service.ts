import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type QuoteStatus = 'new' | 'in_progress' | 'quoted' | 'won' | 'lost';

export interface AdminQuote {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  deadline: string;
  deadline_label: string;
  source_language: string | null;
  target_language: string | null;
  message: string | null;
  admin_note: string | null;
  status: QuoteStatus;
  status_label: string;
  document_name: string | null;
  has_document: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuotePage {
  data: AdminQuote[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null };
}

export interface AdminStats {
  total: number;
  this_month: number;
  by_status: { status: QuoteStatus; label: string; total: number }[];
}

/** Az admin felület sorrendje és címkéi; a backend ugyanezeket a kulcsokat fogadja el. */
export const STATUSES: { value: QuoteStatus; label: string }[] = [
  { value: 'new', label: 'Új' },
  { value: 'in_progress', label: 'Folyamatban' },
  { value: 'quoted', label: 'Ajánlat elküldve' },
  { value: 'won', label: 'Megrendelve' },
  { value: 'lost', label: 'Elmaradt' },
];

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/admin`;

  list(filters: { page: number; status: QuoteStatus | ''; search: string }): Observable<QuotePage> {
    let params = new HttpParams().set('page', filters.page);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search.trim()) params = params.set('search', filters.search.trim());
    return this.http.get<QuotePage>(`${this.base}/quote-requests`, { params });
  }

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/stats`);
  }

  update(id: number, changes: Partial<Pick<AdminQuote, 'status' | 'admin_note'>>): Observable<AdminQuote> {
    return this.http.patch<{ data: AdminQuote }>(`${this.base}/quote-requests/${id}`, changes).pipe(map((r) => r.data));
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/quote-requests/${id}`);
  }

  document(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/quote-requests/${id}/document`, { responseType: 'blob' });
  }
}
