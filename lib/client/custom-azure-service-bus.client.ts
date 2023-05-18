import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import { Closeable } from '@nestjs/microservices';
import {
  AzureServiceBusOptions,
  ServiceBusClientProxy,
  ServiceBusTopicMessage,
} from '../interfaces';

@Injectable()
export class CustomAzureServiceBusClient
  implements ServiceBusClientProxy, Closeable
{
  // private readonly logger: Logger = new Logger(CustomAzureServiceBusClient.name);
  constructor(protected readonly options: AzureServiceBusOptions) {}

  private sbClient: ServiceBusClient;
  private _connected: boolean;

  /**
   * Check is ServiceBusClient is connected
   */
  public get isConnected(): boolean {
    return this._connected;
  }

  /**
   * Send message queue or topic
   *
   * @param pattern Queue or Topic name
   * @param message ServiceBusMessage
   */
  async emit(pattern: string, message: ServiceBusMessage) {
    //create client
    this.createSbClient();
    // create a sender for a queue/topic
    const sender = this.sbClient.createSender(pattern);
    // create a batch object
    let batch = await sender.createMessageBatch();
    // try to add the message to the batch
    if (!batch.tryAddMessage(message)) {
      // if it fails to add the message to the current batch
      // send the current batch as it is full
      await sender.sendMessages(batch);

      // then, create a new batch
      batch = await sender.createMessageBatch();

      // now, add the message failed to be added to the previous batch to this batch
      if (!batch.tryAddMessage(message)) {
        // if it still can't be added to the batch, the message is probably too big to fit in a batch
        throw new Error('Message too big to fit in a batch');
      }
    }
    // Send the last created batch of messages to the queue
    await sender.sendMessages(batch);
    //close send
    await sender.close();
  }

  /**
   * Send message queue
   *
   * @param queueOrTopic Queue or Topic name
   * @param message ServiceBusMessage
   */
  async send(queueOrTopic: string, message: ServiceBusMessage) {
    //create client
    this.createSbClient();

    // createSender() can also be used to create a sender for a topic.
    const sender = this.sbClient.createSender(queueOrTopic);

    // Tries to send array of messages in a single batch.
    // Will fail if the messages cannot fit in a batch.
    // use sendMessages
    await sender.sendMessages(message);

    // Close the sender
    await sender.close();
  }

  /**
   * Send message to topic and subscription
   */
  public sendTopicSubscription(topic: string, payload: ServiceBusTopicMessage) {
    const { subscription, ...options } = payload;
    const data = {
      ...options,
      subject: subscription,
    };

    return this.emit(topic, data);
  }

  /**
   * Create a Service Bus client
   */
  private createSbClient() {
    if (!this.sbClient) {
      const sbClient: ServiceBusClient = new ServiceBusClient(
        this.options.connectionString,
        this.options.options
      );
      this.sbClient = sbClient;
      this._connected = true;
    }
    return this.sbClient;
  }

  async close(): Promise<void> {
    this._connected = true;
    await this.sbClient?.close();
  }
}
