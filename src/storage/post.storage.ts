import type { Post } from "../types/post";

export interface PostStorage {
  loadAll(): Post[];
  save(post: Post): void;
  delete(postId: string): void;
}


const STORAGE_KEY = "bcms.posts";

export const localPostStorage: PostStorage = {
  loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  save(post) {
    const posts = this.loadAll();
    const updated = posts.some((p) => p.id === post.id)
      ? posts.map((p) => (p.id === post.id ? post : p))
      : [post, ...posts];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete(postId) {
    const posts = this.loadAll().filter((p) => p.id !== postId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },
};
