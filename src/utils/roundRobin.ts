import { Video } from "@/data/mockVideos";

/**
 * Round-robin chronological sort.
 * Groups videos by channel, sorts each group by publishedAt (newest first),
 * then interleaves: newest A, newest B, newest C, 2nd newest A, 2nd newest B...
 */
export function roundRobinSort(videos: Video[]): Video[] {
    // Group by channel
    const channelMap = new Map<string, Video[]>();

    for (const video of videos) {
        const group = channelMap.get(video.channelName) || [];
        group.push(video);
        channelMap.set(video.channelName, group);
    }

    // Sort each group by publishedAt descending (newest first)
    for (const group of channelMap.values()) {
        group.sort(
            (a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }

    // Interleave round-robin
    const channels = Array.from(channelMap.values());
    const result: Video[] = [];
    const maxLen = Math.max(...channels.map((c) => c.length));

    for (let i = 0; i < maxLen; i++) {
        for (const channel of channels) {
            if (i < channel.length) {
                result.push(channel[i]);
            }
        }
    }

    return result;
}
