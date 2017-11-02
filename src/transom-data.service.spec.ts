import { TestBed, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import {
  Http, Headers, ConnectionBackend,
  RequestOptions, BaseRequestOptions,
  Response, ResponseOptions, RequestMethod
} from '@angular/http';
import { Router } from '@angular/router';

import { TransomDataService } from './transom-data.service';
import { TransomApiAuthService } from './transom-api-auth.service';

describe('DataService', () => {

  const testCfg = {
    baseUrl: 'http://transomtest.ca/v1/abc123/1',
    socketclient: {
      url: 'http://transomsocket:8000',
      options: {}
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [Http,
        TransomDataService, TransomApiAuthService,
        {
          provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }
        },
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
    const svc: TransomDataService = TestBed.get(TransomDataService) as TransomDataService;
    svc.setConfig(testCfg);
    this.backend = TestBed.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) =>
      this.lastConnection = connection);

    // setup the headers on the Auth Service, these should be used by the Data Service
    const auth: TransomApiAuthService = TestBed.get(TransomApiAuthService) as TransomApiAuthService;
    this.hdr = new Headers();
    this.hdr.append('Authorization', 'Bearer 123');
    auth.headers = this.hdr;

  }

  );

  it('findData should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {
    service.findData('testEntity', 'name=paul').subscribe(
      data => {
        // here is data
        expect(data[0].id).toEqual(1);
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ data: [{ id: 1 }, { id: 2 }] }),
    })));

    const url: string = testCfg.baseUrl + '/db/testEntity?name=paul';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Get);


  }));

  it('findDataById should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {
    service.findDataById('testEntity', 'testIdVal').subscribe(
      data => {
        // here is data
        expect(data.id).toEqual('testIdVal');
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ id: 'testIdVal' }),
    })));

    const url: string = testCfg.baseUrl + '/db/testEntity/testIdVal';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Get);


  }));

  it('insertRecord should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {
    service.insertRecord('testEntity', { test: 'record' }).subscribe(
      data => {
        // here is data
        expect(data.id).toEqual('testIdVal');
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ id: 'testIdVal' }),
    })));

    const url: string = testCfg.baseUrl + '/db/testEntity';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Post);


  }));

  it('updateRecord should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {
    service.updateRecord('testEntity', { _id: 'id123', test: 'record' }).subscribe(
      data => {
        // here is data
        expect(data.id).toEqual('testIdVal');
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ id: 'testIdVal' }),
    })));

    const url: string = testCfg.baseUrl + '/db/testEntity/id123';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Put);


  }));


  it('deleteRecord should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {
    service.deleteRecord('testEntity', { _id: 'testIdVal' }).subscribe(
      data => {
        // here is data
        expect(data.id).toEqual('testIdVal');
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ id: 'testIdVal' }),
    })));

    const url: string = testCfg.baseUrl + '/db/testEntity/testIdVal';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Delete);


  }));

  it('postToFunction should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {
    service.postToFunction('testFunction', { test: 'record' }).subscribe(
      data => {
        // here is data
        expect(data.id).toEqual('testIdVal');
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({ id: 'testIdVal' }),
    })));

    const url: string = testCfg.baseUrl + '/fx/testFunction';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Post);


  }));

  it('getFromFunction should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {

    service.getFromFunction('testFunction', 'name=paul').subscribe(
      data => {
        // here is data
        expect(data[0].id).toEqual(1);
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify([{ id: 1 }, { id: 2 }]),
    })));

    const url: string = testCfg.baseUrl + '/fx/testFunction?name=paul';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Get);


  }));

  it('deleteFromFunction should make a properly configured request', inject([TransomDataService], (service: TransomDataService) => {

    service.deleteFromFunction('testFunction', 'name=paul').subscribe(
      data => {
        // here is data
        expect(data[0].id).toEqual(1);
      },
      err => {
        expect(err).toBeFalsy();
      }
    );
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify([{ id: 1 }, { id: 2 }]),
    })));

    const url: string = testCfg.baseUrl + '/fx/testFunction?name=paul';
    expect(this.lastConnection.request.url).toEqual(url);
    expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
    expect(this.lastConnection.request.method).toEqual(RequestMethod.Delete);


  }));

});
