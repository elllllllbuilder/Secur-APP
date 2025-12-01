import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        method: true,
        provider: true,
        status: true,
        amountCents: true,
        barcode: true,
        boletoUrl: true,
        qrCode: true,
        qrCodeText: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  get(userId: string, id: string) {
    return this.prisma.payment.findFirst({
      where: { id, userId },
    });
  }
}
