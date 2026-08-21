import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdB22b6431 } from '../../../../../interfaces/working/md-b22b6431';
import { CrudDtoService } from '../crud-dto';

@Injectable({ providedIn: 'root' })
export class SgB22b6431 extends CrudDtoService<MdB22b6431> {
  constructor(http: HttpClient) {
    super(http, 'image-ext');
  }
}
