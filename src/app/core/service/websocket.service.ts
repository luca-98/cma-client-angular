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
  onWsMessagePermission: Subject<string> = new Subject();
  onWsUpdatePaymentStatus: Subject<string> = new Subject();
  lstTopicSubscription = [];

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
    this.lstTopicSubscription.push(this.rxStompService.watch(queueReceivePatient).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsMessageReceivePatient.next(obj);
    }));

    // room service
    const queueRoomService = '/topic/room-service';
    this.lstTopicSubscription.push(this.rxStompService.watch(queueRoomService).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsMessageRoomService.next(obj);
    }));

    // ordinal number
    const queueOrdinalNumber = '/topic/ordinal-number';
    this.lstTopicSubscription.push(this.rxStompService.watch(queueOrdinalNumber).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsMessageOrdinalNumber.next(obj);
    }));

    // update permission
    const queuePermission = '/topic/permission';
    this.lstTopicSubscription.push(this.rxStompService.watch(queuePermission).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsMessagePermission.next(obj);
    }));

    // update payment status
    const queueUpdatePaymentStatus = '/topic/payment-status';
    this.lstTopicSubscription.push(this.rxStompService.watch(queueUpdatePaymentStatus).subscribe((message: any) => {
      const obj = JSON.parse(message.body);
      console.log('On WS message: ', obj);
      this.onWsUpdatePaymentStatus.next(obj);
    }));
  }

  unsubcribe() {
    for (const e of this.lstTopicSubscription) {
      e.unsubscribe();
    }
    this.lstTopicSubscription = [];
  }
}
