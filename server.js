
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { seedRecipes } from './seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS to allow requests from your live frontend
app.use(cors({
    origin: '*', // Allow all origins (Easiest for initial deployment)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tasteshift:12551ce6@projects.fe8qqad.mongodb.net/tasteshift';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        seedDatabase();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schemas ---

const UserSchema = new mongoose.Schema({
    name: String,
    handle: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String, select: false },
    avatar: String,
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    followingList: [String],
    bio: String,
    website: String,
    isPrivate: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);

const MessageSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    text: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

const RecipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    nutrition: { calories: Number, protein: String, carbs: String, fat: String },
    cookingTime: Number,
    difficulty: String,
    tags: [String]
});

const PostSchema = new mongoose.Schema({
    type: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contentUrl: String,
    caption: String,
    likes: { type: Number, default: 0 },
    likedBy: [String],
    shares: { type: Number, default: 0 },
    comments: [{
        userId: String,
        userName: String,
        text: String,
        sentiment: { type: String, default: 'neutral' },
        timestamp: { type: Date, default: Date.now }
    }],
    recipe: RecipeSchema,
    timestamp: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

const StorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mediaUrl: String,
    isLive: { type: Boolean, default: false },
    isViewed: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    comments: [{
        user: String,
        text: String
    }],
    timestamp: { type: Date, default: Date.now, expires: 86400 }
});
const Story = mongoose.model('Story', StorySchema);

const NotificationSchema = new mongoose.Schema({
    type: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetUserId: String,
    message: String,
    postId: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', NotificationSchema);

// --- Helpers ---

const mapDoc = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = obj._id ? obj._id.toString() : null;

    if (obj.user && obj.user._id) {
        obj.user.id = obj.user._id.toString();
    }

    if (obj.comments && Array.isArray(obj.comments)) {
        obj.comments = obj.comments.map(c => ({
            ...c,
            id: c._id ? c._id.toString() : c.id || Date.now().toString()
        }));
    }
    return obj;
};

// --- Seeder ---
const seedDatabase = async () => {
    try {
        const count = await User.countDocuments();
        if (count <= 1) { // If only master chef exists
            console.log('🌱 Seeding users and recipes...');

            const usersData = [
                { name: 'Sarah Baker', handle: '@sarahbakes', email: 'sarah@test.com', password: 'password', avatar: 'https://i.pravatar.cc/150?u=sarah', bio: 'Pastry lover', followers: 45, following: 10 },
                { name: 'Marcus Grill', handle: '@grillmaster', email: 'marcus@test.com', password: 'password', avatar: 'https://i.pravatar.cc/150?u=marcus', bio: 'Steak is life', followers: 89, following: 22 },
                { name: 'Elena Veggie', handle: '@elenaveg', email: 'elena@test.com', password: 'password', avatar: 'https://i.pravatar.cc/150?u=elena', bio: 'Green recipes only', followers: 156, following: 140 }
            ];

            for (const ud of usersData) {
                await User.create(ud);
            }

            console.log('✅ Users seeded!');
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

// --- Routes ---

// AUTH
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ message: 'User not found' });
        if (user.password !== password) return res.status(401).json({ message: 'Invalid password' });

        const userObj = user.toObject();
        delete userObj.password;
        userObj.id = userObj._id.toString();
        res.json({ user: userObj, token: 'session-token-xyz' });
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, username } = req.body;
        let user = await User.findOne({ $or: [{ email }, { handle: username }] });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FF6B35&color=fff`;
        user = await User.create({
            name: fullName,
            handle: username.startsWith('@') ? username : `@${username}`,
            email,
            password,
            avatar: avatarUrl,
            bio: 'New to Taste Shift!',
            followers: 0,
            following: 0,
            followingList: []
        });
        const userObj = user.toObject();
        delete userObj.password;
        userObj.id = userObj._id.toString();
        res.json({ user: userObj, token: 'session-token-new' });
    } catch (err) { res.status(500).send(err.message); }
});

// USERS
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users.map(u => {
            const obj = u.toObject();
            obj.id = obj._id.toString();
            return obj;
        }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users/:id/follow', async (req, res) => {
    try {
        const { currentUserId } = req.body;
        const targetUserId = req.params.id;
        if (currentUserId === targetUserId) return res.status(400).json({ message: "Cannot follow yourself" });

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) return res.status(404).json({ message: "User not found" });

        const isFollowing = currentUser.followingList.includes(targetUserId);

        if (isFollowing) {
            currentUser.followingList = currentUser.followingList.filter(id => id !== targetUserId);
            currentUser.following = Math.max(0, currentUser.following - 1);
            targetUser.followers = Math.max(0, targetUser.followers - 1);
        } else {
            currentUser.followingList.push(targetUserId);
            currentUser.following += 1;
            targetUser.followers += 1;

            await Notification.create({
                type: 'follow', user: currentUserId, targetUserId: targetUserId,
                message: 'started following you.'
            });
        }

        await currentUser.save();
        await targetUser.save();

        res.json({
            success: true,
            isFollowing: !isFollowing,
            followers: targetUser.followers,
            following: currentUser.following,
            currentUserFollowingList: currentUser.followingList
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// MESSAGES
app.get('/api/messages/:u1/:u2', async (req, res) => {
    try {
        const { u1, u2 } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: u1, receiverId: u2 },
                { senderId: u2, receiverId: u1 }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages.map(m => {
            const obj = m.toObject();
            obj.id = obj._id.toString();
            return obj;
        }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        const msg = await Message.create({ senderId, receiverId, text, read: false });
        const obj = msg.toObject();
        obj.id = obj._id.toString();
        res.json(obj);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/messages/read/:senderId/:receiverId', async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        // Mark messages sent by senderId (the other person) to receiverId (me) as read
        await Message.updateMany(
            { senderId: senderId, receiverId: receiverId, read: false },
            { $set: { read: true } }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET ALL MY UNREAD MESSAGES (For notification polling)
app.get('/api/messages/unread/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({ receiverId: userId, read: false });
        res.json(messages.map(m => {
            const obj = m.toObject();
            obj.id = obj._id.toString();
            return obj;
        }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POSTS
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('user').sort({ timestamp: -1 });
        res.json(posts.map(mapDoc));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { userId, type, contentUrl, caption, recipe } = req.body;
        const postData = { user: userId, type, contentUrl, caption, likes: 0, likedBy: [], shares: 0, comments: [], timestamp: new Date() };
        if (recipe) postData.recipe = recipe;
        const post = await Post.create(postData);
        const populatedPost = await Post.findById(post._id).populate('user');
        res.json(mapDoc(populatedPost));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.user.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });
        await Post.deleteOne({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/posts/:id', async (req, res) => {
    try {
        const { userId, ...updateData } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.user.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });
        if (updateData.caption) post.caption = updateData.caption;
        if (updateData.recipe) post.recipe = { ...post.recipe, ...updateData.recipe };
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('user');
        res.json(mapDoc(populatedPost));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- NEW ROUTES FOR LIKES AND COMMENTS ---

app.post('/api/posts/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isLiked = post.likedBy.includes(userId);
        if (isLiked) {
            post.likedBy = post.likedBy.filter(id => id !== userId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.likedBy.push(userId);
            post.likes += 1;

            if (post.user.toString() !== userId) {
                await Notification.create({
                    type: 'like',
                    user: userId,
                    targetUserId: post.user,
                    postId: post._id,
                    message: 'liked your recipe.',
                    read: false
                });
            }
        }
        await post.save();
        res.json({ success: true, likes: post.likes, isLiked: !isLiked });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/posts/:id/comment', async (req, res) => {
    try {
        const { userId, text, sentiment } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newComment = {
            userId,
            userName: user.name,
            text,
            sentiment: sentiment || 'neutral',
            timestamp: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // The comment we just pushed is the last one
        const savedComment = post.comments[post.comments.length - 1];

        if (post.user.toString() !== userId) {
            await Notification.create({
                type: 'comment',
                user: userId,
                targetUserId: post.user,
                postId: post._id,
                message: 'commented: ' + text.substring(0, 20) + (text.length > 20 ? '...' : ''),
                read: false
            });
        }

        const commentObj = savedComment.toObject ? savedComment.toObject() : savedComment;
        commentObj.id = commentObj._id ? commentObj._id.toString() : Date.now().toString();

        res.json(commentObj);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// STORIES
app.post('/api/stories', async (req, res) => {
    try {
        const { userId, mediaUrl, isLive } = req.body;
        const story = await Story.create({
            user: userId,
            mediaUrl,
            isLive: isLive || false
        });
        const populatedStory = await Story.findById(story._id).populate('user');
        res.json(mapDoc(populatedStory));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stories', async (req, res) => {
    try {
        const stories = await Story.find().populate('user').sort({ isLive: -1, timestamp: -1 });
        res.json(stories.map(mapDoc));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stories/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).populate('user');
        if (!story) return res.status(404).json({ message: "Story not found" });
        res.json(mapDoc(story));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE STORY
app.delete('/api/stories/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        // Ensure user owns the story
        if (story.user.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

        await Story.deleteOne({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stories/:id/comment', async (req, res) => {
    try {
        const { user, text } = req.body;
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });
        story.comments.push({ user, text });
        await story.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/stories/:id/like', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });
        story.likes += 1;
        await story.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifs = await Notification.find({ targetUserId: req.params.userId }).populate('user').limit(20).sort({ timestamp: -1 });
        res.json(notifs.map(mapDoc));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/profile/update', async (req, res) => {
    try {
        const { id, _id, ...updateData } = req.body;
        const targetId = id || _id;
        const user = await User.findByIdAndUpdate(targetId, updateData, { new: true });
        const userObj = user.toObject();
        userObj.id = userObj._id.toString();
        res.json(userObj);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 Backend Live on http://localhost:${PORT}`));
