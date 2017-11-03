import { TestBed, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import {
  Http, Headers, ConnectionBackend,
  RequestOptions, BaseRequestOptions,
  Response, ResponseOptions, RequestMethod, ResponseType
} from '@angular/http';
import { RouterModule, Router } from '@angular/router';

import { TransomApiAuthService } from './transom-api-auth.service';

describe('ApiAuthService', () => {

  const testCfg = {
    baseUrl: 'http://transomtest.ca/v1/abc123/1',
    socketclient: {
      url: 'http://transomsocket:8000',
      options: {}
    }
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterModule
      ],
      providers: [
        Http,
        TransomApiAuthService,
        { provide: Router, useClass: class { public navigate = jasmine.createSpy('navigate'); } },
        {
          provide: ConnectionBackend, useClass: MockBackend
        },
        {
          provide: RequestOptions, useClass: BaseRequestOptions
        }
      ]
    });
  });

  beforeEach(() => {
    const service: TransomApiAuthService =
      TestBed.get(TransomApiAuthService) as TransomApiAuthService;
    service.setConfig(testCfg);

    this.connections = [];
    this.backend = TestBed.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => {
      this.connections.push(connection);
    });
  });

  it('should be created', inject([TransomApiAuthService], (service: TransomApiAuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should login', inject([TransomApiAuthService], (service: TransomApiAuthService) => {

    service.login('testname', 'testpassword').subscribe(
      (data) => {
        expect(data).toEqual({ success: true, token: 'received_token_123' });
      },
      (err) => {
        expect(err).toEqual({ success: false });
      }
    );

    // let's repond with a success and a token
    this.connections[0].mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ success: true, token: 'received_token_123' }),
    })));

    const meUrl: string = testCfg.baseUrl + '/user/me';

    // now the real login attempt
    const loginUrl: string = testCfg.baseUrl + '/user/login';
    expect(this.connections[0].request.url).toEqual(loginUrl);
    // auth token provided should have come from localStorage
    const basicToken = btoa('testname:testpassword');
    expect(this.connections[0].request.headers.get('Authorization'))
      .toEqual('Basic ' + basicToken);
    expect(this.connections[0].request.method).toEqual(RequestMethod.Post);

    // next is the request on /user/me
    // now the real login attempt
    expect(this.connections[1].request.url).toEqual(meUrl);
    // auth token provided should have come from localStorage
    expect(this.connections[1].request.headers.get('Authorization'))
      .toEqual('Bearer received_token_123');
    expect(this.connections[1].request.method).toEqual(RequestMethod.Get);

    // let's repond with a test user object
    this.connections[1].mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ me: { email: 'email@transomtest.ca', display_name: 'tester 2' } }),
    })));

    // that should get emitted on the currentUser observable
    let userReceived = false;
    service.currentUser().subscribe(
      (usr) => {
        console.log('****', usr);
        expect(usr.email).toEqual('email@transomtest.ca');
        userReceived = true;
      }
    );

    expect(userReceived).toBeTruthy();
  }));

});
