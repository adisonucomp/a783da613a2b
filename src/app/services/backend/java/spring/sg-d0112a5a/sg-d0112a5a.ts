import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdD0112a5a } from '../../../../../interfaces/working/md-d0112a5a';
import { CrudDtoService } from '../crud-dto.service';

@Injectable({ providedIn: 'root' })
export class SgD0112a5a extends CrudDtoService<MdD0112a5a> {
  constructor(http: HttpClient) {
    super(http, 'operating-system');
  }
}
