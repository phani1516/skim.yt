import type { Video } from "@/data/mockVideos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/** Fetch videos for the user's subscribed channels (excluding already swiped videos) */
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

    // 2. Get videos they have already swiped on
    const { data: swipes } = await supabase
        .from("swipe_history")
        .select("video_id")
        .eq("user_id", userId);

    const swipedVideoIds = (swipes ?? []).map(
        (s: { video_id: string }) => s.video_id
    );

    // 3. Fetch the actual feed
    let query = supabase
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
        .limit(30);

    // Supabase throws an error if you pass an empty array to .not("id", "in", [])
    if (swipedVideoIds.length > 0) {
        query = query.not("id", "in", `(${swipedVideoIds.join(",")})`);
    }

    const { data, error } = await query;

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

/** Record a swipe action */
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

/** Add a channel by YouTube ID */
export async function addChannel(
    supabase: SupabaseClient,
    youtubeId: string,
    name: string,
    avatarUrl?: string
) {
    const { data, error } = await supabase
        .from("channels")
        .upsert(
            {
                youtube_id: youtubeId,
                name,
                avatar_url: avatarUrl ?? null,
            },
            { onConflict: "youtube_id" }
        )
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
