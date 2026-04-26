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

        <!-- Panel Lateral -->
        <div class="form-panel glass-card animate-pop" *ngIf="selectedTramite">
          
          <!-- Formulario de Acción (Si no ha finalizado) -->
          <ng-container *ngIf="selectedTramite.estado !== 'FINALIZADO' && currentNode">
            <div class="panel-header">
              <h3>{{ currentNode?.nombre }}</h3>
              <p>Por: {{ getDeptoName(currentNode?.departamentoId) }}</p>
            </div>

            <div class="form-body">
              <div *ngFor="let campo of currentNode?.campos" class="form-field">
                <label>{{ campo.etiqueta }}</label>
                
                <ng-container [ngSwitch]="campo.tipo">
                  <select *ngSwitchCase="'SELECCION'" [(ngModel)]="campo.valor" class="minimal-input">
                    <option *ngFor="let opt of campo.opciones" [value]="opt">{{ opt }}</option>
                  </select>
                  
                  <input *ngSwitchCase="'FOTO'" type="file" class="minimal-input">
                  
                  <input *ngSwitchCase="'NUMERO'" type="number" [(ngModel)]="campo.valor" class="minimal-input">
                  
                  <input *ngSwitchDefault type="text" [(ngModel)]="campo.valor" class="minimal-input">
                </ng-container>
              </div>
              
              <div class="report-area">
                <label>Informe/Observaciones:</label>
                <textarea [(ngModel)]="iaReport" placeholder="Escribe aquí el informe del funcionario..."></textarea>
              </div>
            </div>

            <footer class="panel-footer">
              <button class="btn-primary" (click)="completar()">Finalizar Tarea</button>
            </footer>
          </ng-container>

          <!-- Historial (Si finalizó) -->
          <ng-container *ngIf="selectedTramite.estado === 'FINALIZADO'">
            <div class="panel-header">
              <h3>Trámite Finalizado</h3>
              <p>Detalles del flujo completado</p>
            </div>
            
            <div class="form-body history-body">
              <div *ngIf="!selectedTramite.historial || selectedTramite.historial.length === 0" class="empty-history">
                No hay detalles guardados para este trámite.
              </div>
              
              <div *ngFor="let log of selectedTramite.historial" class="history-item">
                <div class="history-header">
                  <h4>{{ log.nombreNodo }}</h4>
                  <span class="date">{{ log.fechaCompletado | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                
                <div *ngIf="log.datosFormulario?.length" class="history-fields">
                  <div *ngFor="let c of log.datosFormulario" class="hist-field">
                    <span class="lbl">{{ c.etiqueta }}:</span> <span class="val">{{ c.valor || 'N/A' }}</span>
                  </div>
                </div>
                
                <div *ngIf="log.informeIA" class="history-report">
                  <span class="lbl">Observaciones:</span>
                  <p>{{ log.informeIA }}</p>
                </div>
              </div>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .monitor-container { padding: 32px; height: 100%; display: flex; flex-direction: column; gap: 24px; }
    .page-header h1 { font-size: 1.5rem; }
    .page-header p { color: var(--text-muted); font-size: 0.875rem; }
    .layout { display: flex; gap: 24px; flex: 1; overflow: hidden; }
    .list-panel { flex: 1; overflow-y: auto; }
    .form-panel { width: 400px; display: flex; flex-direction: column; }
    .minimal-table { width: 100%; border-collapse: collapse; }
    .minimal-table th { text-align: left; padding: 12px 24px; font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-transform: uppercase; }
    .minimal-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-color); font-size: 0.875rem; cursor: pointer; }
    .minimal-table tr:hover { background: #f8fafc; }
    .minimal-table tr.active { background: #eff6ff; }
    .id-text { font-family: monospace; font-weight: 600; color: var(--primary); }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; background: #cbd5e1; }
    .status-dot.en_proceso { background: #eab308; }
    .status-dot.finalizado { background: #22c55e; }
    .panel-header { padding: 24px; border-bottom: 1px solid var(--border-color); }
    .panel-header h3 { font-size: 1.1rem; }
    .panel-header p { font-size: 0.75rem; color: var(--text-muted); }
    .form-body { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .form-field label { font-size: 0.75rem; color: var(--text-muted); }
    .minimal-input { padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; }
    .report-area { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
    .report-area label { font-size: 0.75rem; color: var(--text-muted); }
    textarea { padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; height: 120px; resize: none; }
    .panel-footer { padding: 24px; border-top: 1px solid var(--border-color); }
    .panel-footer .btn-primary { width: 100%; }
    
    /* History Styles */
    .history-item { background: #f8fafc; border-radius: 6px; padding: 16px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 8px; border-left: 3px solid var(--primary); }
    .history-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .history-header h4 { font-size: 0.9rem; margin: 0; color: var(--text-main); }
    .history-header .date { font-size: 0.7rem; color: var(--text-muted); }
    .history-fields { display: flex; flex-direction: column; gap: 4px; font-size: 0.813rem; }
    .hist-field { background: white; padding: 6px 10px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .lbl { font-weight: 600; color: var(--text-muted); margin-right: 6px; font-size: 0.75rem; }
    .val { color: var(--text-main); }
    .history-report { background: white; padding: 10px; border-radius: 4px; border: 1px dashed #cbd5e1; }
    .history-report p { font-size: 0.813rem; color: var(--text-main); margin-top: 4px; font-style: italic; }
    .empty-history { font-size: 0.875rem; color: var(--text-muted); text-align: center; margin-top: 24px; }
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
    this.workflowService.getTramites().subscribe(data => {
      this.tramites = data;
      // Refresh selected tramite if it exists
      if (this.selectedTramite) {
        const updated = this.tramites.find(t => t.id === this.selectedTramite.id);
        if (updated) {
          this.seleccionarTramite(updated);
        }
      }
    });
  }

  seleccionarTramite(t: any) {
    this.selectedTramite = t;
    this.iaReport = '';
    
    if (t.estado !== 'FINALIZADO') {
      this.workflowService.getPolicies().subscribe(policies => {
        const p = policies.find(pol => pol.id === t.politicaId);
        this.currentNode = p?.nodos.find((n: any) => n.id === t.nodoActualId);
      });
    } else {
      this.currentNode = null;
    }
  }

  getDeptoName(id: string): string {
    const deptos: any = { '1': 'Atención al Cliente', '2': 'Técnico', '3': 'Dirección' };
    return deptos[id] || 'General';
  }

  completar() {
    const variables = this.currentNode.campos ? this.currentNode.campos.reduce((acc: any, curr: any) => {
      acc[curr.nombre] = curr.valor;
      return acc;
    }, {}) : {};

    const extraData = {
      variables: variables,
      nombreNodo: this.currentNode.nombre,
      campos: this.currentNode.campos || [],
      informeIA: this.iaReport
    };

    this.workflowService.completarActividad(this.selectedTramite.id, this.currentNode.id, extraData).subscribe(() => {
      alert('Tarea completada');
      this.loadTramites();
    });
  }
}
