import { ServiceBusMessage } from '@azure/service-bus';

/**
 * Describes the message to be sent to Service Bus topic and subscription
 */
export interface ServiceBusTopicMessage extends ServiceBusMessage {
  /**
   * The application specific label. This property enables the
   * application to indicate the purpose of the message to the receiver in a standardized. fashion,
   * similar to an email subject line. The mapped AMQP property is "subject".
   */
  subscription: string;
}
