import type { Post } from "../types/post";
import { Editor } from "../editor/editor";
import { useDebouncedCallback } from "../shared/useDebouncedCallback";
import { useRef } from "react";

type Props = {
  post: Post;
  onChange: (post: Post) => void;
  onClose: () => void;
};

export function EditorPage({ post, onChange, onClose }: Props) {
  const lastSavedRef = useRef<string>("");

  const debouncedSave = useDebouncedCallback((updatedPost: Post) => {
    onChange(updatedPost);
    lastSavedRef.current = JSON.stringify(updatedPost.content);
  }, 800);

  function updateTitle(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({
      ...post,
      title: e.target.value,
      updatedAt: Date.now(),
    });
  }

  function updateContent(content: any) {
    const serialized = JSON.stringify(content);

    // Prevent saving identical content
    if (serialized === lastSavedRef.current) return;

    const updatedPost: Post = {
      ...post,
      content,
      updatedAt: Date.now(),
    };

    debouncedSave(updatedPost);
  }
  return (
    <div>
      <button onClick={onClose}>Back</button>

      <input
        value={post.title}
        onChange={updateTitle}
        placeholder="Post title"
      />

      <Editor data={post.content} readOnly={post.published} onChange={updateContent} />
    </div>
  );
}
