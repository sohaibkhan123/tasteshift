
import React, { useEffect, useRef, useState } from 'react';
import { X, Heart, Send, Users, Mic, MicOff, Camera, RotateCcw, Loader2, VideoOff, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface LiveStreamProps {
    mode: 'broadcast' | 'watch';
    user?: User; // The user we are watching
    storyId?: string; // ID of the live story to poll
    currentUser?: User; // The user engaging
    channelId?: string; // Specific Peer ID to connect to
    onClose: () => void;
}

const LiveStream: React.FC<LiveStreamProps> = ({ mode, user, storyId, currentUser, channelId, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [comments, setComments] = useState<{ user: string, text: string }[]>([]);
    const [inputComment, setInputComment] = useState('');
    const [viewerCount, setViewerCount] = useState(1);
    const [likes, setLikes] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const [isSimulated, setIsSimulated] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
    const [errorMsg, setErrorMsg] = useState('');
    const [showHttpsWarning, setShowHttpsWarning] = useState(false);

    // PeerJS refs
    const peerRef = useRef<any>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const isMockStory = storyId?.startsWith('mock-');

    // HTTPS Check for mobile
    useEffect(() => {
        if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
            setShowHttpsWarning(true);
        }
    }, []);

    // Poll for Live Data (Comments/Likes) from DB
    useEffect(() => {
        if (!storyId || isMockStory) return;

        const fetchLiveState = async () => {
            try {
                const story = await apiService.getStoryById(storyId);
                setComments(story.comments || []);
                setLikes(story.likes || 0);
                setViewerCount(Math.max(1, (story.likes || 0) + (story.comments?.length || 0) + 1));
            } catch (e) {
                console.warn("Backend unavailable for live polling, switching to simulated metrics");
            }
        };

        fetchLiveState();
        const interval = setInterval(fetchLiveState, 1500);
        return () => clearInterval(interval);
    }, [storyId, isMockStory]);

    // Simulate viewer count for mock/offline mode
    useEffect(() => {
        if (!isMockStory) return;
        const interval = setInterval(() => {
            setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
        }, 3000);
        return () => clearInterval(interval);
    }, [isMockStory]);

    // Helper to dynamically load PeerJS if missing
    const loadPeerScript = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if ((window as any).Peer) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PeerJS"));
            document.head.appendChild(script);
        });
    };

    // Generate a simulated stream for devices without camera
    const getSimulatedStream = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Draw animation loop
        const draw = () => {
            if (!ctx) return;

            // Background
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() / 2000;

            // Animated Circles
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                const x = canvas.width / 2 + Math.sin(time + i) * 100;
                const y = canvas.height / 2 + Math.cos(time * 1.5 + i) * 50;
                const radius = 50 + Math.sin(time * 2 + i) * 20;

                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = i === 0 ? '#FF6B35' : i === 1 ? '#4CB944' : '#2563EB';
                ctx.globalAlpha = 0.6;
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // Text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("Simulated Live Stream", canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '20px sans-serif';
            ctx.fillStyle = '#aaa';
            ctx.fillText("Camera not detected", canvas.width / 2, canvas.height / 2 + 20);

            requestAnimationFrame(draw);
        };
        draw();

        // Capture stream at 30 FPS
        const stream = canvas.captureStream(30);

        // Add dummy audio track (silence)
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const osc = audioCtx.createOscillator();
        osc.connect(dest);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        osc.connect(gainNode);
        gainNode.connect(dest);
        osc.start();

        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) stream.addTrack(audioTrack);

        return stream;
    };

    // Setup Stream & PeerJS
    useEffect(() => {
        let mounted = true;

        const initPeer = async () => {
            if (!currentUser) return;

            try {
                await loadPeerScript();
            } catch (e) {
                console.error("Could not load PeerJS", e);
                if (mounted) {
                    setConnectionStatus('error');
                    setErrorMsg('Failed to load streaming library');
                }
                return;
            }

            if (!mounted) return;

            const Peer = (window as any).Peer;
            if (!Peer) {
                console.error("PeerJS library not loaded");
                return;
            }

            // --- ID COLLISION FIX ---
            // If watching, use a RANDOM ID to avoid "ID taken" errors when opening multiple tabs
            // If broadcasting, use the channelId provided by App.tsx (which is unique per session)
            // Fallback to legacy behavior if channelId is missing
            const myPeerId = mode === 'watch'
                ? `viewer-${currentUser.id}-${Math.random().toString(36).substr(2, 6)}`
                : (channelId || `tasteshift-${currentUser.id}`);

            console.log(`Initializing Peer with ID: ${myPeerId}`);

            // Clean up old peer if exists
            if (peerRef.current) {
                peerRef.current.destroy();
            }

            const peer = new Peer(myPeerId, {
                debug: 1
            });
            peerRef.current = peer;

            peer.on('error', (err: any) => {
                console.error("PeerJS Error:", err);
                if (err.type === 'unavailable-id') {
                    // Even with our fix, if this happens, we should probably retry with a new random ID
                    // But for now, just show error
                    if (mounted) {
                        setConnectionStatus('error');
                        setErrorMsg('Connection ID collision. Please refresh.');
                    }
                }
            });

            peer.on('open', (id: string) => {
                console.log('My peer ID is: ' + id);
                if (mounted) setConnectionStatus('connected');

                // WATCH MODE
                if (mode === 'watch' && user?.id) {
                    const targetId = channelId || `tasteshift-${user.id}`;
                    console.log("Attempting to call:", targetId);

                    try {
                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const dest = ctx.createMediaStreamDestination();
                        const call = peer.call(targetId, dest.stream);

                        if (call) {
                            call.on('stream', (remoteStream: MediaStream) => {
                                if (videoRef.current) {
                                    videoRef.current.srcObject = remoteStream;
                                    videoRef.current.play().catch(e => console.error("Play error", e));
                                }
                            });
                            call.on('error', (err: any) => {
                                console.error("Call error", err);
                                if (mounted) setConnectionStatus('disconnected');
                            });
                            call.on('close', () => { if (mounted) setConnectionStatus('disconnected'); });
                        } else {
                            console.warn("Call failed to initialize");
                        }
                    } catch (e) {
                        console.error("Error connecting to stream", e);
                    }
                }
            });

            // BROADCAST MODE
            if (mode === 'broadcast') {
                try {
                    let stream: MediaStream;
                    try {
                        // Mobile constraints: prefer user facing camera
                        const constraints = {
                            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                            audio: true
                        };

                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error("Camera initialization timeout")), 4000) // Increased timeout for mobile
                        );

                        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                            throw new Error("MediaDevices API not available");
                        }

                        const streamPromise = navigator.mediaDevices.getUserMedia(constraints);

                        stream = await Promise.race([streamPromise, timeoutPromise]) as MediaStream;

                        if (mounted) setHasCamera(true);
                    } catch (err) {
                        console.warn("Camera failed or timed out, switching to simulation.", err);
                        stream = getSimulatedStream();
                        if (mounted) {
                            setHasCamera(false);
                            setIsSimulated(true);
                            // Show specific error for permission denied
                            if ((err as any).name === 'NotAllowedError' || (err as any).name === 'PermissionDeniedError') {
                                setErrorMsg('Camera permission denied');
                            }
                        }
                    }

                    localStreamRef.current = stream;
                    if (videoRef.current && mounted) {
                        videoRef.current.srcObject = stream;
                        // Mute local video to prevent feedback
                        videoRef.current.muted = true;
                    }

                    // Handle incoming viewers
                    peer.on('call', (call: any) => {
                        console.log("Incoming call from viewer");
                        call.answer(stream);
                    });
                } catch (err) {
                    console.error("Failed to setup stream", err);
                }
            }
        };

        initPeer();

        return () => {
            mounted = false;
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, [mode, currentUser?.id, user?.id, channelId]);

    const handleSendComment = async () => {
        if (!inputComment.trim() || !storyId || !currentUser) return;

        const commentObj = { user: currentUser.handle, text: inputComment };
        setComments(prev => [...prev, commentObj]);
        setInputComment('');

        if (isMockStory) return;

        try {
            await apiService.sendLiveComment(storyId, currentUser.handle, commentObj.text);
        } catch (e) {
            console.warn("Failed to send comment to backend");
        }
    };

    const handleSendLike = async () => {
        setLikes(prev => prev + 1);

        if (isMockStory || !storyId) return;

        try {
            await apiService.sendLiveLike(storyId);
        } catch (e) {
            console.warn("Failed to send like to backend");
        }
    };

    const avatarSrc = user?.avatar || currentUser?.avatar;
    const safeAvatar = (avatarSrc && avatarSrc.trim() !== '') ? avatarSrc : 'https://ui-avatars.com/api/?name=User&background=FF6B35&color=fff';

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
            {/* Video Layer */}
            <div className="absolute inset-0 bg-gray-900">
                <video
                    ref={videoRef}
                    autoPlay
                    muted={mode === 'broadcast' || isMuted}
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-500 opacity-100`}
                />

                {/* Loading / Error Overlay */}
                {(connectionStatus !== 'connected' || showHttpsWarning || errorMsg) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10 backdrop-blur-sm px-6">
                        <div className="flex flex-col items-center gap-4 p-8 text-center bg-black/40 rounded-3xl border border-white/10 max-w-sm">
                            {errorMsg ? (
                                <div className="text-red-500 mb-2"><AlertTriangle size={40} /></div>
                            ) : (
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-brand-orange p-1">
                                        <img src={safeAvatar} className="w-full h-full rounded-full object-cover" alt="User" />
                                    </div>
                                    <div className="absolute inset-0 border-4 border-t-transparent border-brand-orange rounded-full animate-spin"></div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    {errorMsg ? "Stream Error" : (mode === 'broadcast' ? 'Starting Stream...' : `Connecting...`)}
                                </h3>

                                {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}

                                {!errorMsg && (
                                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mt-2">
                                        <Loader2 className="animate-spin" size={14} /> Initializing connection
                                    </p>
                                )}

                                {showHttpsWarning && (
                                    <div className="mt-4 p-3 bg-yellow-500/20 text-yellow-200 text-xs rounded-xl border border-yellow-500/30 text-left">
                                        <strong>Warning:</strong> Mobile cameras require HTTPS. If you are testing via IP, the camera may fail. Use 'localhost' or a secure tunnel.
                                    </div>
                                )}

                                {connectionStatus === 'error' && (
                                    <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-bold transition">
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Simulation Indicator */}
                {isSimulated && mode === 'broadcast' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-50 w-full px-4">
                        <VideoOff size={64} className="mx-auto text-white/50 mb-2" />
                        <p className="text-white/50 text-sm">Running in simulation mode.</p>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-8 flex justify-between items-start z-20">
                <div className="flex items-center gap-2">
                    <div className="bg-red-600 px-3 py-1 rounded text-white font-black text-xs animate-pulse flex items-center gap-2 shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-black border border-white/10">
                        <Users size={12} /> {viewerCount.toLocaleString()}
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition border border-white/10">
                    <X size={24} />
                </button>
            </div>

            {/* Broadcast Controls */}
            {mode === 'broadcast' && (
                <div className="absolute right-4 top-1/4 flex flex-col gap-4 z-20">
                    <button className="p-3 bg-black/40 rounded-full text-white backdrop-blur border border-white/10 hover:bg-white/10 transition"><RotateCcw size={22} /></button>
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full text-white backdrop-blur border border-white/10 transition ${isMuted ? 'bg-red-500' : 'bg-black/40 hover:bg-white/10'}`}>
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>
                    <button className="p-3 bg-black/40 rounded-full text-white backdrop-blur border border-white/10 hover:bg-white/10 transition"><Camera size={22} /></button>
                </div>
            )}

            {/* Bottom Area: Comments & Interactions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-12 z-20 flex flex-col gap-4">
                {/* Comment Stream */}
                <div className="h-48 overflow-y-auto space-y-2 no-scrollbar flex flex-col justify-end mask-image-linear-gradient">
                    {comments.slice(-10).map((c, i) => (
                        <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2 duration-300 bg-black/20 backdrop-blur-sm self-start p-2 rounded-xl max-w-[80%] border border-white/5">
                            <span className="font-black text-brand-orange text-[11px] uppercase tracking-wider shrink-0 mt-0.5">{c.user}</span>
                            <span className="text-white text-sm leading-snug">{c.text}</span>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center border border-white/20 shadow-2xl">
                        <input
                            value={inputComment}
                            onChange={(e) => setInputComment(e.target.value)}
                            placeholder="Say something..."
                            className="bg-transparent border-none text-white placeholder-white/50 focus:ring-0 flex-1 text-sm font-medium outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                        />
                        <button onClick={handleSendComment} className="text-brand-orange hover:scale-110 transition active:scale-95"><Send size={20} /></button>
                    </div>

                    <button className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-white/20 transition relative group border border-white/20 active:scale-90" onClick={handleSendLike}>
                        <Heart size={24} fill={likes > 0 ? "currentColor" : "none"} className={likes > 0 ? "text-red-500" : "text-white"} />
                        {likes > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[9px] px-1.5 py-0.5 rounded-full border-2 border-black font-black">
                                {likes}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveStream;
