import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="designer-container">
      <header class="top-bar">
        <div class="title-section">
          <h1>Diseñador de Flujos</h1>
          <input [(ngModel)]="policyName" class="minimal-input" placeholder="Nombre de la política">
        </div>
        <button class="btn-primary" (click)="savePolicy()">Guardar Política</button>
      </header>
      
      <div class="workspace">
        <aside class="toolbar glass-card">
          <p class="toolbar-label">Componentes</p>
          <div class="tool-buttons">
            <button (click)="addNode('START')" class="tool-btn">⭕ Inicio</button>
            <button (click)="addNode('ACTIVITY')" class="tool-btn">⏹️ Actividad</button>
            <button (click)="addNode('DECISION')" class="tool-btn">🔶 Decisión</button>
            <button (click)="addNode('FORK')" class="tool-btn">🔀 Fork</button>
            <button (click)="addNode('JOIN')" class="tool-btn">🔗 Join</button>
            <button (click)="addNode('END')" class="tool-btn">🏁 Fin</button>
          </div>
        </aside>
        
        <div class="canvas">
          <div class="nodes-flow">
            <div *ngFor="let node of nodes; let i = index" class="node-wrapper">
              <div class="node-box glass-card animate-pop" [class.activity]="node.tipo === 'ACTIVIDAD'">
                <div class="node-header">
                  <span class="type">{{ node.tipo }}</span>
                  <button class="delete-btn" (click)="removeNode(node)">×</button>
                </div>
                
                <input [(ngModel)]="node.nombre" class="node-name-input" placeholder="Nombre...">
                
                <div *ngIf="node.tipo === 'ACTIVIDAD'" class="field-section">
                  <select [(ngModel)]="node.departamentoId" class="minimal-select">
                    <option value="1">Atención al Cliente</option>
                    <option value="2">Técnico</option>
                    <option value="3">Dirección</option>
                  </select>
                  
                  <div class="fields-list">
                    <div *ngFor="let field of node.campos" class="field-row">
                      <input [(ngModel)]="field.etiqueta" class="minimal-input field-label">
                      <select [(ngModel)]="field.tipo" class="minimal-select field-type">
                        <option value="TEXTO">Texto</option>
                        <option value="NUMERO">Número</option>
                        <option value="SELECCION">Opciones</option>
                        <option value="FOTO">Foto/Archivo</option>
                      </select>
                      <button (click)="removeField(node, field)" class="btn-remove">×</button>
                      
                      <div *ngIf="field.tipo === 'SELECCION'" class="options-config">
                        <input [(ngModel)]="field.tempOpcion" placeholder="Nueva opción..." (keyup.enter)="addOpcion(field)">
                        <div class="tags">
                          <span *ngFor="let opt of field.opciones" class="tag">{{ opt }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button class="add-field-btn" (click)="addField(node)">+ Añadir Campo</button>
                </div>
              </div>
              
              <div class="connector" *ngIf="i < nodes.length - 1">
                <div class="line"></div>
                <div class="arrow">▼</div>
              </div>
            </div>
            
            <div *ngIf="nodes.length === 0" class="empty-canvas">
              Utiliza la barra lateral para añadir elementos al flujo
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .designer-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }

    .top-bar {
      padding: 16px 32px;
      background: white;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-section h1 {
      font-size: 1.25rem;
      margin-bottom: 4px;
    }

    .minimal-input {
      border: none;
      border-bottom: 1px solid transparent;
      font-size: 0.875rem;
      color: var(--text-muted);
      width: 250px;
      padding: 2px 0;
    }

    .minimal-input:focus {
      outline: none;
      border-bottom-color: var(--primary);
      color: var(--text-main);
    }

    .workspace {
      flex: 1;
      display: flex;
      padding: 24px;
      gap: 24px;
      overflow: hidden;
    }

    .toolbar {
      width: 200px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: fit-content;
    }

    .toolbar-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .tool-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tool-btn {
      text-align: left;
      padding: 10px;
      background: white;
      border: 1px solid var(--border-color);
      color: var(--text-main);
    }

    .tool-btn:hover {
      background: #f1f5f9;
      border-color: var(--primary);
    }

    .canvas {
      flex: 1;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow-y: auto;
      padding: 48px;
    }

    .nodes-flow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    .node-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 320px;
    }

    .node-box {
      width: 100%;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-radius: 6px;
    }

    .node-box.activity {
      border-left: 4px solid var(--primary);
    }

    .node-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .type {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .delete-btn {
      background: none;
      border: none;
      color: #cbd5e1;
      font-size: 1.25rem;
      line-height: 1;
    }

    .delete-btn:hover { color: #ef4444; }

    .node-name-input {
      border: none;
      font-size: 0.938rem;
      font-weight: 500;
      width: 100%;
    }

    .node-name-input:focus { outline: none; color: var(--primary); }

    .field-section {
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .minimal-select {
      width: 100%;
      padding: 6px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 0.813rem;
    }

    .fields-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 8px;
    }

    .field-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      background: #f8fafc;
      padding: 8px;
      border-radius: 4px;
    }

    .field-label { flex: 1; border-bottom: 1px solid #cbd5e1 !important; }
    .field-type { width: 100px; }

    .options-config {
      width: 100%;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .options-config input {
      font-size: 0.75rem;
      padding: 4px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }

    .tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag { font-size: 0.7rem; background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; }

    .add-field-btn {
      background: none;
      border: 1px dashed var(--border-color);
      color: var(--primary);
      padding: 4px;
      font-size: 0.75rem;
    }

    .connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 40px;
    }

    .line {
      width: 1px;
      height: 100%;
      background: var(--border-color);
    }

    .arrow {
      font-size: 0.6rem;
      color: var(--border-color);
      margin-top: -4px;
    }

    .empty-canvas {
      margin-top: 100px;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
  `]
})
export class DesignerComponent {
  private workflowService = inject(WorkflowService);

  policyName = 'Flujo de Negocio #1';
  nodes: any[] = [];
  conexiones: any[] = [];

  addNode(tipo: string) {
    const backendTipo = tipo === 'START' ? 'INICIO' : 
                       tipo === 'ACTIVITY' ? 'ACTIVIDAD' : 
                       tipo === 'END' ? 'FIN' : tipo;
                       
    if (backendTipo === 'INICIO' && this.nodes.some(n => n.tipo === 'INICIO')) {
      alert('Solo se permite un único nodo de Inicio por diagrama.');
      return;
    }

    const newNode = {
      id: 'n' + (this.nodes.length + 1),
      tipo: backendTipo,
      nombre: tipo === 'START' ? 'Inicio' : tipo === 'END' ? 'Fin' : 'Nueva Etapa',
      departamentoId: '1',
      campos: []
    };
    this.nodes.push(newNode);
    
    if (this.nodes.length > 1) {
      this.conexiones.push({
        id: 'c' + this.conexiones.length,
        origenId: this.nodes[this.nodes.length - 2].id,
        destinoId: newNode.id
      });
    }
  }

  removeNode(node: any) {
    this.nodes = this.nodes.filter(n => n.id !== node.id);
    this.conexiones = this.conexiones.filter(c => c.origenId !== node.id && c.destinoId !== node.id);
  }

  addField(node: any) {
    if (!node.campos) node.campos = [];
    node.campos.push({
      nombre: 'campo_' + (node.campos.length + 1),
      etiqueta: 'Nuevo Campo',
      tipo: 'TEXTO',
      opciones: []
    });
  }

  removeField(node: any, field: any) {
    node.campos = node.campos.filter((f: any) => f !== field);
  }

  addOpcion(field: any) {
    if (field.tempOpcion) {
      if (!field.opciones) field.opciones = [];
      field.opciones.push(field.tempOpcion);
      field.tempOpcion = '';
    }
  }

  savePolicy() {
    const policy = {
      nombre: this.policyName,
      nodos: this.nodes,
      conexiones: this.conexiones
    };
    this.workflowService.savePolicy(policy).subscribe(() => {
      alert('Flujo guardado con éxito');
    });
  }
}
