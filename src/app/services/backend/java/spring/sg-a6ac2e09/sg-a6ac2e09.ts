import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdA6ac2e09 } from '../../../../../interfaces/working/md-a6ac2e09';
import { CrudDtoService } from '../crud-dto';

@Injectable({ providedIn: 'root' })
export class SgA6ac2e09 extends CrudDtoService<MdA6ac2e09> {
  constructor(http: HttpClient) {
    super(http, 'graphic-card');
  }
}
