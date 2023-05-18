import { isNil } from '@nestjs/common/utils/shared.utils';
import { ClientProxy } from '@nestjs/microservices';
import {
  connectable,
  defer,
  mergeMap,
  Observable,
  Observer,
  Subject,
  throwError,
} from 'rxjs';

import { AmqpAnnotatedMessage } from '@azure/core-amqp';
import { ServiceBusMessage, ServiceBusMessageBatch } from '@azure/service-bus';
import { InvalidMessageException } from '../errors';
import {
  AzureServiceBusSenderOptions,
  ServiceBusTopicMessage,
} from '../interfaces';
type Result = AzureServiceBusSenderOptions;
type Input =
  | ServiceBusMessage
  | ServiceBusMessage[]
  | ServiceBusMessageBatch
  | AmqpAnnotatedMessage
  | AmqpAnnotatedMessage[];

export abstract class AzureServiceBusClientProxy extends ClientProxy {
  public override send<TResult = Result, TInput = Input>(
    pattern: AzureServiceBusSenderOptions,
    data: TInput
  ): Observable<TResult> {
    if (isNil(pattern) || isNil(data)) {
      return throwError(() => new InvalidMessageException());
    }

    return defer(async () => this.connect()).pipe(
      mergeMap(
        () =>
          new Observable((observer: Observer<TResult>) => {
            const callback = this.createObserver(observer);
            return this.publish({ pattern, data }, callback);
          })
      )
    );
  }

  /**
   * Send message to queue or topic
   *
   * @param pattern Queue or topic name
   * @param data Payload and properties message
   */
  public override emit<TResult = Result, TInput = Input>(
    pattern: AzureServiceBusSenderOptions,
    data: TInput
  ): Observable<TResult> {
    if (isNil(pattern) || isNil(data)) {
      return throwError(() => new InvalidMessageException());
    }
    const source = defer(async () => this.connect()).pipe(
      mergeMap(() => this.dispatchEvent({ pattern, data }))
    );
    const connectableSource = connectable(source, {
      connector: () => new Subject(),
      resetOnDisconnect: false,
    });
    connectableSource.connect();
    return connectableSource;
  }

  /**
   * Send message to topic and subscription
   */
  public sendTopicSubscription(topic: string, payload: ServiceBusTopicMessage) {
    const { subscription, ...options } = payload;
    const pattern = {
      name: topic,
    };
    const data = {
      ...options,
      subject: subscription,
    };

    return this.emit(pattern, data);
  }
}
