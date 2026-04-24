import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" *ngIf="auth.isAuthenticated()">
      <div class="brand">
        <div class="dot"></div>
        <span>SWP1</span>
      </div>
      
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</a>
        <a *ngIf="auth.isAdmin()" routerLink="/designer" routerLinkActive="active">🎨 Diseñador</a>
        <a *ngIf="auth.isFuncionario()" routerLink="/monitor" routerLinkActive="active">👁️ Monitor</a>
      </nav>
      
      <div class="user-profile">
        <div class="user-meta">
          <p class="name">{{ auth.currentUser()?.username }}</p>
          <p class="role">{{ auth.currentUser()?.role }}</p>
        </div>
        <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: #ffffff;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 32px 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      margin-bottom: 40px;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      background: var(--primary);
      border-radius: 50%;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    nav a {
      padding: 12px 16px;
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    nav a:hover {
      background: #f1f5f9;
      color: var(--text-main);
    }

    nav a.active {
      background: #eff6ff;
      color: var(--primary);
      font-weight: 600;
    }

    .user-profile {
      padding: 16px;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .name { font-size: 0.875rem; font-weight: 600; }
    .role { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

    .logout-btn {
      background: none;
      border: 1px solid #fee2e2;
      color: #ef4444;
      padding: 6px;
      font-size: 0.75rem;
    }

    .logout-btn:hover { background: #fef2f2; }
  `]
})
export class SidebarComponent {
  public auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
