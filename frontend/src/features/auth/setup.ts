import { createApiClient } from "@/src/lib/api/config";
import { setupAuthInterceptors } from "./interceptors/authInterceptor";

const api = createApiClient();
setupAuthInterceptors(api);

export default api;
