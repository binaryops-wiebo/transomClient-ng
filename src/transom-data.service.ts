import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TransomApiAuthService } from './transom-api-auth.service';
import 'rxjs/add/operator/map';
import { TransomApiError } from './transom-api-error';

@Injectable()
export class TransomDataService {

  private apiCfg: any;
  private url: string;
  private apiErrors: Subject<TransomApiError>;

  constructor(private http: Http, private authSvc: TransomApiAuthService) {
    this.apiErrors = new Subject<TransomApiError>();
  }

  public setConfig(cfg: any) {
    this.apiCfg = cfg;
    this.url = this.apiCfg.baseUrl;
  }

  public dataApiErrors(): Subject<TransomApiError> {
    return this.apiErrors;
  }

  public insertRecord(entity: string, item: any): Observable<any> {

    return Observable.create((observer: any) => {

      this.http.post(this.url + '/db/' + entity,
        JSON.stringify(item), { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data);
        },
        (err: Response) => {
          this.emitApiError(err);
          observer.error(err);
        },
        () => {
          observer.complete();
        });
    });
  }

  public updateRecord(entity: string, item: any): Observable<any> {
    return Observable.create((observer: any) => {
      this.http.put(this.url + '/db/' + entity + '/' + item._id,
        JSON.stringify(item), { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data);
        },
        (err) => {
          // central spot to handle app wide errors, like session timeout
          this.emitApiError(err);
          observer.error(err);
        },
        () => { observer.complete(); }
        );
    });
  }

  public findData(entity: string, query: string): Observable<any> {
    return Observable.create((observer: any) => {
      this.http.get(this.url + '/db/' + entity + '?' + query, { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data.data);
        },
        (err) => {
          // central spot to handle app wide errors, like session timeout
          this.emitApiError(err);
          observer.error(err);

        },
        () => { observer.complete(); }
        );
    });
  }

  public findDataById(entity: string, idVal: string): Observable<any> {
    return Observable.create((observer: any) => {
      this.http.get(this.url + '/db/' + entity + '/' + idVal, { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data);
        },
        (err) => {
          // central spot to handle app wide errors, like session timeout
          this.emitApiError(err);
          observer.error(err);
        },
        () => { observer.complete(); }
        );
    });
  }

  public deleteRecord(entity: string, item: any): Observable<any> {
    return Observable.create((observer: any) => {
      this.http.delete(this.url + '/db/' + entity + '/' + item._id, { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data);
        },
        (err) => {
          // central spot to handle app wide errors, like session timeout
          this.emitApiError(err);
          observer.error(err);
        },
        () => { observer.complete(); }
        );
    });
  }

  public postToFunction(functionName: string, payload: any): Observable<any> {
    return Observable.create((observer: any) => {
      this.http.post(this.url + '/fx/' + functionName,
        JSON.stringify(payload), { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data);
        },
        (err) => {
          // central spot to handle app wide errors, like session timeout
          this.emitApiError(err);
          observer.error(err);
        },
        () => { observer.complete(); }
        );
    });
  }

  public getFromFunction(functionName: string, querystring: string): Observable<any> {

    let finalUrl: string = this.url + '/fx/' + functionName;
    if (querystring) {
      finalUrl += '?' + querystring;
    }
    return Observable.create((observer: any) => {
      this.http.get(finalUrl, { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data);
        },
        (err) => {
          // central spot to handle app wide errors, like session timeout
          this.emitApiError(err);
          observer.error(err);
        },
        () => { observer.complete(); }
      );
    });
  }

  public deleteFromFunction(functionName: string, querystring: string): Observable<any> {

    let finalUrl: string = this.url + '/fx/' + functionName;
    if (querystring) {
      finalUrl += '?' + querystring;
    }
    return Observable.create((observer: any) => {
      this.http.delete(finalUrl, { headers: this.getHeaders() })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          observer.next(data);
        },
        (err) => {
          // central spot to handle app wide errors, like session timeout
          this.emitApiError(err);
          observer.error(err);
        },
        () => { observer.complete(); }
      );
    });
  }

  private getHeaders(): Headers {
    return this.authSvc.getHeaders();
  }

  private emitApiError(errReponse: Response) {
    const responseBody: any = errReponse.json();
    const apiError =
      new TransomApiError(errReponse.status, responseBody.code, responseBody.message);
    this.apiErrors.next(apiError);
  }
}
