import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import Code from "@editorjs/code";
import Embed from "@editorjs/embed";
import Marker from "@editorjs/marker";
import { imageStorage } from "../storage/image.storage";

type Props = {
  data: OutputData | null;
  readOnly: boolean;
  onChange: (data: OutputData) => void;
};

/* ---------------- Image rehydration ---------------- */

async function rehydrateImages(data: OutputData): Promise<OutputData> {
  const blocks = await Promise.all(
    data.blocks.map(async (block) => {
      if (block.type !== "image") return block;

      const imageId = block.data?.file?.imageId;
      if (!imageId) return block;

      const blob = await imageStorage.get(imageId);
      if (!blob) return block;

      const url = URL.createObjectURL(blob);

      return {
        ...block,
        data: {
          ...block.data,
          file: {
            ...block.data.file,
            url,
          },
        },
      };
    })
  );

  return { ...data, blocks };
}

/* ---------------- Editor component ---------------- */

export function Editor({ data, readOnly, onChange }: Props) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!holderRef.current) return;

    let cancelled = false;
    let editor: EditorJS | null = null;

    (async () => {
      const preparedData = data
        ? await rehydrateImages(data)
        : undefined;

      if (cancelled || !holderRef.current) return;

      editor = new EditorJS({
        holder: holderRef.current,
        data: preparedData,
        readOnly,
        inlineToolbar: true,

        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },

          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2,
            },
          },

          list: {
            class: List,
            inlineToolbar: true,
          },

          marker: {
            class: Marker,
            shortcut: "CMD+SHIFT+M",
          },

          code: {
            class: Code,
          },

          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                twitter: true,
                codepen: true,
                github: true,
              },
            },
          },

          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const id = await imageStorage.save(file);
                  const blob = await imageStorage.get(id);
                  if (!blob) return { success: 0 };

                  return {
                    success: 1,
                    file: {
                      url: URL.createObjectURL(blob),
                      imageId: id,
                    },
                  };
                },
              },
            },
          },
        },
        async onChange() {
          if (readOnly || !editor) return;

          const output = await editor.save();
          onChange(output);

        },
      });

      editorRef.current = editor;
    })();

    return () => {
      cancelled = true;
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
      }
      editorRef.current = null;
    };
  }, [readOnly]);

  return <div ref={holderRef} style={{ minHeight: 200 }} />;
}
