import { Injectable, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'FUNCIONARIO' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = signal<{ username: string, role: UserRole } | null>(null);
  
  currentUser = this._currentUser.asReadonly();

  login(role: UserRole) {
    if (role === 'ADMIN') {
      this._currentUser.set({ username: 'Administrador', role: 'ADMIN' });
    } else {
      this._currentUser.set({ username: 'Funcionario 1', role: 'FUNCIONARIO' });
    }
  }

  logout() {
    this._currentUser.set(null);
  }

  isAdmin() {
    return this._currentUser()?.role === 'ADMIN';
  }

  isFuncionario() {
    return this._currentUser()?.role === 'FUNCIONARIO';
  }

  isAuthenticated() {
    return this._currentUser() !== null;
  }
}
