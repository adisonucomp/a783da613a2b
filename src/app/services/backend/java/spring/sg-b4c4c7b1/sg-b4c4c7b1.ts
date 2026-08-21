import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdB4c4c7b1 } from '../../../../../interfaces/working/md-b4c4c7b1';
import { CrudDtoService } from '../crud-dto';

@Injectable({ providedIn: 'root' })
export class SgB4c4c7b1 extends CrudDtoService<MdB4c4c7b1> {
  constructor(http: HttpClient) {
    super(http, 'brand-device');
  }
}
