"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

type Uploaded = { url: string; public_id: string };

export default function UploadPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => signIn("google", { callbackUrl: "/upload" }),
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<Uploaded[]>([]);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<Record<string, { description: string; tags: string }>>({});
  const [title, setTitle] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop,
  });

  if (status === "loading") return <p className="p-8">Loading…</p>;

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const uploadAll = async () => {
    if (!files.length) return;
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const res = await axios.post<Uploaded[]>("/api/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUploads(res.data);
  };

  const publishGallery = async () => {
    setSaving(true);
    try {
      const payload = uploads.map((u) => ({
        url: u.url,
        description: meta[u.url]?.description || "",
        tags: (meta[u.url]?.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }));
      const res = await axios.post<{ id: string }>("/api/publish-gallery", { title, photos: payload });
      window.location.href = `/gallery/${res.data.id}`;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()} className="underline">Sign out</button>
      </div>

      <div className="max-w-xl">
        <label className="block text-sm font-medium mb-1">Gallery title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My awesome gallery"
          className="w-full border rounded p-2"
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center ${
          isDragActive ? "border-blue-600" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">Drag & drop images here, or click to select (multiple supported)</p>
      </div>

      {files.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Selected ({files.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((f) => (
              <div key={f.name} className="rounded-lg overflow-hidden border">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-40 object-cover" />
                <div className="p-2 flex justify-between items-center">
                  <span className="text-sm truncate">{f.name}</span>
                  <button className="text-red-600 text-sm" onClick={() => removeFile(f.name)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={uploadAll} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Upload {files.length} file(s)
          </button>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Add descriptions & tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uploads.map((u) => (
              <div key={u.public_id} className="border rounded-xl overflow-hidden">
                <img src={u.url} alt="Uploaded image" className="w-full h-56 object-cover" />
                <div className="p-4 space-y-3">
                  <textarea
                    placeholder="Description"
                    className="w-full border rounded p-2"
                    onChange={(e) =>
                      setMeta((m) => ({ ...m, [u.url]: { ...(m[u.url] || { tags: "" }), description: e.target.value } }))
                    }
                  />
                  <input
                    placeholder="Tags (comma separated)"
                    className="w-full border rounded p-2"
                    onChange={(e) =>
                      setMeta((m) => ({ ...m, [u.url]: { ...(m[u.url] || { description: "" }), tags: e.target.value } }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <button onClick={publishGallery} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">
            {saving ? "Publishing…" : "Publish Gallery"}
          </button>
        </div>
      )}
    </div>
  );
}


