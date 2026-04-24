import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="monitor-container">
      <header class="page-header">
        <h1>Seguimiento de Trámites</h1>
        <p>Listado de procesos en ejecución</p>
      </header>

      <div class="layout">
        <!-- Listado -->
        <div class="list-panel glass-card">
          <table class="minimal-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of tramites" (click)="seleccionarTramite(t)" [class.active]="selectedTramite?.id === t.id">
                <td class="id-text">#{{ t.id.substring(0,6) }}</td>
                <td>{{ t.cliente }}</td>
                <td>
                  <span class="status-dot" [class]="t.estado?.toLowerCase()"></span>
                  {{ t.estado }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Formulario de Acción -->
        <div class="form-panel glass-card animate-pop" *ngIf="selectedTramite">
          <div class="panel-header">
            <h3>{{ currentNode?.nombre }}</h3>
            <p>Por: {{ getDeptoName(currentNode?.departamentoId) }}</p>
          </div>

          <div class="form-body">
            <div *ngFor="let campo of currentNode?.campos" class="form-field">
              <label>{{ campo.etiqueta }}</label>
              <input [(ngModel)]="campo.valor" class="minimal-input" type="text">
            </div>
            
            <div class="report-area">
              <label>Informe/Observaciones:</label>
              <textarea [(ngModel)]="iaReport" placeholder="Escribe aquí el informe del funcionario..."></textarea>
            </div>
          </div>

          <footer class="panel-footer">
            <button class="btn-primary" (click)="completar()">Finalizar Tarea</button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .monitor-container {
      padding: 32px;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header h1 { font-size: 1.5rem; }
    .page-header p { color: var(--text-muted); font-size: 0.875rem; }

    .layout {
      display: flex;
      gap: 24px;
      flex: 1;
      overflow: hidden;
    }

    .list-panel {
      flex: 1;
      overflow-y: auto;
    }

    .form-panel {
      width: 400px;
      display: flex;
      flex-direction: column;
    }

    .minimal-table {
      width: 100%;
      border-collapse: collapse;
    }

    .minimal-table th {
      text-align: left;
      padding: 12px 24px;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
      text-transform: uppercase;
    }

    .minimal-table td {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.875rem;
      cursor: pointer;
    }

    .minimal-table tr:hover { background: #f8fafc; }
    .minimal-table tr.active { background: #eff6ff; }

    .id-text { font-family: monospace; font-weight: 600; color: var(--primary); }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
      background: #cbd5e1;
    }
    .status-dot.en_proceso { background: #eab308; }

    .panel-header { padding: 24px; border-bottom: 1px solid var(--border-color); }
    .panel-header h3 { font-size: 1.1rem; }
    .panel-header p { font-size: 0.75rem; color: var(--text-muted); }

    .form-body { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
    
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .form-field label { font-size: 0.75rem; color: var(--text-muted); }

    .minimal-input {
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }

    .report-area { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
    .report-area label { font-size: 0.75rem; color: var(--text-muted); }
    textarea {
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      height: 120px;
      resize: none;
    }

    .panel-footer { padding: 24px; border-top: 1px solid var(--border-color); }
    .panel-footer .btn-primary { width: 100%; }
  `]
})
export class MonitorComponent implements OnInit {
  private workflowService = inject(WorkflowService);
  tramites: any[] = [];
  selectedTramite: any = null;
  currentNode: any = null;
  iaReport: string = '';

  ngOnInit() { this.loadTramites(); }

  loadTramites() {
    this.workflowService.getTramites().subscribe(data => this.tramites = data);
  }

  seleccionarTramite(t: any) {
    this.selectedTramite = t;
    this.workflowService.getPolicies().subscribe(policies => {
      const p = policies.find(pol => pol.id === t.politicaId);
      this.currentNode = p?.nodos.find((n: any) => n.id === t.nodoActualId);
    });
  }

  getDeptoName(id: string): string {
    const deptos: any = { '1': 'Atención al Cliente', '2': 'Técnico', '3': 'Dirección' };
    return deptos[id] || 'General';
  }

  completar() {
    const datos = this.currentNode.campos.reduce((acc: any, curr: any) => {
      acc[curr.nombre] = curr.valor;
      return acc;
    }, {});

    this.workflowService.completarActividad(this.selectedTramite.id, this.currentNode.id, datos).subscribe(() => {
      alert('Tarea completada');
      this.selectedTramite = null;
      this.loadTramites();
    });
  }
}
