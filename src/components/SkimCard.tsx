"use client";

import { Video } from "@/data/mockVideos";

interface SkimCardProps {
    video: Video;
}

export default function SkimCard({ video }: SkimCardProps) {
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
                {/* Reflection pseudo-element handled via CSS ::after */}

                {/* Channel info */}
                <div className="skim-card__channel">
                    <img
                        src={video.channelAvatar}
                        alt={video.channelName}
                        className="skim-card__channel-avatar"
                    />
                    <span className="skim-card__channel-name">{video.channelName}</span>
                    {video.isHighSignal && (
                        <span className="skim-card__signal-badge">★ High Signal</span>
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
