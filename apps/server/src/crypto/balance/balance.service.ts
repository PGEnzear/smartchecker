import { QueuePro } from "@taskforcesh/bullmq-pro";
import { InjectQueue } from "@taskforcesh/nestjs-bullmq-pro";

export class BalanceService {
  constructor(@InjectQueue('balance') private balanceQueue: QueuePro) {}

  stopQueue() {

  }

  pauseQueue() {

  }

  resumeQueue() {
    
  }
}