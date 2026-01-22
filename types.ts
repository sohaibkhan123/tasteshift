
import React from 'react';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  email?: string;
  isCloseFriend?: boolean;
  followers: number;
  following: number;
  bio?: string;
  website?: string;
  isPrivate?: boolean;
  followingList?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  replies?: Comment[];
  sentiment?: 'good' | 'bad' | 'neutral';
}

export interface RecipeStep {
  text: string;
  mediaUrl?: string;
  duration?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  steps?: RecipeStep[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface Post {
  id: string;
  type: 'image' | 'video' | 'recipe';
  user: User;
  contentUrl: string;
  caption: string;
  likes: number;
  comments: Comment[];
  shares: number;
  timestamp: string;
  recipe?: Recipe;
  isSaved?: boolean;
  isLiked?: boolean;
}

export interface Story {
  id: string;
  user: User;
  mediaUrl: string;
  isViewed: boolean;
  isLive?: boolean;
  likes?: number;
  comments?: { user: string; text: string }[];
  channelId?: string; // Unique ID for the live session
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post';
  user: User;
  message: string;
  timestamp: string;
  read: boolean;
  postId?: string;
  targetUserId?: string;
}

export enum ViewState {
  AUTH = 'AUTH',
  FEED = 'FEED',
  EXPLORE = 'EXPLORE',
  COLLECTIONS = 'COLLECTIONS',
  ALL_RECIPES = 'ALL_RECIPES',
  CREATE = 'CREATE',
  AI_CHEF = 'AI_CHEF',
  MEMBERS = 'MEMBERS',
  MESSAGES = 'MESSAGES',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
  SETTINGS = 'SETTINGS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  RECIPE_DETAIL = 'RECIPE_DETAIL',
  RECIPE_STORY = 'RECIPE_STORY'
}
