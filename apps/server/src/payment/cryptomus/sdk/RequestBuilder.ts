import axios from 'axios';
import * as crypto from 'crypto';

/**
 * An exception that occurs on errors in RequestBuilder.
 */
export class RequestBuilderException extends Error {
  private method: string;
  private errors: any[];

  /**
   * Creates a new instance of RequestBuilderException.
   * @param {string} message - Error message.
   * @param {number} responseCode - HTTP response code.
   * @param {string} uri - Request URI.
   * @param {any[]} errors - Array of errors (default is an empty array).
   * @param {Error | null} previous - Previous error (default is null).
   */
  constructor(message: string, responseCode: number, uri: string, errors: any[] = [], previous: Error | null = null) {
    super(message);
    this.method = uri;
    this.errors = errors;
  }

  /**
   * Returns the URI of the method that triggered the error.
   * @returns {string} Method URI.
   */
  getMethod(): string {
    return this.method;
  }

  /**
   * Returns an array of errors associated with the request.
   * @returns {any[]} Array of errors.
   */
  getErrors(): any[] {
    return this.errors;
  }
}

/**
 * A class for creating and sending HTTP requests.
 */
export class RequestBuilder {
  private static API_URL = "https://api.cryptomus.com/";

  /**
   * Creates a new instance of RequestBuilder.
   * @param {string} apiKey - Secret key.
   * @param {string} merchantUuid - Merchant's UUID.
   */
  constructor(private apiKey: string, private merchantUuid: string) {}

  /**
   * Sends an HTTP request.
   * @param {string} endpoint - Request endpoint (URI).
   * @param {Record<string, any>} data - Request data (default is {}).
   * @returns {Promise<boolean | any>} Request result.
   * @throws {RequestBuilderException} In case of an error.
   */
  async sendRequest(endpoint: string, data: Record<string, any> = {}): Promise<boolean | any> {
    const url = `${RequestBuilder.API_URL}${endpoint}`;
    const body = JSON.stringify(data);

    const sign = this.generateSign(body); // Generate MD5 hash
    const headers = {
      'merchant': this.merchantUuid,
      'sign': sign, // Use the generated MD5 hash
    };

    try {
      const response = await axios.post(url, body, { headers });
      return response.data;
    } catch (error) {
      throw new RequestBuilderException(error.message, error.response?.status, endpoint);
    }
  }

  /**
   * Generates an MD5 hash of the request.
   * @param {string} body - Request body.
   * @returns {string} MD5 hash of the request.
   */
  private generateSign(body: string): string {
    // Encode the body to base64
    const encodedBody = Buffer.from(body).toString('base64');
    
    // Combine the encoded body and API key, then calculate the MD5 hash
    const combinedData = encodedBody + this.apiKey;
    const md5Hash = crypto.createHash('md5').update(combinedData).digest('hex');
    
    return md5Hash;
  }
}
