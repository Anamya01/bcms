import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import { imageStorage } from "../storage/image.storage";

type Props = {
  data: OutputData | null;
  readOnly: boolean;
  onChange: (data: OutputData) => void;
};

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
        tools: {
          header: Header,
          list: List,
          paragraph: Paragraph,
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
      if (
        editorRef.current &&
        typeof editorRef.current.destroy === "function"
      ) {
        editorRef.current.destroy();
      }
      editorRef.current = null;
    };
  }, [readOnly]);

  return <div ref={holderRef} style={{ minHeight: 200 }} />;
}
