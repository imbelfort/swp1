import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Nodo {
  id: string;
  tipo: 'START' | 'ACTIVITY' | 'DECISION' | 'FORK' | 'JOIN' | 'END' | 'INICIO' | 'ACTIVIDAD' | 'FIN';
  nombre: string;
  departamentoId?: string;
  campos?: any[];
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Conexion {
  id: string;
  origenId: string;
  destinoId: string;
  condicion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  getPolicies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/politicas`);
  }

  savePolicy(policy: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/politicas`, policy);
  }

  getTramites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tramites`);
  }

  iniciarTramite(politicaId: string, cliente: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tramites/iniciar`, { politicaId, cliente });
  }

  completarActividad(tramiteId: string, nodoId: string, datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tramites/${tramiteId}/completar`, { nodoId, datos });
  }
}