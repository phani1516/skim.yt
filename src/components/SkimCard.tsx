"use client";

import { useState } from "react";
import { Video } from "@/data/mockVideos";

interface SkimCardProps {
    video: Video;
    isFavorited?: boolean;
    onToggleFavorite?: () => void;
}

/** Format ISO 8601 date string into a clean relative or absolute date */
function formatDate(isoString: string): string {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    } catch {
        return "";
    }
}

export default function SkimCard({ video, isFavorited = false, onToggleFavorite }: SkimCardProps) {
    const [avatarError, setAvatarError] = useState(false);

    return (
        <div className="skim-card">
            {/* Thumbnail background layer */}
            <div
                className="skim-card__thumbnail"
                style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
            />

            {/* Radial vignette overlay */}
            <div className="skim-card__vignette" />

            {/* Glass content panel */}
            <div className="skim-card__glass-panel">
                {/* Channel info + favorite */}
                <div className="skim-card__channel">
                    {!avatarError && video.channelAvatar ? (
                        <img
                            src={video.channelAvatar}
                            alt={video.channelName}
                            className="skim-card__channel-avatar"
                            onError={() => setAvatarError(true)}
                        />
                    ) : (
                        <div className="skim-card__channel-avatar-fallback">
                            {video.channelName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="skim-card__channel-name">{video.channelName}</span>

                    {/* Upload date */}
                    {video.publishedAt && (
                        <span className="skim-card__date">
                            {formatDate(video.publishedAt)}
                        </span>
                    )}

                    {video.isHighSignal && (
                        <span className="skim-card__signal-badge">★ High Signal</span>
                    )}

                    {/* Favorite button */}
                    {onToggleFavorite && (
                        <button
                            className={`skim-card__favorite-btn ${isFavorited ? "skim-card__favorite-btn--active" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite();
                            }}
                            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isFavorited ? "♥" : "♡"}
                        </button>
                    )}
                </div>

                {/* Video title */}
                <h2 className="skim-card__title">{video.title}</h2>

                {/* Nuggets */}
                <ul className="skim-card__nuggets">
                    {video.nuggets.map((nugget, i) => (
                        <li key={i} className="skim-card__nugget">
                            {nugget}
                        </li>
                    ))}
                </ul>

                {/* Watch on YouTube button */}
                <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="skim-card__youtube-btn"
                >
                    <svg
                        className="skim-card__youtube-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    Watch on YouTube
                </a>
            </div>
        </div>
    );
}
