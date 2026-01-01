import type { Post } from "../types/post";
import trash from "../assets/trash.svg";
import expo from "../assets/share.svg";
import eyeoff from "../assets/eye.svg";
import eye from "../assets/eye-off.svg";
import send from "../assets/send.svg";
import plus from "../assets/plus.svg";
type Props = {
  posts: Post[];
  onCreate: () => void;
  onOpen: (postId: string) => void;
  onTogglePublish: (postId: string) => void;
  onExport: (post: Post) => void;
  onDelete: (id: string) => void;
};

export function PostListPage({
  posts,
  onCreate,
  onOpen,
  onTogglePublish,
  onExport,
  onDelete,
}: Props) {
  return (
    <div className="post-list-page">
      <span className="header">
        <h2 className="heading">፝</h2>
        <span onClick={onCreate} id="addPosts">
          Post <img src={plus} />
        </span>
      </span>
      <ul className="post-lists">
        {posts.map((post) => (
          <li key={post.id}>
            <div className="title">
              <span onClick={() => onOpen(post.id)} id="postName">
                {post.title || "Untitled"}
              </span>
            </div>
            <div className="controls">
              <span onClick={() => onTogglePublish(post.id)}>
                {post.published ? <img src={eye} /> : <img src={eyeoff} />}
              </span>

              <span onClick={() => onExport(post)}>
                <img src={expo} alt="export as json" />
              </span>

              <span
                disabled={!post.published}
                onClick={() => {
                  window.location.hash = `/post/${post.id}`;
                }}
              >
                <img src={send} alt="share" />
              </span>

              <span onClick={() => onDelete(post.id)}>
                <img src={trash} alt="Delete" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
