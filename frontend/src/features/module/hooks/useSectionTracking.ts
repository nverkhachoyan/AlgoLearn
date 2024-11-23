// hooks/useSectionTracking.ts
import { useState, useCallback } from "react";
import { SectionViewState } from "../types";

export const useSectionTracking = (moduleId: number, userId: number) => {
  const [sectionViews, setSectionViews] = useState<
    Map<number, SectionViewState>
  >(new Map());

  const trackSectionView = useCallback(
    async (sectionId: number) => {
      setSectionViews((prev) => {
        const next = new Map(prev);
        if (!next.has(sectionId)) {
          next.set(sectionId, {
            sectionId,
            hasViewed: true,
            viewedAt: new Date(),
          });

          // Make API call to save progress
          // fetch("/api/section-progress", {
          //   method: "POST",
          //   body: JSON.stringify({
          //     sectionId,
          //     moduleId,
          //     userId,
          //     completed: true,
          //     completedAt: new Date(),
          //   }),
          // }).catch(console.error);
          console.log("sending section progress");
        }
        return next;
      });
    },
    [moduleId, userId]
  );

  const getSectionProgress = useCallback(() => {
    const totalSections = Array.from(sectionViews.values()).length;
    const viewedSections = Array.from(sectionViews.values()).filter(
      (s) => s.hasViewed
    ).length;
    return (viewedSections / totalSections) * 100;
  }, [sectionViews]);

  return {
    sectionViews,
    trackSectionView,
    getSectionProgress,
  };
};
