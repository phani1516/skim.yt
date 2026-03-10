export interface Database {
    public: {
        Tables: {
            channels: {
                Row: {
                    id: string;
                    youtube_id: string;
                    name: string;
                    avatar_url: string | null;
                    created_at: string;
                };
                Insert: {
                    youtube_id: string;
                    name: string;
                    avatar_url?: string | null;
                };
                Update: {
                    youtube_id?: string;
                    name?: string;
                    avatar_url?: string | null;
                };
            };
            videos: {
                Row: {
                    id: string;
                    video_id: string;
                    channel_id: string;
                    title: string;
                    thumbnail_url: string | null;
                    video_url: string;
                    published_at: string;
                    is_high_signal: boolean;
                    nuggets: string[];
                    created_at: string;
                };
                Insert: {
                    video_id: string;
                    channel_id: string;
                    title: string;
                    thumbnail_url?: string | null;
                    video_url: string;
                    published_at: string;
                    is_high_signal?: boolean;
                    nuggets?: string[];
                };
                Update: {
                    video_id?: string;
                    channel_id?: string;
                    title?: string;
                    thumbnail_url?: string | null;
                    video_url?: string;
                    published_at?: string;
                    is_high_signal?: boolean;
                    nuggets?: string[];
                };
            };
            user_channels: {
                Row: {
                    id: string;
                    user_id: string;
                    channel_id: string;
                    added_at: string;
                };
                Insert: {
                    user_id: string;
                    channel_id: string;
                };
                Update: {
                    user_id?: string;
                    channel_id?: string;
                };
            };
            swipe_history: {
                Row: {
                    id: string;
                    user_id: string;
                    video_id: string;
                    direction: "left" | "right";
                    swiped_at: string;
                };
                Insert: {
                    user_id: string;
                    video_id: string;
                    direction: "left" | "right";
                };
                Update: {
                    user_id?: string;
                    video_id?: string;
                    direction?: "left" | "right";
                };
            };
        };
    };
}
