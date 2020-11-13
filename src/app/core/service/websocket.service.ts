import { Injectable } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Subject } from 'rxjs';
import { stompConfig } from '../stomp.config';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  onWsMessageReceivePatient: Subject<string> = new Subject();
  onWsMessageRoomService: Subject<string> = new Subject();
  onWsMessageOrdinalNumber: Subject<string> = new Subject();
  topicSubscription: any;

  constructor(
    private rxStompService: RxStompService
  ) { }

  initSubcribe(token: string) {
    const connectHeaders = {
      Authorization: `Bearer ${token}`
    };
    const config = { ...stompConfig, connectHeaders };

    this.rxStompService.configure(config);
    this.rxStompService.activate();

    // receive patient
    const queueReceivePatient = '/topic/receive-patient';
    this.topicSubscription = this.rxStompService.watch(queueReceivePatient).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsMessageReceivePatient.next(obj);
    });

    // room service
    const queueRoomService = '/topic/room-service';
    this.topicSubscription = this.rxStompService.watch(queueRoomService).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsMessageRoomService.next(obj);
    });

    // ordinal number
    const queueOrdinalNumber = '/topic/ordinal-number';
    this.topicSubscription = this.rxStompService.watch(queueOrdinalNumber).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsMessageOrdinalNumber.next(obj);
    });
  }

  unsubcribe() {
    if (this.topicSubscription) {
      this.topicSubscription.unsubscribe();
    }
  }
}
