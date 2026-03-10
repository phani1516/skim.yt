"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface GlassSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlassSidebar({ isOpen, onClose }: GlassSidebarProps) {
    const [channelUrl, setChannelUrl] = useState("");
    const [channels, setChannels] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);

    const handleAddChannel = () => {
        if (channelUrl.trim()) {
            setChannels((prev) => [...prev, channelUrl.trim()]);
            setChannelUrl("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAddChannel();
    };

    const handleSyncGoogleSubs = async () => {
        setSyncing(true);
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in — trigger Google OAuth sign-in
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                return;
            }

            // User is logged in — placeholder for future YouTube API sync
            alert(
                "Google Subs sync coming soon! For now, add channels manually using the input above."
            );
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="sidebar__backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sidebar panel */}
                    <motion.aside
                        className="sidebar__panel"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 35 }}
                    >
                        {/* Close button */}
                        <button className="sidebar__close" onClick={onClose}>
                            ✕
                        </button>

                        {/* Logo */}
                        <div className="sidebar__logo">
                            <span className="sidebar__logo-text">skim</span>
                            <span className="sidebar__logo-dot">.yt</span>
                        </div>

                        {/* My Feed section */}
                        <div className="sidebar__section">
                            <h3 className="sidebar__section-title">My Feed</h3>
                            <div className="sidebar__section-items">
                                <button className="sidebar__item sidebar__item--active">
                                    <span className="sidebar__item-icon">📺</span>
                                    All Videos
                                </button>
                                <button className="sidebar__item">
                                    <span className="sidebar__item-icon">⭐</span>
                                    High Signal
                                </button>
                                <button className="sidebar__item">
                                    <span className="sidebar__item-icon">🕐</span>
                                    Watch Later
                                </button>
                            </div>
                        </div>

                        {/* Discovery section */}
                        <div className="sidebar__section">
                            <h3 className="sidebar__section-title">Discovery</h3>
                            <div className="sidebar__section-items">
                                <button className="sidebar__item">
                                    <span className="sidebar__item-icon">🔥</span>
                                    Trending
                                </button>
                                <button className="sidebar__item">
                                    <span className="sidebar__item-icon">💡</span>
                                    Recommended
                                </button>
                            </div>
                        </div>

                        {/* Sources section */}
                        <div className="sidebar__section">
                            <h3 className="sidebar__section-title">Sources</h3>

                            {/* Add channel input */}
                            <div className="sidebar__add-channel">
                                <input
                                    type="url"
                                    placeholder="Paste YouTube channel URL..."
                                    value={channelUrl}
                                    onChange={(e) => setChannelUrl(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="sidebar__input"
                                />
                                <button
                                    onClick={handleAddChannel}
                                    className="sidebar__add-btn"
                                    disabled={!channelUrl.trim()}
                                >
                                    + Add
                                </button>
                            </div>

                            {/* Sync Google subs */}
                            <button
                                className="sidebar__sync-btn"
                                onClick={handleSyncGoogleSubs}
                                disabled={syncing}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className={syncing ? "animate-spin" : ""}
                                >
                                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m0 0a9 9 0 0 1 9-9m-9 9a9 9 0 0 0 9 9" />
                                </svg>
                                {syncing ? "Syncing..." : "Sync Google Subs"}
                            </button>

                            {/* Added channels list */}
                            {channels.length > 0 && (
                                <div className="sidebar__channels">
                                    {channels.map((ch, i) => (
                                        <div key={i} className="sidebar__channel-item">
                                            <span className="sidebar__channel-icon">📡</span>
                                            <span className="sidebar__channel-url">{ch}</span>
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
