import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdB2412519 } from '../../../../../interfaces/working/md-b2412519';
import { CrudDtoService } from '../crud-dto';

@Injectable({ providedIn: 'root' })
export class SgB2412519 extends CrudDtoService<MdB2412519> {
  constructor(http: HttpClient) {
    super(http, 'user-data', true);
  }
}
