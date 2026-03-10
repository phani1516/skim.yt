import { mockVideos } from "@/data/mockVideos";
import { roundRobinSort } from "@/utils/roundRobin";
import MobileLayout from "@/components/MobileLayout";
import SwipeDeck from "@/components/SwipeDeck";

export default function Home() {
  const sortedVideos = roundRobinSort(mockVideos);

  return (
    <MobileLayout>
      <SwipeDeck videos={sortedVideos} />
    </MobileLayout>
  );
}
