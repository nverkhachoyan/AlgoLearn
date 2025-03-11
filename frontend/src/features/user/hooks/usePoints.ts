// usePoints.js - A simplified hook for managing points in the frontend
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { User } from "../types/index";

const POINTS_VALUES = {
  SECTION_COMPLETION: 2,
  CORRECT_ANSWER: 5,
  MODULE_COMPLETION: 10,
};

export type PointUpdate = {
  cpus: number;
  actionType: string;
  timestamp: number;
}

export function usePoints() {
  const queryClient = useQueryClient();
  const [pendingUpdates, setPendingUpdates] = useState<PointUpdate[]>([]);

  console.log("POIINTS", pendingUpdates)
  // Apply any pending point updates to the user data in the query cache
  useEffect(() => {
    if (pendingUpdates.length > 0) {
      // Get the current user data from the cache
      const userData: User | undefined = queryClient.getQueryData(["user"]);

      if (userData) {
        // Calculate total points to add
        const pointsToAdd = pendingUpdates.reduce((sum, update) => sum + update.cpus, 0);

        // Update the user data in the cache
        queryClient.setQueryData(["user"], {
          ...userData,
          cpus: (userData.cpus || 0) + pointsToAdd,
        });

        // Clear the pending updates
        setPendingUpdates([]);
      }
    }
  }, [pendingUpdates, queryClient]);

  // Helper functions to update points locally
  const addPoints = (cpus: number, actionType: string) => {
    setPendingUpdates(prev => [...prev, {
      cpus,
      actionType,
      timestamp: Date.now()
    }]);
  };

  const addSectionPoints = () => {
    addPoints(POINTS_VALUES.SECTION_COMPLETION, 'section_completion');
  };

  const addCorrectAnswerPoints = () => {
    addPoints(POINTS_VALUES.CORRECT_ANSWER, 'correct_answer');
  };

  const addModuleCompletionPoints = () => {
    addPoints(POINTS_VALUES.MODULE_COMPLETION, 'module_completion');
  };

  return {
    addPoints,
    addSectionPoints,
    addCorrectAnswerPoints,
    addModuleCompletionPoints,
    pointsValues: POINTS_VALUES,
  };
}
