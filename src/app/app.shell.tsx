import { useState, useEffect } from "react";
import { PostListPage } from "../pages/postlist.page";
import { EditorPage } from "../pages/editor.page";
import { ViewerPage } from "../pages/viewer.page";
import type { Post } from "../types/post";
import { localPostStorage } from "../storage/post.storage";
import { exportPost } from "../exports/export-post";
import '../Styles/global.css'
type Screen =
  | { name: "list" }
  | { name: "editor"; postId: string }
  | { name: "viewer"; postId: string };

export function AppShell() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [screen, setScreen] = useState<Screen>({ name: "list" });

  
  useEffect(() => {
    const storedPosts = localPostStorage.loadAll();
    setPosts(storedPosts);
  }, []);

  
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      if (hash.startsWith("#/post/")) {
        const postId = hash.replace("#/post/", "");
        setScreen({ name: "viewer", postId });
      }
    }

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);


  function createPost() {
    const now = Date.now();
    const newPost: Post = {
      id: String(now),
      title: "Untitled Post",
      content: null,
      createdAt: now,
      updatedAt: now,
      published: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    localPostStorage.save(newPost);
    setScreen({ name: "editor", postId: newPost.id });
  }

  function updatePost(updated: Post) {
    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    localPostStorage.save(updated);
  }

  function togglePublish(postId: string) {
    setPosts((prev) => {
      const updated = prev.map((post) =>
        post.id === postId
          ? { ...post, published: !post.published, updatedAt: Date.now() }
          : post
      );

      const changed = updated.find((p) => p.id === postId);
      if (changed) localPostStorage.save(changed);

      return updated;
    });
  }

  function openEditor(postId: string) {
    window.location.hash = "";
    setScreen({ name: "editor", postId });
  }

  function goToList() {
    window.location.hash = "";
    setScreen({ name: "list" });
  }
  
  function deletePost(postId: string) {
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;
  
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    localPostStorage.delete(postId);
  
    // Safety: if user deletes the currently open post
    setScreen({ name: "list" });
  }


  const activePost =
    screen.name !== "list"
      ? posts.find((p) => p.id === screen.postId) ?? null
      : null;

  return (
    <>
      {screen.name === "list" && (
        <PostListPage
          posts={posts}
          onCreate={createPost}
          onOpen={openEditor}
          onTogglePublish={togglePublish}
          onExport={exportPost}
          onDelete={deletePost}
        />
      )}

      {screen.name === "editor" && activePost && (
        <EditorPage
          post={activePost}
          onChange={updatePost}
          onClose={goToList}
        />
      )}

      {screen.name === "viewer" && activePost && activePost.published && (
        <ViewerPage post={activePost} />
      )}

      {screen.name === "viewer" &&
        (!activePost || !activePost.published) && (
          <p>Post not found</p>
        )}

    </>
  );
}
