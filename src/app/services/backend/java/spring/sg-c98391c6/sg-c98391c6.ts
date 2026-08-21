import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdC98391c6 } from '../../../../../interfaces/working/md-c98391c6';
import { CrudDtoService } from '../crud-dto.service';

@Injectable({ providedIn: 'root' })
export class SgC98391c6 extends CrudDtoService<MdC98391c6> {
  constructor(http: HttpClient) {
    super(http, 'brand-processor');
  }
}
