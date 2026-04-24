import { Injectable, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'FUNCIONARIO' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = signal<{ username: string, role: UserRole } | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );
  
  currentUser = this._currentUser.asReadonly();

  login(role: UserRole) {
    const user = role === 'ADMIN' 
      ? { username: 'Administrador', role: 'ADMIN' } 
      : { username: 'Funcionario 1', role: 'FUNCIONARIO' };
    
    this._currentUser.set(user as any);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem('user');
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
