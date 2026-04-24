import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowService } from '../../services/workflow.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <header>
        <h1>Bienvenido, {{ auth.currentUser()?.username }}</h1>
        <p>Panel de control del sistema de gestión de trámites</p>
      </header>
      
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <span class="label">Políticas Creadas</span>
          <span class="value color-blue">{{ policies.length }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">Trámites Activos</span>
          <span class="value color-yellow">{{ tramites.length }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">Completados</span>
          <span class="value color-green">14</span>
        </div>
      </div>
      
      <div class="sections-grid">
        <!-- Listado de Políticas (Para iniciar trámites) -->
        <div class="main-content glass-card">
          <h3>📜 Políticas Disponibles</h3>
          <p class="section-desc">Selecciona una política para iniciar un nuevo trámite</p>
          
          <div class="policies-grid">
            <div *ngFor="let p of policies" class="policy-card glass-card animate-pop">
              <h4>{{ p.nombre }}</h4>
              <p>{{ p.nodos?.length || 0 }} etapas definidas</p>
              <button class="btn-primary btn-small" (click)="iniciar(p)">Iniciar Trámite</button>
            </div>
            <div *ngIf="policies.length === 0" class="empty-state">
              No hay políticas diseñadas aún. Ve al Diseñador para crear la primera.
            </div>
          </div>
        </div>

        <!-- Trámites Recientes -->
        <div class="side-content glass-card">
          <h3>⏳ Trámites en Ejecución</h3>
          <div class="mini-list">
            <div *ngFor="let t of tramites" class="mini-item">
              <span class="id">#{{ t.id }}</span>
              <span class="client">{{ t.cliente }}</span>
              <span class="status">{{ t.estado }}</span>
            </div>
          </div>
        </div>
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
    
    header h1 { font-size: 2rem; margin-bottom: 4px; }
    header p { color: var(--text-muted); }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }
    
    .stat-card { padding: 24px; display: flex; flex-direction: column; gap: 8px; }
    .stat-card .label { color: var(--text-muted); font-size: 0.875rem; }
    .stat-card .value { font-size: 2.5rem; font-weight: 700; }
    
    .color-blue { color: var(--primary); }
    .color-yellow { color: var(--status-yellow); }
    .color-green { color: var(--status-green); }

    .sections-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 24px;
    }
    
    .main-content, .side-content { padding: 24px; }
    
    .section-desc { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 24px; }

    .policies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .policy-card {
      padding: 20px;
      border: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .policy-card h4 { margin: 0; color: var(--primary); }
    .policy-card p { font-size: 0.813rem; color: var(--text-muted); }

    .mini-list { display: flex; flex-direction: column; gap: 12px; }
    .mini-item {
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 0.813rem;
    }
    .mini-item .id { color: var(--accent); font-weight: 600; }

    .animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  `]
})
export class DashboardComponent implements OnInit {
  public auth = inject(AuthService);
  private workflowService = inject(WorkflowService);

  policies: any[] = [];
  tramites: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.workflowService.getPolicies().subscribe(data => this.policies = data);
    this.workflowService.getTramites().subscribe(data => this.tramites = data);
  }

  iniciar(policy: any) {
    const cliente = prompt('Nombre del cliente para el trámite:');
    if (cliente) {
      this.workflowService.iniciarTramite(policy.id, cliente).subscribe(res => {
        alert('Trámite iniciado con éxito!');
        this.loadData();
      });
    }
  }
}
