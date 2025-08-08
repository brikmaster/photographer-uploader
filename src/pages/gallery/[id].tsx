import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Gallery = {
  id: string;
  title: string;
  photos: { url: string; description?: string; tags?: string[] }[];
};

export default function GalleryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [gallery, setGallery] = useState<Gallery | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/get-gallery?id=${id}`)
      .then((r) => r.json())
      .then((g) => setGallery(g || null));
  }, [id]);

  const ogImage = gallery?.photos?.[0]?.url || "";
  const title = gallery?.title || "Gallery";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content="Check out my photo gallery!" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="website" />
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">{title}</h1>
        {!gallery && <p>Loading…</p>}
        {gallery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gallery.photos.map((p, i) => (
              <figure key={i} className="border rounded-xl overflow-hidden">
                <img src={p.url} alt={p.description || `Photo ${i + 1}`} className="w-full h-72 object-cover" />
                {(p.description || (p.tags && p.tags.length)) && (
                  <figcaption className="p-3 text-sm text-gray-700">
                    {p.description}
                    {p.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {p.tags.map((t, j) => (
                          <span key={j} className="px-2 py-0.5 bg-gray-100 rounded-full border text-xs">{t}</span>
                        ))}
                      </div>
                    ) : null}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  );
}




