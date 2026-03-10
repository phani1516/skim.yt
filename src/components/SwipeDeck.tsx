"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Video } from "@/data/mockVideos";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/queries";
import SkimCard from "./SkimCard";

interface SwipeDeckProps {
    videos: Video[];
    userId: string;
}

const SWIPE_THRESHOLD = 100;
const VISIBLE_CARDS = 3;

export default function SwipeDeck({ videos, userId }: SwipeDeckProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right
    const supabase = createClient();

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
            if (info.offset.x < 0) {
                // Swiped LEFT → go to NEXT card
                if (activeIndex < videos.length - 1) {
                    setDirection(-1);
                    setActiveIndex((prev) => prev + 1);
                }
            } else {
                // Swiped RIGHT → go to PREVIOUS card
                if (activeIndex > 0) {
                    setDirection(1);
                    setActiveIndex((prev) => prev - 1);
                }
            }
        }
    };

    const handleToggleFavorite = async (videoId: string) => {
        const isFav = await toggleFavorite(supabase, userId, videoId);
        setFavorites((prev) => {
            const next = new Set(prev);
            if (isFav) {
                next.add(videoId);
            } else {
                next.delete(videoId);
            }
            return next;
        });
    };

    if (videos.length === 0) {
        return (
            <div className="swipe-deck__empty">
                <p className="swipe-deck__empty-text">No videos yet — add a channel! 📡</p>
            </div>
        );
    }

    // Build the visible stack (current + next 2 behind)
    const visibleVideos = videos.slice(activeIndex, activeIndex + VISIBLE_CARDS);

    return (
        <div className="swipe-deck">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                {visibleVideos.map((video, stackIndex) => {
                    const isTop = stackIndex === 0;

                    return (
                        <motion.div
                            key={video.id}
                            className="swipe-deck__card-wrapper"
                            style={{
                                zIndex: VISIBLE_CARDS - stackIndex,
                                pointerEvents: isTop ? "auto" : "none",
                            }}
                            custom={direction}
                            initial={{
                                scale: 1 - stackIndex * 0.05,
                                y: stackIndex * 12,
                                opacity: 1,
                                x: direction < 0 ? 300 : direction > 0 ? -300 : 0,
                            }}
                            animate={{
                                scale: 1 - stackIndex * 0.05,
                                y: stackIndex * 12,
                                opacity: 1 - stackIndex * 0.15,
                                x: 0,
                            }}
                            exit={{
                                x: direction < 0 ? -300 : 300,
                                opacity: 0,
                                transition: { type: "spring", stiffness: 300, damping: 30 },
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            drag={isTop ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.9}
                            onDragEnd={isTop ? handleDragEnd : undefined}
                            whileDrag={{ cursor: "grabbing" }}
                        >
                            <SkimCard
                                video={video}
                                isFavorited={favorites.has(video.id)}
                                onToggleFavorite={() => handleToggleFavorite(video.id)}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Carousel position indicator */}
            <div className="swipe-deck__indicators">
                <span className="swipe-deck__indicator-text">
                    {activeIndex + 1} / {videos.length}
                </span>
            </div>
        </div>
    );
}
