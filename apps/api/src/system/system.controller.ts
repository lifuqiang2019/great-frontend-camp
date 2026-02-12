import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('config')
  @UseGuards(AdminGuard)
  getAllConfigs() {
    return this.systemService.getAllConfigs();
  }

  @Get('config/:key')
  getConfig(@Param('key') key: string) {
    return this.systemService.getConfig(key);
  }

  @Post('config/batch')
  getBatchConfigs(@Body() body: { keys: string[] }) {
    return this.systemService.getConfigs(body.keys);
  }

  @Post('config/:key')
  @UseGuards(AdminGuard)
  setConfig(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    return this.systemService.setConfig(key, dto.value);
  }
}
