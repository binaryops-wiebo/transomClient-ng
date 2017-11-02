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
        { provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); } },
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
    let service: TransomApiAuthService = TestBed.get(TransomApiAuthService) as TransomApiAuthService;
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
      data => {
        expect(data).toEqual({ success: true });

      },
      err => {
        expect(err).toEqual({ success: false });
      }
    );

    // this is the login attempt using the token from the localStorage
    // this.connections[0].mockError(new Response(new ResponseOptions({
    //   body: JSON.stringify({ success: false, message: 'bad code' }),
    //   status: 401,
    //   type: ResponseType.Error
    // })));

    const me_url: string = testCfg.baseUrl + '/user/me';
    // expect(this.connections[0].request.url).toEqual(me_url);
    // // auth token provided should have come from localStorage
    // expect(this.connections[0].request.headers.get('Authorization')).toEqual('Bearer badtoken'); // see beforeEach
    // expect(this.connections[0].request.method).toEqual(RequestMethod.Get);

    // now the real login attempt
    const login_url: string = testCfg.baseUrl + '/user/login';
    expect(this.connections[0].request.url).toEqual(login_url);
    // auth token provided should have come from localStorage
    const basicToken = btoa('testname:testpassword');
    expect(this.connections[0].request.headers.get('Authorization')).toEqual('Basic ' + basicToken); // see beforeEach
    expect(this.connections[0].request.method).toEqual(RequestMethod.Post);

    // let's repond with a success and a token
    this.connections[0].mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ success: true, token: 'received_token_123' }),
    })));

    // next is the request on /user/me
    // now the real login attempt
    expect(this.connections[1].request.url).toEqual(me_url);
    // auth token provided should have come from localStorage
    expect(this.connections[1].request.headers.get('Authorization')).toEqual('Bearer received_token_123'); // see beforeEach
    expect(this.connections[1].request.method).toEqual(RequestMethod.Get);

    // let's repond with a test user object
    this.connections[1].mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ me: { email: 'email@transomtest.ca', display_name: 'tester 2' } }),
    })));

    // that should get emitted on the currentUser observable
    let userReceived = false;
    service.currentUser().subscribe(
      usr => {
        console.log('****', usr);
        expect(usr.email).toEqual('email@transomtest.ca');
        userReceived = true;
      }
    );

    expect(userReceived).toBeTruthy();
  }));

});
