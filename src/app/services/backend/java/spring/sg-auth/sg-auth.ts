import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface LoginPayload {
  fdLogin: string;
  fdPassd: string;
}

export interface RegisterBuyerPayload {
  fdEmail: string;
  fdLogin: string;
  fdPassd: string;
  fdName: string;
  fdSrnm: string;
}

export interface JwtTokenDto {
  expiresAt: string;
  token: string;
  tokenType: string;
}

interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class SgAuth {
  private readonly url = `${environment.apiUrl}/api/auth`;

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<ApiResponse<JwtTokenDto>> {
    return this.http.post<ApiResponse<JwtTokenDto>>(`${this.url}/login`, payload);
  }

  registerBuyer(payload: RegisterBuyerPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.url}/register/comprador`, payload);
  }
}
