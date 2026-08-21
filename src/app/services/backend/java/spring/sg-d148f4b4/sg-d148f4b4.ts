import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdD148f4b4 } from '../../../../../interfaces/working/md-d148f4b4';
import { CrudDtoService } from '../crud-dto.service';

@Injectable({ providedIn: 'root' })
export class SgD148f4b4 extends CrudDtoService<MdD148f4b4> {
  constructor(http: HttpClient) {
    super(http, 'device-image');
  }
}
