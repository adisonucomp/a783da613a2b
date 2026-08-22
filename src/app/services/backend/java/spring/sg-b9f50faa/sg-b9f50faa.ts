import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { MdB9f50faa } from '../../../../../interfaces/working/md-b9f50faa';
import { CrudDtoService } from '../crud-dto';

export interface DeviceRating {
  averageRating: number;
  opinionCount: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class SgB9f50faa extends CrudDtoService<MdB9f50faa> {
  constructor(private readonly ratingHttp: HttpClient) {
    super(ratingHttp, 'comment');
  }

  getDeviceRating(deviceId: number): Observable<DeviceRating> {
    return this.ratingHttp
      .get<ApiResponse<DeviceRating>>(`${environment.apiUrl}/api/comment/dto/device/${deviceId}/rating`)
      .pipe(map(({ data }) => data));
  }
}
