import { Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPro, Worker } from '@taskforcesh/bullmq-pro';
import { Network } from 'src/crypto';
import { WalletTask } from '../../entity';
import { Repository } from 'typeorm';
import axios, { AxiosError, Method } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyService } from 'src/content/proxy/proxy.service';

@Injectable()
export class BalanceProcessorMixins {
  constructor(
    @InjectThrottlerStorage() protected readonly storageService: ThrottlerStorage,
    @InjectRepository(WalletTask) private walletTasksRepo: Repository<WalletTask>,
    private proxyService: ProxyService,
  ) {}

  async applyRateLimit(worker: Worker, job: JobPro, network: Network, totalHitsAccept = 3) {
    const { totalHits, timeToExpire } = await this.storageService.increment(job.opts.group.id + '-' + network, 1);
    if (totalHits > totalHitsAccept) {
      await worker.rateLimitGroup(job, timeToExpire * 1000);
      throw Worker.RateLimitError();
    }
  }

  async applySkipStopped(job: JobPro) {
    if (!(await this.walletTasksRepo.findOneBy({ uuid: job.data.taskId }))) return true;
    return false;
  }

  async applySkipNotHaveProxy(job: JobPro) {
    if (!(await this.proxyService.countByUser(job.data.userId))) return true;
    return false;
  }

  private isSslHandshakeError(error: AxiosError): boolean {
    return error.message && error.message.includes('SSL routines') && error.message.includes('wrong version number');
  }

  async requestWithProxy(url: string, job: JobPro, method: Method = 'get', data?: Record<string, any>) {
    // Select random proxy
    const proxy = await this.proxyService.findRandomByUser(job.data.userId);
    if (!proxy) throw new Error();

    try {
      const proxyURL = new URL('socks://' + proxy.ip);
      proxyURL.port = proxy.port.toString();
      proxyURL.username = proxy.username;
      proxyURL.password = proxy.password;
      const httpsAgent = new SocksProxyAgent(proxyURL, {
        timeout: 3000,
      });
      return await axios.request({ httpsAgent, timeout: 3000, method, data, url });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const httpStatus = error.response?.status;
        const proxyErrors = [407, 502, 504];
        const proxyErrorMessages = ['Network Error', 'Proxy connection timed out'];

        if (proxyErrors.includes(httpStatus) || proxyErrorMessages.includes(error.message) || this.isSslHandshakeError(error)) {
          // off this proxy
          await this.proxyService.deleteProxy(proxy.uuid);
          return this.requestWithProxy(url, job, method, data);
        }
      }

      throw new Error(error);
    }
  }
}
