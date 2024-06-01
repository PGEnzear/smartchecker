import { RequestBuilder } from './RequestBuilder';

export type PaymentResult = {
  state: number;
  result: PaymentInfo;
};

type PaymentData = {
  amount: string;
  currency: string;
  network?: string;
  order_id: string;
  url_return?: string;
  url_callback?: string;
  is_payment_multiple?: boolean;
  lifetime?: string;
  to_currency?: string;
};

type PaymentInfo = {
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount?: string;
  payer_amount?: string;
  discount_percent?: string;
  discount: string;
  payer_currency?: string;
  currency: string;
  merchant_amount?: string;
  network?: string;
  address?: string;
  from?: string;
  txid?: string;
  payment_status: string;
  url: string;
  expired_at: number;
  status: string;
  is_final: boolean;
  additional_data?: string;
  created_at: Date;
  updated_at: Date;
};

/**
 * A class for interacting with the payment part of the API.
 */
export class Payment {
  private version: string = 'v1';

  /**
   * Creates a new instance of the Payment class.
   * @param {RequestBuilder} requestBuilder - RequestBuilder object for sending requests.
   */
  constructor(private requestBuilder: RequestBuilder) {}

  /**
   * Get available payment services.
   * @param {Record<string, any>} parameters - Additional request parameters (default is {}).
   * @returns {Promise<boolean | any>} Request result.
   * @throws {RequestBuilderException} In case of an error.
   */
  async services(parameters: Record<string, any> = {}): Promise<boolean | any> {
    return this.requestBuilder.sendRequest(`${this.version}/payment/services`, parameters);
  }

  /**
   * Create a payment.
   * @param {Record<string, any>} data - Payment data.
   * @returns {Promise<boolean | any>} Request result.
   * @throws {RequestBuilderException} In case of an error.
   */
  async create(data: PaymentData): Promise<PaymentResult> {
    return this.requestBuilder.sendRequest(`${this.version}/payment`, data);
  }

  // Other methods of the Payment class here

  /**
   * Get payment information by UUID or order_id.
   * @param {Record<string, string>} data - Data for the request.
   * @returns {Promise<boolean | any>} Request result.
   * @throws {RequestBuilderException} In case of an error.
   */
  async info(data: { uuid?: string; order_id?: string } = {}): Promise<any> {
    return this.requestBuilder.sendRequest(`${this.version}/payment/info`, data);
  }

  /**
   * Get payment history with pagination.
   * @param {string | number} page - Page number or cursor.
   * @param {Record<string, any>} parameters - Additional request parameters (default is {}).
   * @returns {Promise<boolean | any>} Request result.
   * @throws {RequestBuilderException} In case of an error.
   */
  async history(page: string | number = 1, parameters: Record<string, any> = {}): Promise<boolean | any> {
    const data = { ...parameters, cursor: String(page) };
    return this.requestBuilder.sendRequest(`${this.version}/payment/list`, data);
  }

  // Other methods of the Payment class with proper JSDoc comments here

  /**
   * Create a wallet.
   * @param {Record<string, any>} data - Data for the request.
   * @returns {Promise<boolean | any>} Request result.
   * @throws {RequestBuilderException} In case of an error.
   */
  async createWallet(data: {
    network: string;
    currency: string;
    order_id: string;
    url_callback?: string;
  }): Promise<boolean | any> {
    return this.requestBuilder.sendRequest(`${this.version}/wallet`, data);
  }
}
