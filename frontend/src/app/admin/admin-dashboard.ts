import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Icon } from '../components/icon';
import { AdminApiService, AdminQuote, AdminStats, QuotePage, QuoteStatus, STATUSES } from './admin-api.service';
import { AdminAuthService } from './admin-auth.service';

const dateFmt = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, Icon],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  private readonly api = inject(AdminApiService);
  protected readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected readonly statuses = STATUSES;
  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly page = signal<QuotePage | null>(null);
  protected readonly loading = signal(true);
  protected readonly listError = signal('');

  protected readonly filterStatus = signal<QuoteStatus | ''>('');
  protected readonly search = signal('');
  protected readonly currentPage = signal(1);

  protected readonly selected = signal<AdminQuote | null>(null);
  protected readonly note = signal('');
  protected readonly saving = signal(false);
  protected readonly saved = signal('');
  protected readonly detailError = signal('');
  protected readonly confirmDelete = signal(false);

  protected readonly noteChanged = computed(() => (this.selected()?.admin_note ?? '') !== this.note());
  protected readonly newCount = computed(() => this.stats()?.by_status.find((s) => s.status === 'new')?.total ?? 0);

  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex' });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.listError.set('');
    this.api.list({ page: this.currentPage(), status: this.filterStatus(), search: this.search() }).subscribe({
      next: (page) => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status !== 401) this.listError.set('Nem sikerült betölteni az ajánlatkéréseket. Próbálja újra.');
      },
    });
    this.api.stats().subscribe({ next: (s) => this.stats.set(s), error: () => {} });
  }

  protected statTotal(status: QuoteStatus): string {
    const found = this.stats()?.by_status.find((s) => s.status === status);
    return found ? String(found.total) : '–';
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }

  protected setStatusFilter(status: QuoteStatus | ''): void {
    this.filterStatus.set(this.filterStatus() === status ? '' : status);
    this.currentPage.set(1);
    this.load();
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.load();
    }, 300);
  }

  protected goTo(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  protected open(quote: AdminQuote): void {
    this.selected.set(quote);
    this.note.set(quote.admin_note ?? '');
    this.saved.set('');
    this.detailError.set('');
    this.confirmDelete.set(false);
  }

  protected close(): void {
    this.selected.set(null);
  }

  protected setStatus(status: QuoteStatus): void {
    const quote = this.selected();
    if (!quote || quote.status === status) return;
    this.persist(quote.id, { status }, 'Állapot mentve');
  }

  protected saveNote(): void {
    const quote = this.selected();
    if (!quote) return;
    this.persist(quote.id, { admin_note: this.note() || null }, 'Jegyzet mentve');
  }

  private persist(id: number, changes: Partial<Pick<AdminQuote, 'status' | 'admin_note'>>, message: string): void {
    this.saving.set(true);
    this.saved.set('');
    this.detailError.set('');
    this.api.update(id, changes).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.saved.set(message);
        this.selected.set(updated);
        this.note.set(updated.admin_note ?? '');
        this.page.update((p) => (p ? { ...p, data: p.data.map((q) => (q.id === id ? updated : q)) } : p));
        this.api.stats().subscribe({ next: (s) => this.stats.set(s), error: () => {} });
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.detailError.set(err.error?.message ?? 'A mentés nem sikerült. Próbálja újra.');
      },
    });
  }

  protected download(): void {
    const quote = this.selected();
    if (!quote?.has_document) return;
    this.api.document(quote.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = quote.document_name ?? 'dokumentum';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => this.detailError.set('A dokumentum nem tölthető le. Lehet, hogy törölték a szerverről.'),
    });
  }

  protected remove(): void {
    const quote = this.selected();
    if (!quote) return;
    this.api.remove(quote.id).subscribe({
      next: () => {
        this.selected.set(null);
        this.load();
      },
      error: () => this.detailError.set('A törlés nem sikerült. Próbálja újra.'),
    });
  }

  protected replyLink(quote: AdminQuote): string {
    const pair = [quote.source_language, quote.target_language].filter(Boolean).join(' → ');
    const subject = `Árajánlat${pair ? ' – ' + pair + ' fordítás' : ''}`;
    const body = `Kedves ${quote.name}!\n\nKöszönjük az ajánlatkérését.\n\n`;
    return `mailto:${quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  protected date(iso: string): string {
    return dateFmt.format(new Date(iso));
  }

  protected ago(iso: string): string {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return 'most';
    if (minutes < 60) return `${minutes} perce`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} órája`;
    return `${Math.round(hours / 24)} napja`;
  }

  protected pair(quote: AdminQuote): string {
    if (!quote.source_language && !quote.target_language) return '–';
    return `${quote.source_language || '?'} → ${quote.target_language || '?'}`;
  }
}
