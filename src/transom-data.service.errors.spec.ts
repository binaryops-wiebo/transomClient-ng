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

describe('DataService Errors', () => {

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
                    provide: Router, useClass:
                        class { public navigate = jasmine.createSpy('navigate'); }
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
        const auth: TransomApiAuthService =
            TestBed.get(TransomApiAuthService) as TransomApiAuthService;
        
        auth.getHeaders().append('Authorization', 'Bearer 123');
        this.hdr = auth.getHeaders()
    });

    it('findData error should emit ',
        inject([TransomDataService], (service: TransomDataService) => {
        let errCnt = 0;
        service.dataApiErrors().subscribe(
            (errData) => {
                expect(errData.errorText).toEqual('token is bad');
                errCnt++;

            }
        );

        service.findData('testEntity', 'name=paul').subscribe(
            (data) => {
                // here is data
                expect(data[0].id).toEqual(1);
            },
            (err) => {
                expect(err.status).toEqual(401);
            }
        );
        this.lastConnection.mockError(new Response(new ResponseOptions({
            body: JSON.stringify({ code: 'InvalidCredentials', message: 'token is bad' }),
            status: 401
        })));

        const url: string = testCfg.baseUrl + '/db/testEntity?name=paul';
        expect(this.lastConnection.request.url).toEqual(url);
        expect(this.lastConnection.request.headers.get('Authorization')).toEqual('Bearer 123');
        expect(this.lastConnection.request.method).toEqual(RequestMethod.Get);
        expect(errCnt).toEqual(1);

    }));

});
