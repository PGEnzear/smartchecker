import { Processor, WorkerHost, OnWorkerEvent } from '@taskforcesh/nestjs-bullmq-pro';
import { Job } from '@taskforcesh/bullmq-pro';

@Processor('balance')
class BalanceProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    // do some stuff
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}