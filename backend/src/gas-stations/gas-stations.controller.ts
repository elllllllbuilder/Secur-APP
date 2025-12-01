import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { GasStationsService } from './gas-stations.service';

@Controller('gas-stations')
export class GasStationsController {
  constructor(private readonly service: GasStationsService) {}

  // GET /gas-stations (listar todos)
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  // GET /gas-stations/nearby?lat=-23.5505&lng=-46.6333
  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 10;

    return this.service.findNearby(latitude, longitude, radiusKm);
  }

  // GET /gas-stations/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // POST /gas-stations
  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  // POST /gas-stations/:id/prices
  @Post(':id/prices')
  async updatePrices(@Param('id') id: string, @Body() body: any) {
    return this.service.updatePrices(id, body);
  }

  // POST /gas-stations/:id/report
  @Post(':id/report')
  async report(@Param('id') id: string, @Body() body: any) {
    return this.service.report(id, body);
  }

  // DELETE /gas-stations/:id
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
