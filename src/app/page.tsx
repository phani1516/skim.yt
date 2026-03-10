import { fetchFeedVideos } from "@/lib/queries";
import { roundRobinSort } from "@/utils/roundRobin";
import { createClient } from "@/lib/supabase/server";
import MobileLayout from "@/components/MobileLayout";
import SwipeDeck from "@/components/SwipeDeck";
import AuthButton from "@/components/AuthButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user is not logged in, force them to sign in
  if (!user) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <p className="text-white/60 font-medium">
            Please sign in to view your nuggets.
          </p>
          <AuthButton />
        </div>
      </MobileLayout>
    );
  }

  // If logged in, fetch their specific feed from the database
  const rawVideos = await fetchFeedVideos(supabase, user.id);
  const sortedVideos = roundRobinSort(rawVideos);

  return (
    <MobileLayout>
      <SwipeDeck videos={sortedVideos} />
    </MobileLayout>
  );
}