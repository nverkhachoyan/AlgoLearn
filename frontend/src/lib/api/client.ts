import { createApiClient } from "./config";

const api = createApiClient();

export default api;
export { handleApiError } from "./config";
