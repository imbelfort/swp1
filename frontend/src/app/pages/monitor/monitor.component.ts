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
                <th>Tiempo</th>
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
                <td style="font-weight: 600; color: #475569;">{{ getTiempoTotalTramite(t) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Botón para ver detalles (Modal) -->
        <div class="form-panel glass-card animate-pop" *ngIf="selectedTramite">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px;">
            <div>
              <h4 style="margin: 0; color: var(--text-muted); font-size: 0.75rem;">TRÁMITE</h4>
              <h3 style="margin: 2px 0 0 0; font-size: 1rem;">#{{ selectedTramite.id.substring(0,8) }}</h3>
            </div>
            <button class="btn-primary" (click)="openModal()" style="padding: 6px 12px; font-size: 0.75rem;">👁️ Ver Avance</button>
          </div>
          
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

              <!-- Selector de Decisión / Outcome -->
              <div class="form-field" *ngIf="getAvailableOutcomes().length > 0">
                <label style="font-weight: 600; color: var(--primary); font-size: 0.875rem;">Tomar Decisión / Ruta:</label>
                <div class="decision-radios" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                  <label *ngFor="let opt of getAvailableOutcomes()" class="radio-card" [class.selected]="selectedOutcome === opt">
                    <input type="radio" [(ngModel)]="selectedOutcome" [value]="opt" name="decisionOutcome" style="display: none;">
                    <div class="radio-content">
                      <span class="radio-circle"></span>
                      <span style="font-weight: 600; color: #1e293b;">{{ opt }}</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Botón Finalizar normal (Si no hay opciones de decisión) -->
              <div class="form-field" *ngIf="getAvailableOutcomes().length === 0">
                <label style="font-weight: 600; color: #475569;">Decisión Manual (Dejar en blanco si no aplica):</label>
                <input [(ngModel)]="selectedOutcome" placeholder="Ej: SI / NO" class="minimal-input" style="border: 1px solid #cbd5e1;">
              </div>
              
              <div class="report-area">
                <label>Informe/Observaciones:</label>
                <textarea [(ngModel)]="iaReport" placeholder="Escribe aquí el informe del funcionario..."></textarea>
              </div>
            </div>

            <footer class="panel-footer">
              <button class="btn-primary" (click)="completar()" [disabled]="getAvailableOutcomes().length > 0 && !selectedOutcome">
                {{ getAvailableOutcomes().length > 0 ? 'Finalizar y Enviar' : 'Finalizar Tarea' }}
              </button>
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

      <!-- Modal de Avance y Detalles -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content glass-card animate-pop" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h3>Trámite de {{ selectedTramite?.cliente }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </header>

          <div class="modal-body-scroll">
            
            <!-- Ruta del Proceso -->
            <div class="modal-section">
              <h4 class="section-title">Ruta del Trámite</h4>
              <div class="flow-steps">
                <div *ngFor="let node of policyNodes" class="flow-step" 
                     [class.completed]="isNodeCompleted(node.id)"
                     [class.current]="selectedTramite.nodoActualId === node.id">
                  <div class="step-icon">
                    <span *ngIf="node.tipo === 'INICIO'">⭕</span>
                    <span *ngIf="node.tipo === 'ACTIVIDAD'">⏹️</span>
                    <span *ngIf="node.tipo === 'DECISION'">🔶</span>
                    <span *ngIf="node.tipo === 'FIN'">🏁</span>
                  </div>
                  <div class="step-info">
                    <span class="step-name">{{ node.nombre }}</span>
                    <span class="step-dept">{{ getDeptoName(node.departamentoId) }}</span>
                    <span class="step-duration" *ngIf="isNodeCompleted(node.id)">⏱️ Tiempo: {{ getDuracionNodo(node.id) }}</span>
                  </div>
                  <span class="step-status">
                    {{ isNodeCompleted(node.id) ? 'Completado' : (selectedTramite.nodoActualId === node.id ? 'En Proceso' : 'Pendiente') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Datos Llenados -->
            <div class="modal-section mt-4">
              <h4 class="section-title">Datos Registrados</h4>
              <div *ngIf="!selectedTramite.historial || selectedTramite.historial.length === 0" class="empty-history">
                No se han llenado datos todavía.
              </div>
              <div class="history-grid" *ngIf="selectedTramite.historial?.length">
                <div *ngFor="let log of selectedTramite.historial" class="history-item">
                  <div class="history-header">
                    <h4>{{ log.nombreNodo }}</h4>
                    <span class="date">{{ log.fechaCompletado | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <div *ngIf="log.datosFormulario?.length" class="history-fields">
                    <div *ngFor="let c of log.datosFormulario" class="hist-field">
                      <span class="lbl">{{ c.etiqueta }}:</span> <span class="val">{{ c.valor || 'N/A' }}</span>
                    </div>
                  </div>
                  <div *ngIf="log.informeIA" class="history-report">
                    <span class="lbl">Informe:</span>
                    <p>{{ log.informeIA }}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
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
    .panel-footer .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }
    
    .radio-card { display: block; border: 2px solid #e2e8f0; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; background: white; }
    .radio-card:hover { border-color: #cbd5e1; background: #f8fafc; }
    .radio-card.selected { border-color: var(--primary); background: #eff6ff; }
    .radio-content { display: flex; align-items: center; gap: 12px; }
    .radio-circle { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1; display: inline-block; position: relative; }
    .radio-card.selected .radio-circle { border-color: var(--primary); }
    .radio-card.selected .radio-circle::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; border-radius: 50%; background: var(--primary); }
    
    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
    .modal-content { background: white; width: 650px; max-height: 85vh; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid var(--border-color); }
    .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--text-main); }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; line-height: 1; }
    .close-btn:hover { color: #ef4444; }
    .modal-body-scroll { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .section-title { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.05em; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }

    /* Modal Process Tracker Steps */
    .flow-steps { display: flex; flex-direction: column; gap: 12px; }
    .flow-step { display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1px solid var(--border-color); padding: 10px 16px; border-radius: 8px; border-left: 4px solid #cbd5e1; }
    .flow-step.completed { border-left-color: #22c55e; background: #f0fdf4; }
    .flow-step.current { border-left-color: #eab308; background: #fefce8; }
    .step-icon { font-size: 1.25rem; }
    .step-info { display: flex; flex-direction: column; flex: 1; }
    .step-name { font-size: 0.875rem; font-weight: 600; color: var(--text-main); }
    .step-dept { font-size: 0.75rem; color: var(--text-muted); }
    .step-duration { font-size: 0.7rem; font-weight: 600; color: var(--primary); margin-top: 2px; }
    .step-status { font-size: 0.75rem; font-weight: 600; padding: 4px 8px; border-radius: 12px; background: #e2e8f0; color: #64748b; }
    .completed .step-status { background: #dcfce7; color: #166534; }
    .current .step-status { background: #fef9c3; color: #713f12; }
    
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
  policyNodes: any[] = [];
  policyConnections: any[] = [];
  selectedOutcome: string = '';
  iaReport: string = '';
  showModal: boolean = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

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
    this.policyNodes = [];
    
    this.workflowService.getPolicies().subscribe(policies => {
      const p = policies.find(pol => pol.id === t.politicaId);
      this.policyNodes = p?.nodos || [];
      this.policyConnections = p?.conexiones || [];
      this.selectedOutcome = '';
      
      if (t.estado !== 'FINALIZADO') {
        this.currentNode = this.policyNodes.find((n: any) => n.id === t.nodoActualId);
      } else {
        this.currentNode = null;
      }
    });
  }

  getDeptoName(id: string): string {
    const deptos: any = { '1': 'Atención al Cliente', '2': 'Técnico', '3': 'Dirección' };
    return deptos[id] || 'General';
  }

  isNodeCompleted(nodeId: string): boolean {
    if (!this.selectedTramite || !this.selectedTramite.historial) return false;
    return this.selectedTramite.historial.some((h: any) => h.nodoId === nodeId);
  }

  getDuracionNodo(nodeId: string): string {
    if (!this.selectedTramite || !this.selectedTramite.historial) return '';
    const log = this.selectedTramite.historial.find((h: any) => h.nodoId === nodeId);
    if (!log || log.duracionSegundos == null) return '';
    
    const seg = log.duracionSegundos;
    if (seg < 60) return seg + ' seg';
    const min = Math.floor(seg / 60);
    if (min < 60) return min + ' min';
    const hrs = Math.floor(min / 60);
    return hrs + ' hrs';
  }

  getTiempoTotalTramite(t: any): string {
    if (!t.fechaInicio) return 'N/A';
    const start = new Date(t.fechaInicio).getTime();
    
    let end: number;
    if (t.estado === 'FINALIZADO' && t.historial && t.historial.length > 0) {
      const ultimoLog = t.historial[t.historial.length - 1];
      end = new Date(ultimoLog.fechaCompletado).getTime();
    } else {
      end = new Date().getTime();
    }
    
    const diffSecs = Math.floor((end - start) / 1000);
    if (diffSecs < 60) return diffSecs + ' seg';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return diffMins + ' min';
    const diffHrs = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return diffHrs + ' h ' + remainingMins + ' m';
  }

  getAvailableOutcomes(): string[] {
    if (!this.currentNode || !this.policyConnections) return [];
    
    // 1. Ver si este nodo se conecta directamente a un nodo DECISION
    const decisionNodes = this.policyNodes.filter(n => n.tipo === 'DECISION');
    const connToDecision = this.policyConnections.find(c => c.origenId === this.currentNode.id && decisionNodes.some(dn => dn.id === c.destinoId));
    
    let sourceNodeId = this.currentNode.id;
    if (connToDecision) {
      sourceNodeId = connToDecision.destinoId;
    }
    
    // 2. Buscar conexiones que salgan de sourceNodeId
    const outgoing = this.policyConnections.filter(c => c.origenId === sourceNodeId && c.condicion && c.condicion !== 'DEFAULT');
    return outgoing.map(c => c.condicion);
  }

  completar(outcomeFromBtn?: string) {
    if (outcomeFromBtn) {
      this.selectedOutcome = outcomeFromBtn;
    }

    const variables = this.currentNode.campos ? this.currentNode.campos.reduce((acc: any, curr: any) => {
      acc[curr.nombre] = curr.valor;
      return acc;
    }, {}) : {};

    if (this.selectedOutcome) {
      variables['outcome'] = this.selectedOutcome;
    }

    const extraData = {
      variables: variables,
      nombreNodo: this.currentNode.nombre,
      campos: this.currentNode.campos || [],
      informeIA: this.iaReport
    };

    this.workflowService.completarActividad(this.selectedTramite.id, this.currentNode.id, extraData).subscribe({
      next: () => {
        alert('¡Etapa completada con éxito!');
        this.loadTramites();
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'No se pudo avanzar de etapa. Si cambiaste el lienzo recientemente, inicia un nuevo trámite para aplicar los cambios.';
        alert(errorMsg);
      }
    });
  }
}
