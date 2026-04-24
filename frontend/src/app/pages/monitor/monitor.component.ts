import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monitor">
      <header>
        <h1>Monitor de Flujos</h1>
        <p>Seguimiento detallado de la ejecución de procesos</p>
      </header>

      <div class="grid glass-card">
        <div class="placeholder">Visualización de Flujos (Próximamente)</div>
      </div>
    </div>
  `,
  styles: [`
    .monitor {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
    }
    
    .grid {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.2);
    }
  `]
})
export class MonitorComponent {}
