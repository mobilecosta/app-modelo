import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PoLookupFilter, PoLookupResponseApi } from '@po-ui/ng-components';
import { NfseCTribNac } from '../../core/models/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CTribNacLookupService implements PoLookupFilter {
  constructor(private http: HttpClient) {}

  getFilteredItems(params: {
    filter: string;
    page: number;
    pageSize: number;
    filterParams?: Record<string, string>;
  }): Observable<PoLookupResponseApi> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.filter) {
      httpParams = httpParams.set('busca', params.filter);
    }

    if (params.filterParams?.['grupo']) {
      httpParams = httpParams.set('grupo', params.filterParams['grupo']);
    }

    return this.http
      .get<{ items: NfseCTribNac[] }>(`${environment.apiUrl}/nfse_ctribnac`, { params: httpParams })
      .pipe(
        map(res => ({
          items: res.items ?? [],
          hasNext: false
        }))
      );
  }

  getObjectByValue(value: string): Observable<NfseCTribNac> {
    return this.http.get<{ item: NfseCTribNac }>(
      `${environment.apiUrl}/nfse_ctribnac/${value}`
    ).pipe(map(res => res.item));
  }
}
