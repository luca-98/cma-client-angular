import { InjectableRxStompConfig } from '@stomp/ng2-stompjs';
import { environment } from 'src/environments/environment';


export const stompConfig: InjectableRxStompConfig = {
    brokerURL: environment.brokerURL,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 50000
};
