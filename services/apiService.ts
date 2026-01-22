
import { Post, Story, User, Notification, Comment, Message } from '../types';

const API_URL = 'http://localhost:5000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return response.json();
}

export const apiService = {
  getPosts: () => request<Post[]>('/posts'),

  createPost: (postData: any) => request<Post>('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  }),

  deletePost: (postId: string, userId: string) => request<void>(`/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  }),

  updatePost: (postId: string, userId: string, updateData: any) => request<Post>(`/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...updateData })
  }),

  toggleLike: (postId: string, userId: string) => request<{ success: boolean; likes: number; isLiked: boolean }>(`/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  }),

  toggleFollow: (targetUserId: string, currentUserId: string) => request<any>(`/users/${targetUserId}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentUserId })
  }),

  getAllUsers: () => request<User[]>('/users'),

  getMessages: (u1: string, u2: string) => request<Message[]>(`/messages/${u1}/${u2}`),

  sendMessage: (senderId: string, receiverId: string, text: string) => request<Message>('/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId, receiverId, text })
  }),

  markMessagesAsRead: (senderId: string, receiverId: string) => request<void>(`/messages/read/${senderId}/${receiverId}`, { method: 'PUT' }),

  getUnreadMessages: (userId: string) => request<Message[]>(`/messages/unread/${userId}`),

  addComment: (postId: string, userId: string, text: string, sentiment?: string) => request<Comment>(`/posts/${postId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, text, sentiment })
  }),

  getStories: () => request<Story[]>('/stories'),

  createStory: (userId: string, mediaUrl: string, isLive: boolean = false) => request<Story>('/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, mediaUrl, isLive })
  }),

  deleteStory: (storyId: string, userId: string) => request<void>(`/stories/${storyId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  }),

  getStoryById: (storyId: string) => request<Story>(`/stories/${storyId}`),

  sendLiveComment: (storyId: string, user: string, text: string) => request<void>(`/stories/${storyId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, text })
  }),

  sendLiveLike: (storyId: string) => request<void>(`/stories/${storyId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }),

  getNotifications: (userId: string) => request<Notification[]>(`/notifications/${userId}`),

  updateProfile: (user: User) => request<User>('/profile/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  }),

  login: (credentials: { email?: string; password?: string }) => request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }),

  register: (data: { fullName: string; username: string; email: string; password: string }) => request<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};
