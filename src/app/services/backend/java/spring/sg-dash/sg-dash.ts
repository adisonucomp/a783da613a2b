import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthSession } from '../../../../core/auth-session/auth-session';

export interface ModuleCounts {
  brandDevice: number;
  brandProcessor: number;
  comment: number;
  deviceData: number;
  deviceImage: number;
  graphicCard: number;
  imageExt: number;
  operatingSystem: number;
  roleData: number;
  typeProcessor: number;
  userData: number;
}

interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class SgDash {
  private readonly authSession = inject(AuthSession);

  constructor(private readonly http: HttpClient) {}

  getModuleCounts(): Observable<ModuleCounts> {
    const token = this.authSession.getToken();
    const options = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : undefined;
    return this.http
      .get<ApiResponse<ModuleCounts>>(`${environment.apiUrl}/api/dash/module`, options)
      .pipe(map(({ data }) => data));
  }
}
