import { ServiceBusMessage } from '@azure/service-bus';
import { ServiceBusTopicMessage } from './service-bus-topic.message.interface';

export interface ServiceBusClientProxy {
  emit(pattern: string, payload: ServiceBusMessage): Promise<void>;
  send(queueOrTopic: string, payload: ServiceBusMessage): Promise<void>;
  sendTopicSubscription(
    topic: string,
    payload: ServiceBusTopicMessage
  ): Promise<void>;
}
