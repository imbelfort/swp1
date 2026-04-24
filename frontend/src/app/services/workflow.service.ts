import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface WorkflowNode {
  id: string;
  type: 'START' | 'ACTIVITY' | 'DECISION' | 'END';
  name: string;
  department?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
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
}