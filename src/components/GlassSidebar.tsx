"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { addChannel, subscribeToChannel, getUserChannels, removeChannel } from "@/lib/queries";

interface GlassSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlassSidebar({ isOpen, onClose }: GlassSidebarProps) {
    const [channelUrl, setChannelUrl] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [channels, setChannels] = useState<any[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Fetch user's subscribed channels on load
    useEffect(() => {
        async function loadSubs() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const subs = await getUserChannels(supabase, user.id);
                setChannels(subs);
            }
        }
        if (isOpen) loadSubs();
    }, [isOpen, supabase]);

    const handleAddChannel = async () => {
        if (!channelUrl.trim()) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please sign in first!");
                return;
            }

            // Extract a handle or ID from the pasted text (basic logic)
            let youtubeId = channelUrl.trim();
            if (youtubeId.includes("youtube.com/")) {
                youtubeId = youtubeId.split("/").pop() || youtubeId;
            }

            // 1. Add to channels table
            const newChannel = await addChannel(supabase, youtubeId, youtubeId, "");

            // 2. Subscribe the user
            await subscribeToChannel(supabase, user.id, newChannel.id);

            setChannels((prev) => [...prev, newChannel]);
            setChannelUrl("");
            alert("Channel added! Refresh the page to load videos.");

        } catch (err) {
            console.error(err);
            alert("Failed to add channel. It might already exist.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChannel = async (channelId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await removeChannel(supabase, user.id, channelId);
            setChannels((prev) => prev.filter((ch) => ch.id !== channelId));
        } catch (err) {
            console.error("Failed to remove channel:", err);
            alert("Failed to remove channel.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAddChannel();
    };

    const handleSyncGoogleSubs = async () => {
        setSyncing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Sign in with YouTube read-only scope
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        scopes: "https://www.googleapis.com/auth/youtube.readonly",
                    },
                });
                return;
            }

            // Get the provider token from the session
            const { data: { session } } = await supabase.auth.getSession();
            const providerToken = session?.provider_token;

            if (!providerToken) {
                // Re-auth to get a fresh token with the right scope
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        scopes: "https://www.googleapis.com/auth/youtube.readonly",
                    },
                });
                return;
            }

            // Fetch YouTube subscriptions
            const res = await fetch(
                "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50",
                { headers: { Authorization: `Bearer ${providerToken}` } }
            );

            if (!res.ok) {
                throw new Error(`YouTube API error: ${res.status}`);
            }

            const data = await res.json();
            const items = data.items || [];

            let addedCount = 0;
            for (const item of items) {
                const channelId = item.snippet.resourceId.channelId;
                const channelName = item.snippet.title;
                const channelAvatar = item.snippet.thumbnails?.default?.url || "";

                try {
                    const ch = await addChannel(supabase, channelId, channelName, channelAvatar);
                    await subscribeToChannel(supabase, user.id, ch.id);
                    addedCount++;
                } catch {
                    // Skip channels that fail to add
                }
            }

            // Refresh the list
            const subs = await getUserChannels(supabase, user.id);
            setChannels(subs);
            alert(`Synced ${addedCount} channels from your YouTube subscriptions!`);
        } catch (err) {
            console.error("Sync failed:", err);
            alert("Failed to sync subscriptions. Make sure you've granted YouTube access.");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="sidebar__backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.aside
                        className="sidebar__panel"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 35 }}
                    >
                        <button className="sidebar__close" onClick={onClose}>✕</button>

                        <div className="sidebar__logo">
                            <span className="sidebar__logo-text">skim</span>
                            <span className="sidebar__logo-dot">.yt</span>
                        </div>

                        {/* Sources section */}
                        <div className="sidebar__section">
                            <h3 className="sidebar__section-title">Sources</h3>

                            <div className="sidebar__add-channel">
                                <input
                                    type="text"
                                    placeholder="Paste YouTube ID or handle..."
                                    value={channelUrl}
                                    onChange={(e) => setChannelUrl(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="sidebar__input"
                                />
                                <button
                                    onClick={handleAddChannel}
                                    className="sidebar__add-btn"
                                    disabled={!channelUrl.trim() || loading}
                                >
                                    {loading ? "..." : "+ Add"}
                                </button>
                            </div>

                            <button
                                className="sidebar__sync-btn"
                                onClick={handleSyncGoogleSubs}
                                disabled={syncing}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m0 0a9 9 0 0 1 9-9m-9 9a9 9 0 0 0 9 9" />
                                </svg>
                                {syncing ? "Syncing..." : "Sync Google Subs"}
                            </button>

                            {channels.length > 0 && (
                                <div className="sidebar__channels mt-4">
                                    {channels.map((ch, i) => (
                                        <div key={ch.id || i} className="sidebar__channel-item">
                                            <span className="sidebar__channel-icon">📡</span>
                                            <span className="sidebar__channel-url">{ch.name}</span>
                                            <button
                                                className="sidebar__channel-delete"
                                                onClick={() => handleDeleteChannel(ch.id)}
                                                aria-label={`Remove ${ch.name}`}
                                                title="Remove channel"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}