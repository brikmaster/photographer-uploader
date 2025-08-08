import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  // Require authentication (aligns with your example's optional protection)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files");
  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploads = await Promise.all(
    files.map(async (file) => {
      if (!(file instanceof Blob)) {
        throw new Error("Invalid file");
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await new Promise<{
        secure_url?: string;
        url?: string;
        public_id?: string;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "galleries", resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as unknown as {
              secure_url?: string;
              url?: string;
              public_id?: string;
            });
          }
        );
        uploadStream.end(buffer);
      });
      return {
        url: result.secure_url || result.url || "",
        public_id: result.public_id || "",
      };
    })
  );

  return NextResponse.json(uploads);
}


