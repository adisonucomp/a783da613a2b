import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdC0de7562 } from '../../../../../interfaces/working/md-c0de7562';
import { CrudDtoService } from '../crud-dto';

@Injectable({ providedIn: 'root' })
export class SgC0de7562 extends CrudDtoService<MdC0de7562> {
  constructor(http: HttpClient) {
    super(http, 'role-data', true);
  }
}
