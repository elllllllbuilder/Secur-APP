import { Router } from "express";
import { updateDocumentStatus } from "../documents/adminDocuments";

const router = Router();

router.patch("/documents/:id", updateDocumentStatus);

export default router;
