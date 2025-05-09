import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { AppLogger } from '../logger/logger.service';
import { Public } from '../modules/auth/decorators/public-route';



@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(HealthController.name);
  }


  @Get()
  @Public()
  @HealthCheck()
  async check() {
    this.logger.debug("Checking Health Status...")

    return this.health.check([
      async () => this.typeOrmHealthIndicator.pingCheck("database"),
      async () => this.memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),
      async () => this.memoryHealthIndicator.checkRSS('memory_rss', 300 * 1024 * 1024),
    ])

  }


}