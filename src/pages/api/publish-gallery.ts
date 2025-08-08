import type { NextApiRequest, NextApiResponse } from "next";
import { createGallery } from "@/lib/db";

type Photo = { url: string; description?: string; tags?: string[] };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Optional: enforce auth (uncomment to require)
  // const session = await getServerSession(req, res, authOptions as any);
  // const ownerId = (session?.user as { id?: string; email?: string } | undefined)?.id;
  const ownerId = undefined;

  const { photos, title } = req.body as { photos: Photo[]; title?: string };
  if (!Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ error: "No photos" });
  }

  const gallery = createGallery(ownerId, title || "My Gallery", photos);
  return res.status(200).json({ id: gallery.id });
}


