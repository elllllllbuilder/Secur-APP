// src/banners/banners.entity.ts
export interface Banner {
  id: number;
  imageUrl: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
