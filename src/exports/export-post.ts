import type { Post } from "../types/post";
import type { OutputData } from "@editorjs/editorjs";
import { imageStorage } from "../storage/image.storage";

/**
 * Convert a Blob to base64 string (without data: prefix)
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // reader.result = "data:image/png;base64,AAAA..."
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };

    reader.onerror = () =>
      reject(new Error("Failed to read blob"));

    reader.readAsDataURL(blob);
  });
}

/**
 * Download JSON as a file
 */
function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Export a single post with embedded image assets
 */
export async function exportPost(post: Post) {
  const content = post.content as OutputData | null;

  const images: Record<
    string,
    { mime: string; data: string }
  > = {};

  if (content) {
    for (const block of content.blocks) {
      if (block.type !== "image") continue;

      const imageId = block.data?.file?.imageId;
      if (!imageId) continue;

      // Avoid exporting the same image twice
      if (images[imageId]) continue;

      const blob = await imageStorage.get(imageId);
      if (!blob) continue;

      const base64 = await blobToBase64(blob);

      images[imageId] = {
        mime: blob.type,
        data: base64,
      };
    }
  }

  const exportedPost = {
    id: post.id,
    title: post.title,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    published: post.published,
    content,
    assets: {
      images,
    },
  };

  const safeTitle =
    post.title?.trim().replace(/[^\w\d]+/g, "_") || "post";

  downloadJSON(exportedPost, `${safeTitle}.json`);
}
