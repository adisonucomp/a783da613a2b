import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdB8043c54 } from '../../../../../interfaces/working/md-b8043c54';
import { CrudDtoService } from '../crud-dto.service';

@Injectable({ providedIn: 'root' })
export class SgB8043c54 extends CrudDtoService<MdB8043c54> {
  constructor(http: HttpClient) {
    super(http, 'device-data');
  }
}
