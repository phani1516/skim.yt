"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Video } from "@/data/mockVideos";
import { createClient } from "@/lib/supabase/client";
import { recordSwipe } from "@/lib/queries";
import SkimCard from "./SkimCard";

interface SwipeDeckProps {
    videos: Video[];
    userId: string;
}

const SWIPE_THRESHOLD = 120;
const VISIBLE_CARDS = 3;

export default function SwipeDeck({ videos, userId }: SwipeDeckProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const supabase = createClient();

    const visibleVideos = videos.slice(activeIndex, activeIndex + VISIBLE_CARDS);

    const handleDragEnd = (videoId: string, _: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
            const direction = info.offset.x > 0 ? "right" : "left";
            setActiveIndex((prev) => Math.min(prev + 1, videos.length - 1));
            recordSwipe(supabase, userId, videoId, direction).catch(console.error);
        }
    };

    if (activeIndex >= videos.length) {
        return (
            <div className="swipe-deck__empty">
                <p className="swipe-deck__empty-text">You&apos;re all caught up! 🎉</p>
                <button
                    className="swipe-deck__reset-btn"
                    onClick={() => setActiveIndex(0)}
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="swipe-deck">
            <AnimatePresence>
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
                            initial={{ scale: 1 - stackIndex * 0.05, y: stackIndex * 12, opacity: 1 }}
                            animate={{
                                scale: 1 - stackIndex * 0.05,
                                y: stackIndex * 12,
                                opacity: 1 - stackIndex * 0.15,
                            }}
                            exit={{
                                x: 500,
                                opacity: 0,
                                rotate: 15,
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
                            onDragEnd={isTop ? (e, info) => handleDragEnd(video.id, e, info) : undefined}
                            whileDrag={{ cursor: "grabbing", rotate: 0 }}
                        >
                            <SkimCard video={video} />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
