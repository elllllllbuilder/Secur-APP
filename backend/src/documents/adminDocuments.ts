import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function updateDocumentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { verified } = req.body; // boolean ou null

    if (verified !== true && verified !== false && verified !== null) {
      return res.status(400).json({ error: "Valor inválido para 'verified'" });
    }

const updated = await prisma.userDocument.update({
  where: { id },
  data: { verified },
});


    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar documento" });
  }
}
