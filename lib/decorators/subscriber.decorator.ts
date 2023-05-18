import { EventPattern } from '@nestjs/microservices';

import { SB_SUBSCRIBER_METADATA } from '../azure-service-bus.constants';
import {
  MetaOrMetaFactory,
  SbSubscriptionMetadataOptions,
} from '../interfaces';
import { SbSubscriberMetadata } from '../metadata';

export type SubscriberMetadataForTarget = Array<{
  key: string | symbol;
  metadata: SbSubscriberMetadata;
}>;

function storeMetadata(
  target: object,
  key: string | symbol,
  metadata: SbSubscriberMetadata
): void {
  const col: SubscriberMetadataForTarget =
    Reflect.getMetadata(SB_SUBSCRIBER_METADATA, target) || [];
  if (col.push({ key, metadata }) === 1) {
    Reflect.defineMetadata(SB_SUBSCRIBER_METADATA, col, target);
  }
}

export function Subscription(
  metadata: MetaOrMetaFactory<SbSubscriptionMetadataOptions>
) {
  return (
    target: object,
    key: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    const sbSubscriberMetadata = new SbSubscriberMetadata(
      'subscription',
      metadata
    );

    storeMetadata(target, key, sbSubscriberMetadata);

    if (descriptor) {
      return EventPattern(sbSubscriberMetadata)(target, key, descriptor);
    }
  };
}
