import { DynamicModule, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { CustomAzureServiceBusClient } from './client/custom-azure-service-bus.client';
import {
  AzureServiceBusModuleAsyncOptions,
  AzureServiceBusModuleOptions,
  AzureServiceBusModuleOptionsFactory,
  AzureServiceBusProviderAsyncOptions,
  ServiceBusClientProxy,
} from './interfaces';
import { Closeable } from '@nestjs/microservices';

/**
 * Custom Azure Service Bus Module
 */
@Module({})
export class CustomAzureServiceBusModule {
  static forRoot(options: AzureServiceBusModuleOptions): DynamicModule {
    const AzureServiceBus = (options || []).map((item) => ({
      provide: item.name,
      useValue: this.assignOnAppShutdownHook(new CustomAzureServiceBusClient(item)),
    }));

    return {
      module: CustomAzureServiceBusModule,
      providers: AzureServiceBus,
      exports: AzureServiceBus,
    };
  }
  static forRootAsync(
    options: AzureServiceBusModuleAsyncOptions
  ): DynamicModule {
    const providers: Provider[] = options.reduce(
      (accProviders: Provider[], item) =>
        accProviders
          .concat(this.createAsyncProviders(item))
          .concat(item.extraProviders || []),
      []
    );
    const imports = options.reduce(
      (accImports, option) =>
        option.imports && !accImports.includes(option.imports)
          ? accImports.concat(option.imports)
          : accImports,
      []
    );
    return {
      module: CustomAzureServiceBusModule,
      imports,
      providers: providers,
      exports: providers,
    };
  }

  private static createAsyncProviders(
    options: AzureServiceBusProviderAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: AzureServiceBusProviderAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: options.name,
        useFactory: this.createFactoryWrapper(options.useFactory),
        inject: options.inject || [],
      };
    }
    return {
      provide: options.name,
      useFactory: this.createFactoryWrapper(
        (optionsFactory: AzureServiceBusModuleOptionsFactory) =>
          optionsFactory.createAzureServiceBusOptions()
      ),
      inject: [options.useExisting || options.useClass],
    };
  }

  private static createFactoryWrapper(
    useFactory: AzureServiceBusProviderAsyncOptions['useFactory']
  ) {
    return async (...args: any[]) => {
      const clientOptions = await useFactory(...args);
      return new CustomAzureServiceBusClient(clientOptions);
    };
  }

  private static assignOnAppShutdownHook(
    client: ServiceBusClientProxy & Closeable
  ) {
    (client as unknown as OnApplicationShutdown).onApplicationShutdown =
      client.close;
    return client;
  }
}
