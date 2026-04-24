import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="designer">
      <header>
        <h1>Diseñador de Políticas</h1>
        <div class="actions">
          <button class="btn-primary">Guardar Política</button>
        </div>
      </header>
      
      <div class="canvas-container">
        <aside class="sidebar-left glass-card">
          <h3>Elementos</h3>
          <div class="draggable-list">
            <div class="drag-item"><i class="icon">⭕</i> Inicio</div>
            <div class="drag-item"><i class="icon">⏹️</i> Actividad</div>
            <div class="drag-item"><i class="icon">🔶</i> Decisión</div>
            <div class="drag-item"><i class="icon">🏁</i> Fin</div>
          </div>
        </aside>
        
        <div class="canvas glass-card">
          <div class="placeholder">Área del Diagrama (Interactivo)</div>
        </div>
        
        <aside class="sidebar-right glass-card">
          <h3>Asistente IA</h3>
          <div class="ia-chat">
            <div class="message bot">
              ¿Cómo puedo ayudarte con el diagrama hoy?
            </div>
          </div>
          <div class="ia-input">
            <textarea placeholder="Ej: Agrega una actividad de aprobación después de revisar..."></textarea>
            <button class="btn-primary">Enviar</button>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .designer {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
    }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .canvas-container {
      display: flex;
      gap: 24px;
      flex: 1;
      overflow: hidden;
    }
    
    .sidebar-left, .sidebar-right {
      width: 280px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .canvas {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.2);
    }
    
    .draggable-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .drag-item {
      padding: 12px;
      background: var(--bg-dark);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      cursor: grab;
      transition: background 0.2s;
    }
    
    .drag-item:hover {
      background: var(--glass);
    }
    
    .ia-chat {
      flex: 1;
      overflow-y: auto;
    }
    
    .message {
      padding: 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      background: var(--glass);
      color: var(--text-muted);
    }
    
    .ia-input {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    textarea {
      background: var(--bg-dark);
      border: 1px solid var(--glass-border);
      color: white;
      padding: 12px;
      border-radius: 8px;
      resize: none;
      height: 100px;
    }
  `]
})
export class DesignerComponent {}
