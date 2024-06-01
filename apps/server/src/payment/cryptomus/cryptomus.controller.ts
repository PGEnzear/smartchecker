import { Body, Controller, Post } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { CryptomusService } from "./cryptomus.service";
import { WebhookRequest } from "./sdk";

@ApiExcludeController()
@Controller("payment/cryptomus")
export class CryptomusController {
  constructor (
    private cryptomusService: CryptomusService
  ) {}
  @Post()

  webhook(@Body() body: WebhookRequest) {
    return this.cryptomusService.verify(body)
  }
}