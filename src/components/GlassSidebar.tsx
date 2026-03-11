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

            // Extract a handle or ID from the pasted text
            // Supports: UC..., @handle, youtube.com/... URLs
            let youtubeId = channelUrl.trim();
            if (youtubeId.includes("youtube.com/")) {
                youtubeId = youtubeId.split("/").pop() || youtubeId;
            }
            // Strip leading @ for cleaner storage (backend resolves handles)
            youtubeId = youtubeId.replace(/^@/, "");

            // 1. Add to channels table (backend pipeline resolves @handles to UC... IDs)
            const newChannel = await addChannel(supabase, youtubeId, youtubeId, "");

            // 2. Subscribe the user
            await subscribeToChannel(supabase, user.id, newChannel.id);

            // Avoid duplicate entries in local state
            setChannels((prev) => {
                if (prev.some((ch) => ch.id === newChannel.id)) return prev;
                return [...prev, newChannel];
            });
            setChannelUrl("");
            alert("Channel added! Videos will appear after the next pipeline run.");

        } catch (err) {
            console.error(err);
            alert("Failed to add channel. Please check the ID or handle.");
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
                                    placeholder="Channel ID or @handle..."
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

                            {channels.length > 0 && (
                                <div className="sidebar__channels">
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