import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { MdB2412519 } from '../../../../../interfaces/working/md-b2412519';
import { CrudDtoService } from '../crud-dto';

@Injectable({ providedIn: 'root' })
export class SgB2412519 extends CrudDtoService<MdB2412519> {
  constructor(private readonly passwordHttp: HttpClient) {
    super(passwordHttp, 'user-data', true);
  }

  changePassword(payload: { fdPassd: string; idRegister: number }): Observable<void> {
    const { idRegister, fdPassd } = payload;
    return this.passwordHttp.put<void>(
      `${environment.apiUrl}/api/user-data/dto/${idRegister}/password`,
      { fdPassd },
      this.jwtOptions(),
    );
  }
}
