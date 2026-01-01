import type { Post } from "../types/post";
import { Editor } from "../editor/editor";

type Props = {
  post: Post;
};

export function ViewerPage({ post }: Props) {
  return (
    <div>
      <h1>{post.title}</h1>

      <Editor
        data={post.content}
        readOnly={true}
        onChange={() => {}}
      />
    </div>
  );
}
