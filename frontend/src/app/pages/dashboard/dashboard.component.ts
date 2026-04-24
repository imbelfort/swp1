import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header>
        <h1>Monitor de Trámites</h1>
        <p>Resumen de actividad en tiempo real</p>
      </header>
      
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <span class="label">Pendientes</span>
          <span class="value color-red">12</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">En Proceso</span>
          <span class="value color-yellow">5</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">Atendidos</span>
          <span class="value color-green">48</span>
        </div>
      </div>
      
      <div class="main-content glass-card">
        <h3>Trámites Recientes</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Política</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#TR-001</td>
              <td>Instalación Medidor</td>
              <td>Juan Pérez</td>
              <td><span class="badge yellow">En Proceso</span></td>
              <td><button class="btn-text">Ver detalle</button></td>
            </tr>
            <tr>
              <td>#TR-002</td>
              <td>Cambio Titular</td>
              <td>Maria Garcia</td>
              <td><span class="badge green">Atendido</span></td>
              <td><button class="btn-text">Ver detalle</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      height: 100%;
      overflow-y: auto;
    }
    
    header h1 {
      font-size: 2rem;
      margin-bottom: 4px;
    }
    
    header p {
      color: var(--text-muted);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }
    
    .stat-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .stat-card .label {
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .stat-card .value {
      font-size: 2.5rem;
      font-weight: 700;
    }
    
    .color-red { color: var(--status-red); }
    .color-yellow { color: var(--status-yellow); }
    .color-green { color: var(--status-green); }
    
    .main-content {
      padding: 24px;
      flex: 1;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
    }
    
    .data-table th {
      text-align: left;
      padding: 12px;
      color: var(--text-muted);
      font-weight: 500;
      border-bottom: 1px solid var(--glass-border);
    }
    
    .data-table td {
      padding: 16px 12px;
      border-bottom: 1px solid var(--glass-border);
    }
    
    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge.yellow { background: rgba(234, 179, 8, 0.2); color: var(--status-yellow); }
    .badge.green { background: rgba(34, 197, 94, 0.2); color: var(--status-green); }
    
    .btn-text {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-weight: 500;
    }
  `]
})
export class DashboardComponent {}
