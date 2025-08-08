import type { NextApiRequest, NextApiResponse } from "next";
import { getGallery } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const { id } = req.query;
  const galleryId = Array.isArray(id) ? id[0] : id;
  if (!galleryId) return res.status(400).json({ error: "Missing id" });

  const gallery = getGallery(galleryId);
  return res.status(200).json(gallery ?? null);
}




