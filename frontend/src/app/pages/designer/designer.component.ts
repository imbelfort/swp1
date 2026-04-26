import { Component, inject, AfterViewChecked, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
          <h1>Diseñador de Flujos (Swimlanes & IA)</h1>
          <input [(ngModel)]="policyName" class="minimal-input" placeholder="Nombre de la política">
        </div>
        <button class="btn-primary" (click)="savePolicy()">Guardar Política</button>
      </header>
      
      <div class="workspace">
        
        <!-- Toolbar -->
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
          
          <p class="toolbar-label mt-4">Conexiones</p>
          <div class="connection-mode">
            <button class="tool-btn" [class.active]="isConnecting" (click)="toggleConnectionMode()">
              {{ isConnecting ? 'Cancelar Conexión' : '🔗 Unir Nodos' }}
            </button>
            <small *ngIf="isConnecting" class="text-xs text-blue-500 mt-1 block">Selecciona origen y destino</small>
          </div>

          <p class="toolbar-label mt-4">Calles / Deptos</p>
          <div class="dept-manager">
            <input [(ngModel)]="newDeptName" placeholder="Nueva calle..." class="minimal-input" (keyup.enter)="addDepartamento()" style="border-bottom: 1px solid var(--border-color); width: 100%;">
            <button class="add-field-btn" (click)="addDepartamento()" style="width: 100%; margin-top: 8px;">+ Añadir Calle</button>
            
            <div class="depts-list" style="margin-top: 12px; display: flex; flex-direction: column; gap: 6px;">
              <div *ngFor="let dept of departamentos" class="dept-item" style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 0.813rem;">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 110px;">{{ dept.nombre }}</span>
                <button class="btn-remove" (click)="removeDepartamento(dept.id)" style="padding: 0 4px;">×</button>
              </div>
            </div>
          </div>
          <p class="toolbar-label mt-4">Condiciones</p>
          <div class="connections-manager" style="max-height: 150px; overflow-y: auto;">
            <small style="color: var(--text-muted); font-size: 0.65rem; margin-bottom: 4px; display: block;">Asigna el resultado (Ej: Si / No)</small>
            <div *ngFor="let conn of conexiones" class="dept-item" style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-size: 0.75rem; margin-bottom: 6px;">
              <div style="font-weight: 600; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ getNodeName(conn.origenId) }} ➔ {{ getNodeName(conn.destinoId) }}
              </div>
              <input [(ngModel)]="conn.condicion" placeholder="Ej: Aprobado..." class="minimal-input" style="font-size: 0.75rem; border-bottom: 1px solid var(--border-color); padding: 2px; width: 100%;">
            </div>
          </div>
        </aside>
        
        <!-- Swimlanes Canvas -->
        <div class="canvas">
          <div class="swimlanes-grid" id="swimlanes-grid">
            
            <!-- SVG Layer for connections -->
            <svg class="connections-layer">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
              </defs>
              <path *ngFor="let p of svgPaths" [attr.d]="p.d" stroke="#94a3b8" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
              <text *ngFor="let p of svgPaths" [attr.x]="p.x" [attr.y]="p.y - 10" fill="#2563eb" font-size="11" font-weight="700" text-anchor="middle" style="background: white; paint-order: stroke; stroke: white; stroke-width: 4px;">{{ p.condicion }}</text>
            </svg>

            <!-- Columns per Department -->
            <div class="swimlane" *ngFor="let dept of departamentos">
              <div class="swimlane-header">{{ dept.nombre }}</div>
              <div class="swimlane-body">
                
                <div *ngFor="let node of getNodesForDept(dept.id)" 
                     class="node-wrapper" 
                     [attr.id]="'node-' + node.id"
                     [class.selectable]="isConnecting"
                     [class.selected]="connectionOrigin?.id === node.id"
                     (click)="onNodeClick(node)">
                     
                  <div class="node-box glass-card animate-pop" [class.activity]="node.tipo === 'ACTIVIDAD'">
                    <div class="node-header">
                      <span class="type">{{ node.tipo }}</span>
                      <button class="delete-btn" (click)="removeNode(node); $event.stopPropagation()">×</button>
                    </div>
                    
                    <input [(ngModel)]="node.nombre" class="node-name-input" placeholder="Nombre..." (ngModelChange)="scheduleRedraw()">
                    
                    <div class="field-section">
                      <select [(ngModel)]="node.departamentoId" class="minimal-select" (ngModelChange)="scheduleRedraw()" style="width: 100%; margin-bottom: 8px;">
                        <option *ngFor="let d of departamentos" [value]="d.id">{{d.nombre}}</option>
                      </select>
                    </div>

                    <div *ngIf="node.tipo === 'ACTIVIDAD'" class="field-section">
                      
                      <div class="fields-list">
                        <div *ngFor="let field of node.campos" class="field-row">
                          <input [(ngModel)]="field.etiqueta" class="minimal-input field-label">
                          <select [(ngModel)]="field.tipo" class="minimal-select field-type" (ngModelChange)="scheduleRedraw()">
                            <option value="TEXTO">Texto</option>
                            <option value="NUMERO">Número</option>
                            <option value="SELECCION">Opciones</option>
                            <option value="FOTO">Foto/Archivo</option>
                          </select>
                          <button (click)="removeField(node, field); scheduleRedraw()" class="btn-remove">×</button>
                          
                          <div *ngIf="field.tipo === 'SELECCION'" class="options-config">
                            <input [(ngModel)]="field.tempOpcion" placeholder="Nueva opción..." (keyup.enter)="addOpcion(field); scheduleRedraw()">
                            <div class="tags">
                              <span *ngFor="let opt of field.opciones" class="tag">{{ opt }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button class="add-field-btn" (click)="addField(node); scheduleRedraw()">+ Campo</button>
                    <div *ngIf="node.tipo === 'DECISION'" class="field-section" style="border-top: 1px solid #cbd5e1; padding-top: 8px;">
                      <small style="color: var(--text-muted); font-weight: 700; font-size: 0.7rem; display: block; margin-bottom: 6px;">RUTAS DE SALIDA:</small>
                      <div *ngFor="let conn of getOutgoingConnections(node.id)" style="margin-top: 6px; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 0.75rem; font-weight: 600; color: var(--primary); margin-bottom: 4px;">
                          ➔ {{ getNodeName(conn.destinoId) }}
                        </div>
                        <input [(ngModel)]="conn.condicion" placeholder="Ej: Aprobado" class="minimal-input" style="font-size: 0.7rem; padding: 4px; border-radius: 4px; width: 100%; border: 1px solid var(--border-color);" (ngModelChange)="scheduleRedraw()">
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
        
        <!-- Groq AI Chat Panel -->
        <aside class="ai-panel glass-card" [class.minimized]="isChatMinimized" (click)="isChatMinimized && (isChatMinimized = false)">
          <div class="ai-header" *ngIf="!isChatMinimized">
            <div class="ai-header-title">
              <h3>✨ Asistente IA (Groq)</h3>
              <p>Pídele a Groq que edite el flujo</p>
            </div>
            <button class="minimize-btn" (click)="isChatMinimized = true; $event.stopPropagation()">—</button>
          </div>
          
          <div class="ai-chat-body" *ngIf="!isChatMinimized">
            <div *ngFor="let msg of chatMessages" class="chat-msg" [class.user]="msg.role === 'user'" [class.bot]="msg.role === 'bot'">
              <span class="msg-bubble">{{ msg.content }}</span>
            </div>
          </div>
          
          <div class="ai-input-area" *ngIf="!isChatMinimized">
            <input [(ngModel)]="aiPrompt" placeholder="Ej: Añade una actividad..." (keyup.enter)="sendAiCommand()">
            <button (click)="sendAiCommand()">Enviar</button>
          </div>

          <div class="floating-ai-icon" *ngIf="isChatMinimized" title="Abrir Chat de IA">
            ✨
          </div>
        </aside>

      </div>
    </div>
  `,
  styles: [`
    .designer-container { height: 100%; display: flex; flex-direction: column; background: #f8fafc; }
    .top-bar { padding: 16px 32px; background: white; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .title-section h1 { font-size: 1.25rem; margin-bottom: 4px; }
    .minimal-input { border: none; border-bottom: 1px solid transparent; font-size: 0.875rem; color: var(--text-muted); width: 100%; padding: 4px; background: transparent; }
    .minimal-input:focus { outline: none; border-bottom-color: var(--primary); color: var(--text-main); }
    
    .workspace { flex: 1; display: flex; padding: 10px; gap: 12px; overflow: hidden; position: relative; }
    
    .toolbar { width: 150px; padding: 12px; display: flex; flex-direction: column; gap: 8px; max-height: calc(100vh - 120px); overflow-y: auto; flex-shrink: 0; }
    .toolbar-label { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; }
    .mt-4 { margin-top: 10px; }
    .tool-buttons { display: flex; flex-direction: column; gap: 6px; }
    .tool-btn { text-align: left; padding: 6px 10px; background: white; border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; cursor: pointer; transition: all 0.2s; font-size: 0.813rem; }
    .tool-btn:hover { background: #f1f5f9; border-color: var(--primary); }
    .tool-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
    
    /* Swimlanes Canvas */
    .canvas { flex: 1; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; overflow: auto; position: relative; margin-right: 0px; }
    .swimlanes-grid { display: flex; min-width: max-content; min-height: 100%; position: relative; }
    
    .connections-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
    
    .swimlane { flex: 0 0 320px; width: 320px; border-right: 1px dashed var(--border-color); display: flex; flex-direction: column; }
    .swimlane:last-child { border-right: none; }
    .swimlane-header { padding: 16px; text-align: center; font-weight: 600; color: var(--text-main); border-bottom: 1px solid var(--border-color); background: #f8fafc; position: sticky; top: 0; z-index: 20; }
    .swimlane-body { padding: 24px 16px; display: flex; flex-direction: column; gap: 40px; align-items: center; min-height: 500px; }
    
    /* Nodes */
    .node-wrapper { width: 100%; position: relative; z-index: 15; transition: transform 0.2s; }
    .node-wrapper.selectable { cursor: crosshair; }
    .node-wrapper.selectable:hover { transform: scale(1.02); }
    .node-wrapper.selected .node-box { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3); }
    
    .node-box { width: 100%; padding: 16px; display: flex; flex-direction: column; gap: 12px; border-radius: 6px; background: white; border: 1px solid var(--border-color); }
    .node-box.activity { border-left: 4px solid var(--primary); }
    
    .node-header { display: flex; justify-content: space-between; align-items: center; }
    .type { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .delete-btn { background: none; border: none; color: #cbd5e1; font-size: 1.25rem; line-height: 1; cursor: pointer; }
    .delete-btn:hover { color: #ef4444; }
    .node-name-input { border: none; font-size: 0.938rem; font-weight: 500; width: 100%; }
    .node-name-input:focus { outline: none; color: var(--primary); }
    
    /* Fields */
    .field-section { border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
    .minimal-select { width: 100%; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.813rem; background: white; }
    .fields-list { display: flex; flex-direction: column; gap: 8px; }
    .field-row { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; background: #f8fafc; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .field-label { flex: 1; border-bottom: 1px solid #cbd5e1 !important; }
    .field-type { width: 90px; }
    .btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem; }
    
    .options-config { width: 100%; margin-top: 4px; display: flex; flex-direction: column; gap: 4px; }
    .options-config input { font-size: 0.75rem; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag { font-size: 0.7rem; background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; }
    .add-field-btn { background: none; border: 1px dashed var(--border-color); color: var(--primary); padding: 6px; font-size: 0.75rem; border-radius: 4px; cursor: pointer; }
    .add-field-btn:hover { background: #eff6ff; }
    
    /* AI Panel Flotante */
    .ai-panel { position: fixed; right: 48px; bottom: 48px; width: 320px; height: 450px; display: flex; flex-direction: column; z-index: 1000; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden; background: white; border: 1px solid var(--border-color); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .ai-panel.minimized { width: 56px; height: 56px; border-radius: 28px; padding: 0; background: linear-gradient(135deg, #1e1b4b, #312e81); cursor: pointer; justify-content: center; align-items: center; border: none; }
    .ai-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; }
    .ai-header-title h3 { font-size: 0.9rem; margin: 0; font-weight: 600; }
    .ai-header-title p { font-size: 0.7rem; margin: 2px 0 0 0; opacity: 0.8; }
    .minimize-btn { background: transparent; border: none; color: white; font-size: 1.25rem; cursor: pointer; padding: 0 4px; line-height: 1; }
    .minimize-btn:hover { opacity: 0.7; }
    
    .ai-chat-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #fafafa; }
    
    .chat-msg { display: flex; width: 100%; }
    .chat-msg.user { justify-content: flex-end; }
    .chat-msg.bot { justify-content: flex-start; }
    .msg-bubble { padding: 8px 12px; border-radius: 12px; font-size: 0.813rem; max-width: 85%; line-height: 1.4; }
    .chat-msg.user .msg-bubble { background: var(--primary); color: white; border-bottom-right-radius: 2px; }
    .chat-msg.bot .msg-bubble { background: #e2e8f0; color: #1e293b; border-bottom-left-radius: 2px; }
    
    .ai-input-area { padding: 12px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; background: white; }
    .ai-input-area input { flex: 1; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 20px; font-size: 0.813rem; }
    .ai-input-area input:focus { outline: none; border-color: var(--primary); }
    .ai-input-area button { background: var(--primary); color: white; border: none; border-radius: 20px; padding: 0 12px; font-size: 0.813rem; font-weight: 600; cursor: pointer; }
    .ai-input-area button:hover { background: #4f46e5; }
    
    .floating-ai-icon { font-size: 1.5rem; color: white; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
  `]
})
export class DesignerComponent implements AfterViewChecked, OnInit {
  private workflowService = inject(WorkflowService);
  private route = inject(ActivatedRoute);

  policyId: string | null = null;
  policyName = 'Flujo de Préstamo Avanzado';
  
  // Calles / Departamentos simulados (Idealmente vendrían del backend)
  departamentos = [
    { id: '1', nombre: 'Atención al Cliente' },
    { id: '2', nombre: 'Revisión Técnica / Riesgos' },
    { id: '3', nombre: 'Dirección / Aprobación' }
  ];

  newDeptName = '';

  nodes: any[] = [];
  conexiones: any[] = [];
  
  svgPaths: any[] = [];
  
  // Modo de conexión
  isConnecting = false;
  connectionOrigin: any = null;

  // AI Chat
  aiPrompt = '';
  isChatMinimized = true;
  chatMessages: {role: string, content: string}[] = [
    { role: 'bot', content: '¡Hola! Soy Grok. Dime qué necesitas modificar en tu diagrama y lo haré por ti.' }
  ];

  private needsRedraw = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.policyId = params.get('id');
      if (this.policyId) {
        this.workflowService.getPolicyById(this.policyId).subscribe(policy => {
          if (policy) {
            this.policyName = policy.nombre || 'Flujo sin nombre';
            this.nodes = policy.nodos || [];
            this.conexiones = policy.conexiones || [];
            this.scheduleRedraw();
          }
        });
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.scheduleRedraw();
  }

  ngAfterViewChecked() {
    if (this.needsRedraw) {
      this.drawLines();
      this.needsRedraw = false;
    }
  }

  scheduleRedraw() {
    this.needsRedraw = true;
  }

  getNodesForDept(deptId: string) {
    return this.nodes.filter(n => n.departamentoId === deptId);
  }

  addDepartamento() {
    if (!this.newDeptName.trim()) return;
    this.departamentos.push({
      id: 'dept-' + Date.now(),
      nombre: this.newDeptName.trim()
    });
    this.newDeptName = '';
    this.scheduleRedraw();
  }

  removeDepartamento(id: string) {
    if (this.departamentos.length <= 1) {
      alert('Debe haber al menos una calle.');
      return;
    }
    // Reasignar nodos de esa calle a la primera calle disponible
    const fallbackDept = this.departamentos.find(d => d.id !== id);
    if (fallbackDept) {
      this.nodes.forEach(n => {
        if (n.departamentoId === id) {
          n.departamentoId = fallbackDept.id;
        }
      });
    }
    this.departamentos = this.departamentos.filter(d => d.id !== id);
    this.scheduleRedraw();
  }

  getNodeName(id: string): string {
    const node = this.nodes.find(n => n.id === id);
    return node ? node.nombre : 'Nodo';
  }

  getOutgoingConnections(nodeId: string): any[] {
    return this.conexiones.filter(c => c.origenId === nodeId);
  }

  addNode(tipo: string) {
    const backendTipo = tipo === 'START' ? 'INICIO' : 
                       tipo === 'ACTIVITY' ? 'ACTIVIDAD' : 
                       tipo === 'END' ? 'FIN' : tipo;
                       
    if (backendTipo === 'INICIO' && this.nodes.some(n => n.tipo === 'INICIO')) {
      alert('Solo se permite un único nodo de Inicio por diagrama.');
      return;
    }

    const newNode = {
      id: 'n' + Date.now(),
      tipo: backendTipo,
      nombre: tipo === 'START' ? 'Inicio' : tipo === 'END' ? 'Fin' : 'Nueva Etapa',
      departamentoId: '1', // Por defecto a la primera calle
      campos: []
    };
    this.nodes.push(newNode);
    this.scheduleRedraw();
  }

  removeNode(node: any) {
    this.nodes = this.nodes.filter(n => n.id !== node.id);
    this.conexiones = this.conexiones.filter(c => c.origenId !== node.id && c.destinoId !== node.id);
    this.scheduleRedraw();
  }

  // Lógica de conexión manual
  toggleConnectionMode() {
    this.isConnecting = !this.isConnecting;
    this.connectionOrigin = null;
  }

  onNodeClick(node: any) {
    if (!this.isConnecting) return;
    
    if (!this.connectionOrigin) {
      this.connectionOrigin = node;
    } else {
      if (this.connectionOrigin.id !== node.id) {
        // Verificar si ya existe
        const exists = this.conexiones.some(c => c.origenId === this.connectionOrigin.id && c.destinoId === node.id);
        if (!exists) {
          this.conexiones = [...this.conexiones, {
            id: 'c' + Date.now(),
            origenId: this.connectionOrigin.id,
            destinoId: node.id,
            condicion: ''
          }];
          this.scheduleRedraw();
        }
      }
      this.isConnecting = false;
      this.connectionOrigin = null;
    }
  }

  drawLines() {
    setTimeout(() => {
      this.svgPaths = [];
      const container = document.getElementById('swimlanes-grid');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      this.conexiones.forEach(conn => {
        const el1 = document.getElementById('node-' + conn.origenId);
        const el2 = document.getElementById('node-' + conn.destinoId);
        
        if (el1 && el2) {
          const rect1 = el1.getBoundingClientRect();
          const rect2 = el2.getBoundingClientRect();
          
          // Centro del origen
          const x1 = rect1.left + rect1.width / 2 - containerRect.left;
          const y1 = rect1.bottom - containerRect.top;
          
          // Centro del destino
          const x2 = rect2.left + rect2.width / 2 - containerRect.left;
          const y2 = rect2.top - containerRect.top;
          
          // Curva Bezier para la flecha
          const offset = Math.abs(y2 - y1) / 2;
          const path = 'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + (y1 + offset) + ', ' + x2 + ' ' + (y2 - offset) + ', ' + x2 + ' ' + (y2 - 10);
          
          // Guardar objeto con metadata para texto
          this.svgPaths.push({
            d: path,
            condicion: (conn.condicion && conn.condicion !== 'DEFAULT') ? conn.condicion : '',
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
          });
        }
      });
    }, 50); // Pequeño delay para asegurar que el DOM se actualizó
  }

  // --- Campos de Formulario ---
  addField(node: any) {
    if (!node.campos) node.campos = [];
    node.campos.push({ nombre: 'campo_' + Date.now(), etiqueta: 'Nuevo Campo', tipo: 'TEXTO', opciones: [] });
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
    const policy: any = { nombre: this.policyName, nodos: this.nodes, conexiones: this.conexiones };
    if (this.policyId) {
      policy.id = this.policyId;
    }
    this.workflowService.savePolicy(policy).subscribe({
      next: () => { alert('Flujo guardado con éxito'); },
      error: (err) => {
        const msg = err.error?.error || err.message;
        alert('Error al guardar el flujo: ' + msg);
        console.error(err);
      }
    });
  }

  // --- AI Chat Logic ---
  sendAiCommand() {
    if (!this.aiPrompt.trim()) return;
    
    const userMsg = this.aiPrompt;
    this.chatMessages.push({ role: 'user', content: userMsg });
    this.aiPrompt = '';

    this.chatMessages.push({ role: 'bot', content: 'Procesando tu solicitud con Groq...' });
    
    const currentState = {
      nodos: this.nodes,
      conexiones: this.conexiones
    };

    this.workflowService.sendAiCommand(userMsg, currentState).subscribe({
      next: (response) => {
        this.chatMessages.pop(); // quitar "Procesando..."
        
        if (response.error) {
          this.chatMessages.push({ role: 'bot', content: 'Error: ' + response.error });
          return;
        }

        if (response.message) {
          this.chatMessages.push({ role: 'bot', content: response.message });
        }

        if (response.actions && Array.isArray(response.actions)) {
          response.actions.forEach((act: any) => {
            if (act.action === 'ADD_NODE') {
              const newNode = {
                id: 'n' + Date.now() + Math.floor(Math.random()*100),
                tipo: act.tipo || 'ACTIVIDAD',
                nombre: act.nombre || 'Nueva Etapa',
                departamentoId: act.departamentoId || '1',
                campos: []
              };
              this.nodes.push(newNode);
            } else if (act.action === 'ADD_CONNECTION') {
              const originNode = this.nodes.find(n => n.nombre.toLowerCase().includes(act.origenNombre?.toLowerCase()));
              const destNode = this.nodes.find(n => n.nombre.toLowerCase().includes(act.destinoNombre?.toLowerCase()));
              
              if (originNode && destNode) {
                this.conexiones.push({
                  id: 'c' + Date.now() + Math.floor(Math.random()*100),
                  origenId: originNode.id,
                  destinoId: destNode.id,
                  condicion: 'DEFAULT'
                });
              }
            }
          });
          this.scheduleRedraw();
        }
      },
      error: (err) => {
        this.chatMessages.pop();
        this.chatMessages.push({ role: 'bot', content: 'Hubo un error de conexión con el backend.' });
      }
    });
  }
}
