import api from "@/src/lib/api/client";
import { setupAuthInterceptors } from "./interceptors/authInterceptor";

// Initialize auth interceptors
setupAuthInterceptors(api);

export default api;
