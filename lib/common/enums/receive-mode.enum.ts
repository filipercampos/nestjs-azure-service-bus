/**
 * The mode in which messages should be received. The 2 modes are `peekLock` and `receiveAndDelete`.
 */
export enum ReceiveMode {
  /**
   * Once a message is received in this mode, the receiver has a lock on the message for a
   * particular duration. If the message is not settled by this time, it lands back on Service Bus
   * to be fetched by the next receive operation.
   * @type {String}
   */
  peekLock = 'peekLock',

  /**
   * Messages received in this mode get automatically removed from Service Bus.
   * @type {String}
   */
  receiveAndDelete = 'receiveAndDelete',
}
