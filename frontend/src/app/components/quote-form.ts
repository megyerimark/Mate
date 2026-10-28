import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService, ValidationErrorResponse } from '../services/quote.service';
import { ACCEPTED_FILES, DEADLINES, LANGUAGES, MAX_FILE_MB } from '../site.config';

@Component({
  selector: 'app-quote-form',
  imports: [ReactiveFormsModule],
  templateUrl: './quote-form.html',
})
export class QuoteForm {
  private readonly fb = inject(FormBuilder);
  private readonly quotes = inject(QuoteService);
  private readonly router = inject(Router);

  protected readonly deadlines = DEADLINES;
  protected readonly languages = LANGUAGES;
  protected readonly accept = ACCEPTED_FILES;
  protected readonly maxMb = MAX_FILE_MB;

  protected readonly sending = signal(false);
  protected readonly file = signal<File | null>(null);
  protected readonly fileError = signal('');
  protected readonly serverErrors = signal<Record<string, string>>({});
  protected readonly generalError = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    deadline: ['normal'],
    source_language: [''],
    target_language: [''],
    message: ['', Validators.maxLength(5000)],
    privacy_accepted: [false, Validators.requiredTrue],
    website: [''],
  });

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const chosen = input.files?.[0] ?? null;
    this.fileError.set('');
    if (chosen && chosen.size > MAX_FILE_MB * 1024 * 1024) {
      this.fileError.set(`A fájl túl nagy (max. ${MAX_FILE_MB} MB). Kérjük, küldje e-mailben.`);
      input.value = '';
      this.file.set(null);
      return;
    }
    this.file.set(chosen);
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return (control.invalid && control.touched) || !!this.serverErrors()[name];
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.serverErrors.set({});
    this.generalError.set('');

    this.quotes.send(this.form.getRawValue(), this.file()).subscribe({
      next: () => this.router.navigateByUrl('/koszonjuk'),
      error: (err: HttpErrorResponse) => {
        this.sending.set(false);
        if (err.status === 422) {
          const body = err.error as ValidationErrorResponse;
          const flat: Record<string, string> = {};
          for (const [key, messages] of Object.entries(body.errors ?? {})) flat[key] = messages[0];
          this.serverErrors.set(flat);
        } else if (err.status === 429) {
          this.generalError.set('Túl sok próbálkozás. Kérjük, várjon egy percet, vagy hívjon minket.');
        } else {
          this.generalError.set('Valami hiba történt a küldés közben. Kérjük, próbálja újra, vagy írjon e-mailt.');
        }
      },
    });
  }
}
