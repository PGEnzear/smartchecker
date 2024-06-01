import * as crypto from 'crypto';

enum PaymentStatus {
  ConfirmCheck = "confirm_check",
  Paid = "paid",
  PaidOver = "paid_over",
  Fail = "fail",
  WrongAmount = "wrong_amount",
  Cancel = "cancel",
  SystemFail = "system_fail",
  RefundProcess = "refund_process",
  RefundFail = "refund_fail",
  RefundPaid = "refund_paid",
}

type ConvertInfo = {
  to_currency: string;
  commission?: string;
  rate: string;
  amount: string;
};

export type WebhookRequest = {
  type: string;
  uuid: string;
  order_id: string;
  amount: string;
  payment_amount: string;
  payment_amount_usd: string;
  merchant_amount: string;
  commission: string;
  is_final: boolean;
  status: PaymentStatus;
  from: string;
  wallet_address_uuid: string;
  network: string;
  currency: string;
  payer_currency: string;
  additional_data: string;
  convert: ConvertInfo;
  txid: string;
  sign: string;
};


export class Webhook {
  private apiPaymentKey: string;
  private checkClientIp: boolean | undefined;

  constructor(apiPaymentKey: string, checkClientIp?: boolean) {
    this.apiPaymentKey = apiPaymentKey;
    this.checkClientIp = checkClientIp;
  }

  /**
   * Verify a webhook signature.
   * @param {string} requestBody - The JSON-encoded request body from the webhook.
   * @param {string} clientIpAddress - Client IP Address.
   * @returns {boolean} True if the signature is valid, false otherwise.
   */
  verifySignature(requestBody: WebhookRequest, clientIpAddress?: string): boolean {
    // Extract the signature from the data and remove it
    const receivedSignature = requestBody.sign;
    delete requestBody.sign;

    // Calculate the expected signature
    const expectedSignature = crypto
      .createHash('md5')
      .update(Buffer.from(JSON.stringify(requestBody, null, 0), 'utf8').toString('base64') + this.apiPaymentKey)
      .digest('hex');

    // Compare the received and expected signatures
    const isSignatureValid = crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(receivedSignature, 'hex'));

    // Check if the client's IP address matches the allowed IP address
    const isIpAddressValid = !this.checkClientIp || clientIpAddress === '91.227.144.54';

    // Return true only if both signature and IP address are valid
    return isSignatureValid && isIpAddressValid;
  }
}
