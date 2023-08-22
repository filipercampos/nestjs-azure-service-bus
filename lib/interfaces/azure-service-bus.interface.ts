import {
  OperationOptionsBase,
  ServiceBusClientOptions,
} from '@azure/service-bus';

export interface AzureServiceBusSubscriptionOptions {
  /**
   * Create subscription and rule by decorator `@Subscription`
   *
   * Default is true
   *
   * If `createSubs` is true `updateSubs` will be cancelled when subscription exists
   */
  createSubs?: boolean;
  /**
   * Update subscription with rule by decorator `@Subscription`
   *
   * Subscription must be exists
   *
   * Default is false
   */
  updateSubs?: boolean;
}

export interface AzureServiceBusOptions
  extends AzureServiceBusSubscriptionOptions {
  /**
   * Connection string and related Service Bus entity names here
   *
   * Endpoint=sb://${url}.servicebus.windows.net'/;SharedAccessKeyName=${sharedAccessKeyName};SharedAccessKey=${sharedAccessKey}`;
   */
  connectionString: string;
  /**
   * Options that can be provided while creating the ServiceBusClient.
   */
  options?: ServiceBusClientOptions;
}

export interface AzureServiceBusSenderOptions {
  name: string;
  options?: OperationOptionsBase;
}

export interface AzureServiceBusAdminOptions
  extends AzureServiceBusSubscriptionOptions {
  /**
   * Connection string and related Service Bus entity names here
   *
   * Endpoint=sb://${url}.servicebus.windows.net'/;SharedAccessKeyName=${sharedAccessKeyName};SharedAccessKey=${sharedAccessKey}`;
   */
  connectionString: string;
}
