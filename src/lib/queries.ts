import type { Video } from "@/data/mockVideos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/** Fetch videos for the user's subscribed channels (carousel — no swipe filtering) */
export async function fetchFeedVideos(
    supabase: SupabaseClient,
    userId: string
): Promise<Video[]> {
    // 1. Get channels the user is subscribed to
    const { data: subs } = await supabase
        .from("user_channels")
        .select("channel_id")
        .eq("user_id", userId);

    const subscribedChannelIds = (subs ?? []).map(
        (s: { channel_id: string }) => s.channel_id
    );

    // If they aren't subscribed to anything, return empty array
    if (subscribedChannelIds.length === 0) return [];

    // 2. Fetch the feed — no swipe_history exclusion (carousel model keeps all cards)
    const { data, error } = await supabase
        .from("videos")
        .select(
            `
      id,
      video_id,
      title,
      thumbnail_url,
      video_url,
      published_at,
      is_high_signal,
      nuggets,
      channels ( name, avatar_url )
    `
        )
        .in("channel_id", subscribedChannelIds)
        .order("published_at", { ascending: false })
        .limit(100);

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
        id: row.id,
        videoId: row.video_id,
        channelName: row.channels.name,
        channelAvatar: row.channels.avatar_url ?? "",
        thumbnailUrl: row.thumbnail_url ?? "",
        title: row.title,
        publishedAt: row.published_at,
        isHighSignal: row.is_high_signal,
        videoUrl: row.video_url,
        nuggets: row.nuggets ?? [],
    }));
}

/** Record a swipe action (legacy — kept for backward compat) */
export async function recordSwipe(
    supabase: SupabaseClient,
    userId: string,
    videoId: string,
    direction: "left" | "right"
) {
    const { error } = await supabase
        .from("swipe_history")
        .upsert({ user_id: userId, video_id: videoId, direction });

    if (error) throw error;
}

/** Toggle a video as favorite — insert if not exists, delete if exists */
export async function toggleFavorite(
    supabase: SupabaseClient,
    userId: string,
    videoId: string
): Promise<boolean> {
    // Check if already favorited
    const { data: existing } = await supabase
        .from("user_favorites")
        .select("user_id")
        .eq("user_id", userId)
        .eq("video_id", videoId)
        .maybeSingle();

    if (existing) {
        // Remove favorite
        await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", userId)
            .eq("video_id", videoId);
        return false; // no longer favorited
    } else {
        // Add favorite
        await supabase
            .from("user_favorites")
            .insert({ user_id: userId, video_id: videoId });
        return true; // now favorited
    }
}

/** Get user's favorited video IDs */
export async function getUserFavorites(
    supabase: SupabaseClient,
    userId: string
): Promise<string[]> {
    const { data, error } = await supabase
        .from("user_favorites")
        .select("video_id")
        .eq("user_id", userId);

    if (error) return [];
    return (data ?? []).map((row: { video_id: string }) => row.video_id);
}

/** Add a channel by YouTube ID (find-or-create to avoid RLS upsert issues) */
export async function addChannel(
    supabase: SupabaseClient,
    youtubeId: string,
    name: string,
    avatarUrl?: string
) {
    // First check if the channel already exists
    const { data: existing } = await supabase
        .from("channels")
        .select("*")
        .eq("youtube_id", youtubeId)
        .maybeSingle();

    if (existing) return existing;

    // Only insert if it doesn't exist
    const { data, error } = await supabase
        .from("channels")
        .insert({
            youtube_id: youtubeId,
            name,
            avatar_url: avatarUrl ?? null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** Subscribe user to a channel */
export async function subscribeToChannel(
    supabase: SupabaseClient,
    userId: string,
    channelId: string
) {
    const { error } = await supabase
        .from("user_channels")
        .upsert({ user_id: userId, channel_id: channelId });

    if (error) throw error;
}

/** Remove a channel subscription for the user */
export async function removeChannel(
    supabase: SupabaseClient,
    userId: string,
    channelId: string
) {
    const { error } = await supabase
        .from("user_channels")
        .delete()
        .eq("user_id", userId)
        .eq("channel_id", channelId);

    if (error) throw error;
}

/** Get user's subscribed channels */
export async function getUserChannels(
    supabase: SupabaseClient,
    userId: string
) {
    const { data, error } = await supabase
        .from("user_channels")
        .select("channels ( id, youtube_id, name, avatar_url )")
        .eq("user_id", userId);

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => row.channels);
}
