import type { OutputData } from "@editorjs/editorjs";

export type Post = {
  id: string;
  title: string;
  content: OutputData | null; 
  createdAt: number;
  updatedAt: number;
  published: boolean;
};
