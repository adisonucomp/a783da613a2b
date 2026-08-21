import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdB2c17bdf } from '../../../../../interfaces/working/md-b2c17bdf';
import { CrudDtoService } from '../crud-dto.service';

@Injectable({ providedIn: 'root' })
export class SgB2c17bdf extends CrudDtoService<MdB2c17bdf> {
  constructor(http: HttpClient) {
    super(http, 'type-processor');
  }
}
