import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class TransomApiAuthService {

  private apiCfg: any;
  private userObservable: ReplaySubject<any>;
  private headers: Headers;

  constructor(private http: Http, private router: Router) {
    // this.apiCfg = environment.apiclient;
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.userObservable = new ReplaySubject(1);
    // this.attemptStoredLogin();
  }

  public setConfig(cfg: any) {
    this.apiCfg = cfg;
  }

  public getHeaders(): Headers {
    return this.headers;
  }

  public currentUser(): Observable<any> {
    return this.userObservable;
  }

  public loginWithToken(token: string): Observable<any> {
    const url = `${this.apiCfg.baseUrl}/user/`;

    this.headers.delete('Authorization');
    this.headers.append('Authorization', 'Bearer ' + token);

    return Observable.create((observer: any) => {
      this.http.get(url + 'me', { headers: this.headers }).map((res: any) => res.json()).subscribe(
        (data) => {
          this.emitNewUser(data.me);
          observer.next({ success: true });
        },
        (err) => {
          this.headers.delete('Authorization');
          // localStorage.removeItem('apiToken');
          if (this.apiCfg.loginRedirect) {
            // redirect to the login page
            this.router.navigate(this.apiCfg.loginRedirect);
          }
          // do some analysis here to detemine the source of the problem
          observer.error({ success: false, message: 'Invalid token' });
        }
      );

    });

  }

  public login(username: string, password: string): Observable<any> {
    // for now this method calls the /me route and sets the current user.
    // later the credentials will be needed to call a /login route that obtains the token.
    // the token will be used to call setUserSecret, and then /me is called to set the current user

    const url = `${this.apiCfg.baseUrl}/user/`;

    const hdr: string = 'Basic ' + btoa(username + ':' + password);

    this.headers.delete('Authorization');

    this.headers.append('Authorization', hdr);

    return Observable.create((observer: any) => {
      this.http.post(url + 'login',
        JSON.stringify({ username, password }), { headers: this.headers })
        .map((res: any) => res.json()).subscribe(
        (data) => {
          if (data.success) {
            // set the auth token header to the bearer token we received
            this.headers.delete('Authorization');
            this.headers.append('Authorization', 'Bearer ' + data.token);

            // now go get the user
            this.http.get(url + 'me',
              { headers: this.headers }).map((res: any) => res.json()).subscribe(
              (meData) => {
                console.log('we are here with', meData);
                this.emitNewUser(meData.me);
                observer.next({ success: true, token: data.token });
              }
              // need to handle an error here?
              );
          }

        },
        (err) => {
          // login failed
          observer.error({ success: false });
        }
        );

    });
  }

  public getSocketToken() {
    const url = `${this.apiCfg.baseUrl}/user/sockettoken`;
    return this.http.get(url, { headers: this.headers }).map((res: any) => res.json());
  }

  private emitNewUser(usr: any) {
    usr.memberOf = (grpName: string) => {
      if (usr.groups) {
        return (usr.groups.indexOf(grpName) > -1);
      } else {
        return false;
      }
    };
    this.userObservable.next(usr);
  }

}
