
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Feed from './components/Feed';
import AIChef from './components/AIChef';
import CreatePost from './components/CreatePost';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ExploreView from './components/ExploreView';
import MembersView from './components/MembersView';
import MessagesView from './components/MessagesView';
import NotificationsView from './components/NotificationsView';
import CollectionsView from './components/CollectionsView';
import AllRecipesView from './components/AllRecipesView';
import RecipeStoryView from './components/RecipeStoryView';
import RecipeDetailModal from './components/RecipeDetailModal';
import StoryView from './components/StoryView';
import Auth from './components/Auth';
import SettingsView from './components/SettingsView';
import LiveStream from './components/LiveStream';
import ChatWidget from './components/ChatWidget';
import LandingPage from './components/LandingPage';
import { ViewState, Recipe, User, Story, Post, Comment, Notification, Message } from './types';
import { apiService } from './services/apiService';
import { DEFAULT_USER } from './constants';

const SESSION_KEY = 'tasteShift_session';
const SESSION_DURATION = 60 * 60 * 1000; // 1 Hour

// Short "Pop" sound Base64 for notifications
const SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.FEED);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [chatTarget, setChatTarget] = useState<User | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Messaging State
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const previousUnreadCountRef = useRef(0);

  const [viewingRecipePost, setViewingRecipePost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [liveStreamConfig, setLiveStreamConfig] = useState<{ mode: 'broadcast' | 'watch', storyId?: string, user?: User, channelId?: string } | null>(null);

  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        try {
          const { user, expiry } = JSON.parse(storedSession);
          if (Date.now() < expiry) {
            setCurrentUser(user);
            setIsLoggedIn(true);
            setShowLanding(false); // Skip landing if session exists
          } else {
            handleLogout();
          }
        } catch (e) {
          handleLogout();
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!isLoggedIn) return;
      try {
        const [fetchedPosts, fetchedStories, fetchedNotifs, fetchedUsers] = await Promise.all([
          apiService.getPosts(),
          apiService.getStories(),
          apiService.getNotifications(currentUser.id),
          apiService.getAllUsers()
        ]);

        const enhancedPosts = fetchedPosts.map(p => ({
          ...p,
          isLiked: (p as any).likedBy?.includes(currentUser.id)
        }));

        setPosts(enhancedPosts);
        setStories(fetchedStories);
        setNotifications(fetchedNotifs);
        setAllUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchInitialData();
  }, [isLoggedIn, currentUser.id]);

  // Polling for Unread Messages
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUnread = async () => {
      try {
        const msgs = await apiService.getUnreadMessages(currentUser.id);
        setUnreadMessages(msgs);

        // Play sound if new messages arrived
        if (msgs.length > previousUnreadCountRef.current) {
          const audio = new Audio(SOUND_URL);
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio play failed (interaction required)", e));
        }
        previousUnreadCountRef.current = msgs.length;
      } catch (e) {
        console.error("Failed to fetch unread messages", e);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [isLoggedIn, currentUser.id]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLanding(true); // Show landing page on logout
    setCurrentView(ViewState.AUTH);
    setCurrentUser(DEFAULT_USER);
    setPosts([]);
    setStories([]);
    localStorage.removeItem(SESSION_KEY);
  };

  const onUserAuthenticated = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLanding(false);
    setCurrentView(ViewState.FEED);
    const session = { user, expiry: Date.now() + SESSION_DURATION };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  const handleToggleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.isLiked;
    const previousLikes = post.likes;

    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, isLiked: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1 } : p
    ));

    try {
      await apiService.toggleLike(postId, currentUser.id);
    } catch (err) {
      console.error("Like error", err);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, isLiked: wasLiked, likes: previousLikes } : p
      ));
    }
  };

  const handleToggleFollow = async (targetUserId: string) => {
    try {
      const response = await apiService.toggleFollow(targetUserId, currentUser.id);
      if (response.success) {
        const updatedCurrentUser = {
          ...currentUser,
          following: response.following,
          followingList: response.currentUserFollowingList
        };
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: updatedCurrentUser, expiry: Date.now() + SESSION_DURATION }));

        const refreshedUsers = await apiService.getAllUsers();
        setAllUsers(refreshedUsers);

        if (targetUser && targetUser.id === targetUserId) {
          setTargetUser({ ...targetUser, followers: response.followers });
        }
      }
    } catch (err) {
      console.error("Follow error", err);
    }
  };

  const handleStartChat = (user: User) => {
    setChatTarget(user);
    setCurrentView(ViewState.MESSAGES);
  };

  const handleAddComment = async (postId: string, text: string, sentiment?: string) => {
    try {
      const newComment = await apiService.addComment(postId, currentUser.id, text, sentiment);
      setPosts(prev => prev.map(post => post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post));
    } catch (e) {
      console.error("Comment error", e);
    }
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    setIsLoading(true);
    try {
      const savedUser = await apiService.updateProfile(updatedUser);
      setCurrentUser(savedUser);

      // Update local posts state immediately to reflect new avatar
      setPosts(prevPosts => prevPosts.map(p =>
        p.user.id === savedUser.id ? { ...p, user: savedUser } : p
      ));
      setAllUsers(prevUsers => prevUsers.map(u => u.id === savedUser.id ? savedUser : u));

      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: savedUser, expiry: Date.now() + SESSION_DURATION }));
      setCurrentView(ViewState.PROFILE);
    } finally { setIsLoading(false); }
  };

  const handleOpenRecipe = (post: Post) => {
    setViewingRecipePost(post);
    setIsCookingMode(false);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await apiService.deletePost(postId, currentUser.id);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (viewingRecipePost?.id === postId) setViewingRecipePost(null);
    } catch (e) { alert("Failed to delete post"); }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setCurrentView(ViewState.CREATE);
  };

  const handleCreateOrUpdatePost = async (postData: any) => {
    setIsLoading(true);
    try {
      if (editingPost) {
        const updatedPost = await apiService.updatePost(editingPost.id, currentUser.id, postData);
        setPosts(prev => prev.map(p => p.id === editingPost.id ? updatedPost : p));
        setEditingPost(null);
      } else {
        const newPost = await apiService.createPost({ ...postData, userId: currentUser.id });
        setPosts(prev => [newPost, ...prev]);
      }
      setCurrentView(ViewState.FEED);
    } catch (e) {
      alert("Operation failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleCreateStory = async (mediaUrl: string) => {
    setIsLoading(true);
    try {
      const newStory = await apiService.createStory(currentUser.id, mediaUrl);
      setStories(prev => [newStory, ...prev]);
      setCurrentView(ViewState.FEED);
    } catch (e) {
      alert("Failed to create story");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await apiService.deleteStory(storyId, currentUser.id);
      setStories(prev => prev.filter(s => s.id !== storyId));
    } catch (e) {
      console.error("Failed to delete story", e);
      alert("Could not delete story");
    }
  };

  const handleGoLive = async () => {
    try {
      // Create live story on backend
      const newStory = await apiService.createStory(currentUser.id, currentUser.avatar, true);

      // Add to local state
      setStories(prev => [newStory, ...prev]);

      // Define channel ID based on user ID (deterministic for watchers)
      const channelId = `tasteshift-${currentUser.id}`;

      setLiveStreamConfig({ mode: 'broadcast', storyId: newStory.id, channelId });
    } catch (e) {
      console.error("Failed to go live", e);
      alert("Could not connect to live server. Ensure backend is running.");
    }
  };

  const handleOpenLive = (broadcaster?: User) => {
    if (!broadcaster) return;
    const story = stories.find(s => s.user.id === broadcaster.id && s.isLive);
    if (story) {
      // Use the story's unique channel ID, or fallback to default pattern if missing
      const channelId = story.channelId || `tasteshift-${broadcaster.id}`;
      setLiveStreamConfig({ mode: 'watch', user: broadcaster, storyId: story.id, channelId });
    } else {
      alert("Live stream ended or not found");
    }
  };

  // Callback when messages are read in ChatWidget
  const handleReadMessages = (senderId: string) => {
    setUnreadMessages(prev => prev.filter(m => m.senderId !== senderId));
    previousUnreadCountRef.current = Math.max(0, previousUnreadCountRef.current - 1);
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-pulse"><div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div><p className="text-brand-orange font-bold">Kitchen is Heating Up...</p></div>;

    if (showLanding && !isLoggedIn) {
      return <LandingPage onEnterApp={() => setShowLanding(false)} />;
    }

    if (!isLoggedIn) return <Auth onLogin={onUserAuthenticated} />;

    switch (currentView) {
      case ViewState.FEED:
        return (
          <Feed
            stories={stories}
            posts={posts}
            currentUser={currentUser}
            onOpenRecipe={handleOpenRecipe}
            onOpenLive={handleOpenLive}
            onGoLive={handleGoLive}
            onViewStory={(idx) => setViewingStoryIndex(idx)}
            onToggleLike={handleToggleLike}
            onViewAll={() => setCurrentView(ViewState.ALL_RECIPES)}
            onDeletePost={handleDeletePost}
            onDeleteStory={handleDeleteStory}
            onEditPost={handleEditPost}
            onCreatePost={() => setCurrentView(ViewState.CREATE)}
            onExplore={() => setCurrentView(ViewState.EXPLORE)}
          />
        );
      case ViewState.ALL_RECIPES:
        return <AllRecipesView posts={posts} currentUser={currentUser} onOpenRecipe={handleOpenRecipe} onDeletePost={handleDeletePost} onEditPost={handleEditPost} onToggleLike={handleToggleLike} />;
      case ViewState.EXPLORE:
        return <ExploreView posts={posts} onOpenRecipe={handleOpenRecipe} onViewAllCollections={() => setCurrentView(ViewState.COLLECTIONS)} />;
      case ViewState.MEMBERS:
        return <MembersView users={allUsers} currentUser={currentUser} onToggleFollow={handleToggleFollow} onStartChat={handleStartChat} />;
      case ViewState.MESSAGES:
        return <MessagesView currentUser={currentUser} users={allUsers} initialTargetUser={chatTarget} />;
      case ViewState.AI_CHEF:
        return <AIChef />;
      case ViewState.CREATE:
        return <CreatePost onCancel={() => { setCurrentView(ViewState.FEED); setEditingPost(null); }} onSharePost={handleCreateOrUpdatePost} onShareStory={handleCreateStory} />;
      case ViewState.PROFILE:
        const profileUser = targetUser || currentUser;
        return <Profile
          user={profileUser}
          posts={posts.filter(p => p.user.id === profileUser.id)}
          onEditProfile={() => setCurrentView(ViewState.EDIT_PROFILE)}
          onOpenSettings={() => setCurrentView(ViewState.SETTINGS)}
          onOpenRecipe={handleOpenRecipe}
          onToggleLike={handleToggleLike}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
          onToggleFollow={handleToggleFollow}
          currentUser={currentUser}
        />;
      case ViewState.EDIT_PROFILE:
        return <EditProfile user={currentUser} onSave={handleUpdateProfile} onCancel={() => setCurrentView(ViewState.PROFILE)} />;
      case ViewState.NOTIFICATIONS:
        return <NotificationsView notifications={notifications} currentUser={currentUser} onFollowBack={handleToggleFollow} />;
      case ViewState.SETTINGS:
        return <SettingsView currentUser={currentUser} onLogout={handleLogout} onEditProfile={() => setCurrentView(ViewState.EDIT_PROFILE)} />;
      default:
        return (
          <Feed
            stories={stories}
            posts={posts}
            currentUser={currentUser}
            onOpenRecipe={handleOpenRecipe}
            onOpenLive={() => { }}
            onGoLive={() => { }}
            onViewStory={() => { }}
            onToggleLike={handleToggleLike}
          />
        );
    }
  };

  const currentPostInModal = viewingRecipePost ? posts.find(p => p.id === viewingRecipePost.id) : null;

  return (
    // Only wrap in Layout if we are logged in AND not showing landing page
    (!showLanding && isLoggedIn) ? (
      <Layout
        currentView={currentView}
        setView={(v) => { if (v === ViewState.PROFILE) setTargetUser(null); if (v !== ViewState.MESSAGES) setChatTarget(null); setCurrentView(v); }}
        currentUser={currentUser}
        unreadCount={notifications.filter(n => !n.read).length}
        messageCount={unreadMessages.length}
      >
        {renderContent()}

        {/* Floating Chat Widget */}
        {isLoggedIn && (
          <ChatWidget
            currentUser={currentUser}
            allUsers={allUsers}
            unreadMessages={unreadMessages}
            onMessageSent={() => { }}
            onReadMessages={handleReadMessages}
          />
        )}

        {viewingStoryIndex !== null && <StoryView stories={stories} initialStoryIndex={viewingStoryIndex} onClose={() => setViewingStoryIndex(null)} />}
        {currentPostInModal && !isCookingMode && <RecipeDetailModal post={currentPostInModal} onClose={() => setViewingRecipePost(null)} onStartCooking={() => setIsCookingMode(true)} onToggleLike={() => handleToggleLike(currentPostInModal.id)} onAddComment={(text, sentiment) => handleAddComment(currentPostInModal.id, text, sentiment)} />}
        {currentPostInModal?.recipe && isCookingMode && <RecipeStoryView recipe={currentPostInModal.recipe} onClose={() => setIsCookingMode(false)} />}
        {liveStreamConfig && (
          <LiveStream
            mode={liveStreamConfig.mode}
            user={liveStreamConfig.user}
            storyId={liveStreamConfig.storyId}
            channelId={liveStreamConfig.channelId}
            currentUser={currentUser}
            onClose={() => setLiveStreamConfig(null)}
          />
        )}
      </Layout>
    ) : (
      // No Layout for Landing/Auth pages
      <>
        {renderContent()}
      </>
    )
  );
};

export default App;
