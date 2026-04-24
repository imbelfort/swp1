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
      <div class="logo">
        <div class="logo-icon"></div>
        <span>SWP1 Workflow</span>
      </div>
      
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">
          <i class="icon">📊</i> Dashboard
        </a>
        
        <!-- Solo Admin -->
        <a *ngIf="auth.isAdmin()" routerLink="/designer" routerLinkActive="active">
          <i class="icon">🎨</i> Diseñador
        </a>
        
        <!-- Solo Funcionario -->
        <a *ngIf="auth.isFuncionario()" routerLink="/monitor" routerLinkActive="active">
          <i class="icon">👁️</i> Monitor de Trámites
        </a>
      </nav>
      
      <div class="footer">
        <div class="user-info">
          <div class="avatar">{{ auth.currentUser()?.username?.[0] }}</div>
          <div class="details">
            <span class="name">{{ auth.currentUser()?.username }}</span>
            <span class="role">{{ auth.currentUser()?.role }}</span>
          </div>
        </div>
        <button (click)="logout()" class="btn-logout">
          <i>🚪</i> Cerrar Sesión
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100dvh;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      padding: 24px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 48px;
      color: var(--primary);
    }
    
    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 8px;
    }
    
    nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    
    nav a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      text-decoration: none;
      color: var(--text-muted);
      border-radius: 12px;
      transition: all 0.2s;
    }
    
    nav a:hover {
      background: var(--glass);
      color: var(--text-main);
    }
    
    nav a.active {
      background: var(--primary-glow);
      color: var(--primary);
      font-weight: 500;
    }
    
    .footer {
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .details {
      display: flex;
      flex-direction: column;
    }

    .name {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .role {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .btn-logout {
      background: transparent;
      border: 1px solid var(--glass-border);
      color: var(--status-red);
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.813rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--status-red);
    }
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
