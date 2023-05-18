import {
  ServiceBusClient,
  ServiceBusClientOptions,
  ServiceBusSenderOptions,
} from '@azure/service-bus';

/**
 * Factory for Service Bus Client
 */
export class CustomServiceBusClientFactory {
  /**
   * Create ServiceBusClient for Azure Service Bus
   *
   * @param {string} connectionString connection string to your Service Bus namespace
   *
   * @returns {ServiceBusClient}
   */
  static createClient(
    connectionString: string,
    options?: ServiceBusClientOptions
  ): ServiceBusClient {
    // create a Service Bus client using the connection string to the Service Bus namespace
    return new ServiceBusClient(connectionString, options);
  }

  /**
   * Create ServiceBusSender for Azure Service Bus
   *
   * @param {string} connectionString connection string to your Service Bus namespace
   */
  static createSender(
    queueOrTopicName: string,
    sbClient: ServiceBusClient,
    options?: ServiceBusSenderOptions
  ) {
    // createSender() can also be used to create a sender for a topic.
    return sbClient.createSender(queueOrTopicName, options);
  }
}
