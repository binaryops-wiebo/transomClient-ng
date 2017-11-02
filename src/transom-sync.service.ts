import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import { TransomApiAuthService } from './transom-api-auth.service';
import 'rxjs/add/operator/map';

@Injectable()
export class TransomSyncService {

  private apiCfg: any;
  private url: string;
  private ioSocket: any;
  private subscribersCounter = 0;

  constructor(private authSvc: TransomApiAuthService) {
  }

  public init(cfg: any) {
    this.apiCfg = cfg;
    const options = this.apiCfg.socketclient.options || {};
    options.autoConnect = false;

    this.ioSocket = io(this.apiCfg.socketclient.url, options);

    this.ioSocket.on('connect_error', (err: any) => {
      console.log('connect err', err);
    });

    this.ioSocket.on('error', (err: any) => {
      if (err === 'INVALID_TOKEN') {
        this.ioSocket.disconnect();
        this.connect();
      }
    });

    this.ioSocket.on('disconnect', (err: any) => {
      console.log('** disconnected!!', err);
    });

    this.authSvc.currentUser().subscribe(
      (user) => {
        this.connect();
      }
    );
  }

  public on(eventName: string, callback: any) {
    this.ioSocket.on(eventName, callback);
  }

  public once(eventName: string, callback: any) {
    this.ioSocket.once(eventName, callback);
  }

  public connect() {

    // collect the new token!!!
    this.authSvc.getSocketToken().subscribe(
      (data) => {

        this.ioSocket.io.opts.query = {
          token: data.token
        };
        this.ioSocket.connect();
      },
      (err) => {
        throw new Error('Error getting socket token: ' + err);
      }
    );
  }

  public disconnect(close?: any) {
    return this.ioSocket.disconnect.apply(this.ioSocket, arguments);
  }

  public emit(eventName: string, data?: any, callback?: any) {
    return this.ioSocket.emit.apply(this.ioSocket, arguments);
  }

  public removeListener(eventName: string, callback?: any) {
    return this.ioSocket.removeListener.apply(this.ioSocket, arguments);
  }

  public removeAllListeners(eventName?: string) {
    return this.ioSocket.removeAllListeners.apply(this.ioSocket, arguments);
  }

  /** create an Observable from an event */
  public fromEvent<T>(eventName: string): Observable<T> {
    this.subscribersCounter++;
    return Observable.create((observer: any) => {
      this.ioSocket.on(eventName, (data: T) => {
        observer.next(data);
      });
      return () => {
        if (this.subscribersCounter === 1) {
          this.ioSocket.removeListener(eventName);
        }
      };
    }).share();
  }

  /* Creates a Promise for a one-time event */
  // fromEventOnce<T>(eventName: string): Promise<T> {
  //   return new Promise<T>(resolve => this.once(eventName, resolve));
  // }
}
