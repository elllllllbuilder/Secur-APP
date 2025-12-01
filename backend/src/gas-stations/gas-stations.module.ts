import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GasStationsController } from './gas-stations.controller';
import { GasStationsService } from './gas-stations.service';

@Module({
  imports: [PrismaModule],
  controllers: [GasStationsController],
  providers: [GasStationsService],
})
export class GasStationsModule {}
