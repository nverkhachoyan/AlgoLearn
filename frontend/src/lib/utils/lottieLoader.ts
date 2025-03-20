import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

type LoadResult = {
  source: any;
  error: string | null;
  usingFallback: boolean;
};

/**
 * Loads a Lottie animation from various sources, handling different formats and fallbacks
 */
export async function loadLottieAnimation(
  source: string | object | null,
  fallbackUrl?: string | null
): Promise<LoadResult> {
  if (!source) {
    return {
      source: null,
      error: "No animation source provided",
      usingFallback: false,
    };
  }

  try {
    // If it's already an animation object, use it directly
    if (typeof source !== "string") {
      return {
        source: source,
        error: null,
        usingFallback: false,
      };
    }

    // Step 1: Try to load directly as JSON if it ends with .json
    if (source.toLowerCase().endsWith(".json")) {
      try {
        console.log("Treating as JSON file:", source);
        const response = await fetch(source);
        const jsonData = await response.json();
        return {
          source: jsonData,
          error: null,
          usingFallback: false,
        };
      } catch (jsonError) {
        console.error("Failed to parse as JSON:", jsonError);
        // Continue to next approach
      }
    }

    // Step 2: Try to convert the file to base64 (mobile only)
    if (Platform.OS !== "web" && FileSystem) {
      try {
        // Create a unique filename for caching
        const fileUri = source;
        const filename = fileUri.substring(fileUri.lastIndexOf("/") + 1);
        // Explicitly add .lottie extension to help the parser identify the format
        const localUri = `${FileSystem.cacheDirectory}lottie_${filename}.lottie`;

        console.log("Downloading animation to local cache:", localUri);

        // Download the file
        const downloadResult = await FileSystem.downloadAsync(
          fileUri,
          localUri,
          {
            headers: {
              Accept: "application/octet-stream, */*", // Accept binary data explicitly
            },
          }
        );

        if (downloadResult.status === 200) {
          console.log("Download successful, loading from:", localUri);

          // For iOS, we need to ensure the file URL format is correct
          let finalUri = localUri;
          if (Platform.OS === "ios" && !finalUri.startsWith("file://")) {
            finalUri = `file://${finalUri}`;
          }

          return {
            source: { uri: finalUri },
            error: null,
            usingFallback: false,
          };
        } else {
          throw new Error(
            `Download failed with status ${downloadResult.status}`
          );
        }
      } catch (downloadError) {
        console.error("Failed to download and cache file:", downloadError);
        // Continue to next approach
      }
    }

    // Step 3: Try direct URI loading as last resort
    console.log("Trying direct URI loading:", source);
    return {
      source: { uri: source },
      error: null,
      usingFallback: false,
    };
  } catch (err) {
    console.error("All lottie loading approaches failed:", err);

    // Try fallback if available
    if (fallbackUrl) {
      console.log("Using fallback URL:", fallbackUrl);
      return {
        source: { uri: fallbackUrl },
        error: null,
        usingFallback: true,
      };
    }

    return {
      source: null,
      error: "Failed to load animation",
      usingFallback: false,
    };
  }
}
