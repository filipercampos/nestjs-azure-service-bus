import { ServiceBusAdministrationClient } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import { AzureServiceBusAdminOptions } from '../interfaces';

@Injectable()
export class ServiceBusAdminClient {
  // private readonly logger: Logger = new Logger(ServiceBusAdminClient.name);
  private sbAdminClient: ServiceBusAdministrationClient;
  constructor(protected readonly options: AzureServiceBusAdminOptions) {
    this.createSbAdminClient();
  }

  /**
   * Create subscription if not exists
   *
   * @param topicName Topic name
   */
  async createTopic(topicName: string) {
    const topicExists = await this.sbAdminClient.topicExists(topicName);
    if (!topicExists) {
      // Create the topic
      await this.sbAdminClient.createTopic(topicName);
    }
  }

  /**
   * Create subscription on Topic if not exists
   *
   * @param topicName Topic name
   * @param subscriptionName The subscription names for our topics
   */
  async createSubscription(topicName: string, subscriptionName: string) {
    //rule name
    // Default rule name
    // const DEFAULT_RULE_NAME = '$Default';
    const ruleName = `${pascalCase(subscriptionName)}SqlRule`;
    const createSubs = this.options.createSubs ?? true;

    //check subscription
    const subscriptionExists = await this.sbAdminClient.subscriptionExists(
      topicName,
      subscriptionName
    );

    //verify permission to create
    if (!subscriptionExists && createSubs) {
      // Create the next subscription, which will filter out non-red colors
      await this.sbAdminClient.createSubscription(topicName, subscriptionName, {
        defaultRuleOptions: {
          name: ruleName,
          filter: {
            //correlation filter
            subject: subscriptionName,
          },
        },
      });
    }
    //verify permission to update
    if (subscriptionExists && this.options.updateSubs == true) {
      const ruleExists = await this.sbAdminClient.ruleExists(
        topicName,
        subscriptionName,
        ruleName
      );
      if (!ruleExists) {
        await this.sbAdminClient.createRule(
          topicName,
          subscriptionName,
          ruleName,
          {
            //correlation subscription
            subject: subscriptionName,
          }
        );
      }
    }
  }

  /**
   * Create a Service Bus client
   */
  private createSbAdminClient() {
    if (!this.sbAdminClient) {
      const sbAdminClient = new ServiceBusAdministrationClient(
        this.options.connectionString
      );
      this.sbAdminClient = sbAdminClient;
    }
    return this.sbAdminClient;
  }
}

function pascalCase(text: string) {
  const snakeToCamel = (str: string) =>
    str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());

  const camelCase = snakeToCamel(text);
  const pascalCase = camelCase[0].toUpperCase() + camelCase.substring(1);
  return pascalCase;
}
