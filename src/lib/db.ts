import { randomUUID } from "crypto";

export type Photo = { url: string; description?: string; tags?: string[] };
export type Gallery = { id: string; ownerId?: string; title: string; photos: Photo[] };

const db = {
  galleries: [] as Gallery[],
};

export function createGallery(ownerId: string | undefined, title: string, photos: Photo[]): Gallery {
  const id = randomUUID();
  const gallery: Gallery = { id, ownerId, title, photos };
  db.galleries.push(gallery);
  return gallery;
}

export function getGallery(id: string): Gallery | null {
  return db.galleries.find((g) => g.id === id) || null;
}

export { db };




