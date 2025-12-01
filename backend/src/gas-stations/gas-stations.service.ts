import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateStationDto = {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  hasElectricCharger?: boolean;
  fuelPrices?: {
    fuelType: string;
    price: number;
  }[];
};

type UpdatePricesDto = {
  fuelPrices: {
    fuelType: string;
    price: number;
  }[];
  reportedBy?: string;
};

type ReportStationDto = {
  reportType: string;
  comment?: string;
};

@Injectable()
export class GasStationsService {
  constructor(private prisma: PrismaService) {}

  // Lista todos os postos
  async findAll() {
    const stations = await this.prisma.gasStation.findMany({
      include: {
        fuelPrices: {
          orderBy: { reportedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stations.map((station) => {
      const latestPrices: Record<string, { price: number; reportedAt: Date }> = {};
      
      station.fuelPrices.forEach((fp) => {
        if (!latestPrices[fp.fuelType] || fp.reportedAt > latestPrices[fp.fuelType].reportedAt) {
          latestPrices[fp.fuelType] = {
            price: fp.price,
            reportedAt: fp.reportedAt,
          };
        }
      });

      return {
        id: station.id,
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address,
        hasElectricCharger: station.hasElectricCharger,
        prices: latestPrices,
        createdAt: station.createdAt,
        updatedAt: station.updatedAt,
      };
    });
  }

  // Lista postos próximos (raio de ~10km)
  async findNearby(lat: number, lng: number, radiusKm = 10) {
    // Cálculo aproximado: 1 grau ≈ 111km
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const stations = await this.prisma.gasStation.findMany({
      where: {
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
      },
      include: {
        fuelPrices: {
          orderBy: { reportedAt: 'desc' },
          take: 10, // últimos 10 preços de cada tipo
        },
      },
      take: 100, // máximo 100 postos
    });

    // Retorna com preços mais recentes de cada tipo
    return stations.map((station) => {
      const latestPrices: Record<string, { price: number; reportedAt: Date }> = {};
      
      station.fuelPrices.forEach((fp) => {
        if (!latestPrices[fp.fuelType] || fp.reportedAt > latestPrices[fp.fuelType].reportedAt) {
          latestPrices[fp.fuelType] = {
            price: fp.price,
            reportedAt: fp.reportedAt,
          };
        }
      });

      return {
        id: station.id,
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address,
        hasElectricCharger: station.hasElectricCharger,
        prices: latestPrices,
        createdAt: station.createdAt,
        updatedAt: station.updatedAt,
      };
    });
  }

  // Cria novo posto
  async create(dto: CreateStationDto) {
    const station = await this.prisma.gasStation.create({
      data: {
        name: dto.name,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        hasElectricCharger: dto.hasElectricCharger ?? false,
        fuelPrices: dto.fuelPrices
          ? {
              create: dto.fuelPrices.map((fp) => ({
                fuelType: fp.fuelType,
                price: fp.price,
              })),
            }
          : undefined,
      },
      include: {
        fuelPrices: true,
      },
    });

    return station;
  }

  // Atualiza preços de um posto
  async updatePrices(stationId: string, dto: UpdatePricesDto) {
    // Cria novos registros de preço (histórico)
    await this.prisma.fuelPrice.createMany({
      data: dto.fuelPrices.map((fp) => ({
        gasStationId: stationId,
        fuelType: fp.fuelType,
        price: fp.price,
        reportedBy: dto.reportedBy,
      })),
    });

    // Atualiza timestamp do posto
    await this.prisma.gasStation.update({
      where: { id: stationId },
      data: { updatedAt: new Date() },
    });

    return { success: true };
  }

  // Reporta problema com posto
  async report(stationId: string, dto: ReportStationDto) {
    await this.prisma.stationReport.create({
      data: {
        gasStationId: stationId,
        reportType: dto.reportType,
        comment: dto.comment,
      },
    });

    return { success: true };
  }

  // Busca detalhes de um posto
  async findOne(id: string) {
    const station = await this.prisma.gasStation.findUnique({
      where: { id },
      include: {
        fuelPrices: {
          orderBy: { reportedAt: 'desc' },
          take: 20,
        },
        reports: {
          orderBy: { reportedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!station) return null;

    // Agrupa preços por tipo (mostra histórico)
    const pricesByType: Record<string, any[]> = {};
    station.fuelPrices.forEach((fp) => {
      if (!pricesByType[fp.fuelType]) {
        pricesByType[fp.fuelType] = [];
      }
      pricesByType[fp.fuelType].push({
        price: fp.price,
        reportedAt: fp.reportedAt,
      });
    });

    return {
      ...station,
      pricesByType,
    };
  }

  // Deleta um posto
  async delete(id: string) {
    await this.prisma.gasStation.delete({
      where: { id },
    });

    return { success: true, message: 'Posto deletado com sucesso' };
  }
}
