import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface DtoRecord {
  idRegister?: number;
}

interface ApiResponse<T> {
  data: T;
}

export abstract class CrudDtoService<T extends DtoRecord> {
  private readonly url: string;

  protected constructor(
    private readonly http: HttpClient,
    resource: string,
    private readonly readRequiresJwt = false,
  ) {
    this.url = `${environment.apiUrl}/api/${resource}/dto`;
  }

  getAll(): Observable<T[]> {
    return this.http
      .get<ApiResponse<T[]>>(this.url, this.readRequiresJwt ? this.jwtOptions() : undefined)
      .pipe(map(({ data }) => data));
  }

  getById(idRegister: number): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.url}/${idRegister}`, this.readRequiresJwt ? this.jwtOptions() : undefined)
      .pipe(map(({ data }) => data));
  }

  create(payload: Omit<T, 'idRegister'>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url, payload, this.jwtOptions())
      .pipe(map(({ data }) => data));
  }

  update(idRegister: number, payload: Omit<T, 'idRegister'>): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.url}/${idRegister}`, payload, this.jwtOptions())
      .pipe(map(({ data }) => data));
  }

  delete(idRegister: number): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.url}/${idRegister}`, this.jwtOptions())
      .pipe(map(() => undefined));
  }

  protected jwtOptions(): { headers: HttpHeaders } {
    const token = this.getJwtToken();
    return {
      headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(),
    };
  }

  private getJwtToken(): string | null {
    if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') {
      return null;
    }

    const storage = environment.sessionStorage ? sessionStorage : localStorage;
    return storage.getItem('jwtToken') ?? storage.getItem('accessToken') ?? storage.getItem('token');
  }
}
