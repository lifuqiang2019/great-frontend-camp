import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SystemService } from './system.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('config')
  getAllConfigs() {
    return this.systemService.getAllConfigs();
  }

  @Get('config/:key')
  getConfig(@Param('key') key: string) {
    return this.systemService.getConfig(key);
  }

  @Post('config/:key')
  setConfig(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    return this.systemService.setConfig(key, dto.value);
  }
}
