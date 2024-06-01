import { RequestBuilder } from './RequestBuilder';
import { Payment } from './Payment';
import { Webhook, WebhookRequest } from './Webhook';

/**
 * A client class for interacting with the Cryptomus API.
 */
export class CryptomusClient {
  private requestBuilder: RequestBuilder;
  private webhook: Webhook;

  /**
   * Creates a new instance of the Client class.
   * @param {string} secretKey - Secret key.
   * @param {string} merchantUuid - Merchant's UUID.
   * @param {string} merchantUuid - Check client ip.
   */
  constructor(apiPaymentKey: string, merchantUuid: string, checkClientIp?: boolean) {
    this.requestBuilder = new RequestBuilder(apiPaymentKey, merchantUuid);
    this.webhook = new Webhook(apiPaymentKey, checkClientIp);
  }

  /**
   * Get the payment client for interacting with payment-related API endpoints.
   * @returns {Payment} Payment client instance.
   */
  payment(): Payment {
    return new Payment(this.requestBuilder);
  }

  /**
   * Verify a webhook signature.
   * @param {string} requestBody - The JSON-encoded request body from the webhook.
   * @param {string} clientIpAddress - Client IP Address.
   * @returns {boolean} True if the signature is valid, false otherwise.
   */
  verifyWebhookSignature(requestBody: WebhookRequest, clientIpAddress?: string): boolean {
    return this.webhook.verifySignature(requestBody, clientIpAddress);
  }
}
