/**
 * Type definitions for Post API
 */

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface CreatePostRequest {
  userId: number;
  title: string;
  body: string;
}

export interface UpdatePostRequest {
  id: number;
  userId?: number;
  title?: string;
  body?: string;
}

/**
 * Schema validator for Post
 */
export const postSchema = {
  id: 'number',
  userId: 'number',
  title: 'string',
  body: 'string'
};

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface CreateCommentRequest {
  postId: number;
  name: string;
  email: string;
  body: string;
}

/**
 * Schema validator for Comment
 */
export const commentSchema = {
  id: 'number',
  postId: 'number',
  name: 'string',
  email: 'string',
  body: 'string'
};
