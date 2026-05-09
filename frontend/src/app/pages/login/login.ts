import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PrimaryButton } from '../../_components/primary-button/primary-button';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoggerService } from '../../services/logger.service';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PrimaryButton],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnDestroy {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private logger: LoggerService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, CustomValidators.emailOuCnpj]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, senha } = this.loginForm.value;

    this.authService
      .login(email, senha)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.logger.log('Redirecionando para dashboard');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = this.errorHandler.handleAuthError(err);
          this.logger.error('Erro no login', err);
        },
      });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  getEmailErrorMessage(): string {
    const email = this.loginForm.get('email');
    if (email?.hasError('required')) {
      return 'O e-mail ou CNPJ é obrigatório.';
    }
    if (email?.hasError('emailOuCnpjInvalido')) {
      return 'Digite um e-mail ou CNPJ válido.';
    }
    if (email?.hasError('cnpjInvalido')) {
      return 'CNPJ inválido. Verifique os dígitos.';
    }
    return '';
  }

  getSenhaErrorMessage(): string {
    const senha = this.loginForm.get('senha');
    if (senha?.hasError('required')) {
      return 'A senha é obrigatória.';
    }
    if (senha?.hasError('minlength')) {
      return 'A senha deve ter no mínimo 6 caracteres.';
    }
    return '';
  }
}
