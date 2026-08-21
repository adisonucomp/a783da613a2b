import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdB9f50faa } from '../../../../../interfaces/working/md-b9f50faa';
import { CrudDtoService } from '../crud-dto';

@Injectable({ providedIn: 'root' })
export class SgB9f50faa extends CrudDtoService<MdB9f50faa> {
  constructor(http: HttpClient) {
    super(http, 'comment');
  }
}
