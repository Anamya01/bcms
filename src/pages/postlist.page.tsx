import type { Post } from "../types/post";

type Props = {
  posts: Post[];
  onCreate: () => void;
  onOpen: (postId: string) => void;
  onTogglePublish: (postId: string) => void;
  onExport: (post: Post) => void;
};

export function PostListPage({
  posts,
  onCreate,
  onOpen,
  onTogglePublish,
  onExport,
}: Props) {
  return (
    <div>
      <h1>Posts</h1>

      <button onClick={onCreate}>New Post</button>

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <button onClick={() => onOpen(post.id)}>
              {post.title || "Untitled"}
            </button>

            <button onClick={() => onTogglePublish(post.id)}>
              {post.published ? "Unpublish" : "Publish"}
            </button>
            
            <button onClick={() => onExport(post)}>Export</button>
            
            <button
              disabled={!post.published}
              onClick={() => {
                window.location.hash = `/post/${post.id}`;
              }}
            >
              Share
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
