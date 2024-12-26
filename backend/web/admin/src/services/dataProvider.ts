import { DataProvider, fetchUtils, GetManyReferenceParams } from "react-admin";

const API_URL = "/api/v1";

// Simple function to add auth header to all requests
const httpClient = (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }

  options.headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  });

  return fetchUtils.fetchJson(url, options);
};

export const dataProvider: DataProvider = {
  // Get a list of records
  getList: (resource, params) => {
    let url = `${API_URL}/${resource}?page=${params.pagination.page}&pageSize=${params.pagination.perPage}`;

    if (params.sort) {
      url += `&sort=${params.sort.field}&order=${params.sort.order}`;
    }

    if (params.filter) {
      url += `&filter=${JSON.stringify(params.filter)}`;
    }

    // Special case for users/all
    if (resource === "users/all") {
      return httpClient(`${API_URL}/users/all`).then(({ json }) => ({
        data: json.payload.items || json.payload,
        total: json.payload.pagination?.totalItems || json.payload.length,
      }));
    }

    return httpClient(url).then(({ json }) => ({
      data: json.payload.items,
      total: json.payload.pagination.totalItems,
    }));
  },

  // Get a single record
  getOne: (resource, params) => {
    // Special case for count endpoints
    if (params.id === "count") {
      if (resource === "modules") {
        return httpClient(`${API_URL}/courses/0/units/0/modules/count`).then(
          ({ json }) => ({
            data: { id: "count", value: json.payload },
          })
        );
      }
      if (resource === "units") {
        return httpClient(`${API_URL}/courses/0/units/count`).then(
          ({ json }) => ({
            data: { id: "count", value: json.payload },
          })
        );
      }
      if (resource === "courses") {
        return httpClient(`${API_URL}/courses/count`).then(({ json }) => ({
          data: { id: "count", value: json.payload },
        }));
      }
      if (resource === "users") {
        return httpClient(`${API_URL}/users/count`).then(({ json }) => ({
          data: { id: "count", value: json.payload },
        }));
      }

      return httpClient(`${API_URL}/${resource}/count`).then(({ json }) => ({
        data: { id: "count", value: json.payload },
      }));
    }

    return httpClient(`${API_URL}/${resource}/${params.id}`).then(
      ({ json }) => ({
        data: json.payload,
      })
    );
  },

  // Create a record
  create: (resource, params) => {
    let url = `${API_URL}/${resource}`;

    // Handle nested resources
    if (resource === "units" && params.data.courseId) {
      url = `${API_URL}/courses/${params.data.courseId}/units`;
    } else if (
      resource === "modules" &&
      params.data.courseId &&
      params.data.unitId
    ) {
      url = `${API_URL}/courses/${params.data.courseId}/units/${params.data.unitId}/modules`;
    }

    return httpClient(url, {
      method: "POST",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: json.payload,
    }));
  },

  // Update a record
  update: (resource, params) => {
    let url = `${API_URL}/${resource}/${params.id}`;

    // Handle nested resources
    if (resource === "units" && params.data.courseId) {
      url = `${API_URL}/courses/${params.data.courseId}/units/${params.id}`;
    } else if (
      resource === "modules" &&
      params.data.courseId &&
      params.data.unitId
    ) {
      url = `${API_URL}/courses/${params.data.courseId}/units/${params.data.unitId}/modules/${params.id}`;
    }

    return httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: json.payload,
    }));
  },

  // Delete a record
  delete: (resource, params) => {
    let url = `${API_URL}/${resource}/${params.id}`;

    // Handle nested resources
    if (resource === "units" && params.meta?.courseId) {
      url = `${API_URL}/courses/${params.meta.courseId}/units/${params.id}`;
    } else if (
      resource === "modules" &&
      params.meta?.courseId &&
      params.meta?.unitId
    ) {
      url = `${API_URL}/courses/${params.meta.courseId}/units/${params.meta.unitId}/modules/${params.id}`;
    }

    return httpClient(url, {
      method: "DELETE",
    }).then(() => {
      // For React Admin, we need to return a record with at least an id
      return { data: { id: params.id } as any };
    });
  },

  // Update multiple records
  updateMany: (resource, params) => {
    return Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: "PUT",
          body: JSON.stringify(params.data),
        })
      )
    ).then(() => ({ data: params.ids }));
  },

  // Delete multiple records
  deleteMany: (resource, params) => {
    return Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: "DELETE",
        })
      )
    ).then(() => ({ data: params.ids }));
  },

  // Get multiple records
  getMany: (resource, params) => {
    return Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resource}/${id}`).then(
          ({ json }) => json.payload
        )
      )
    ).then((items) => ({ data: items }));
  },

  // Get records referenced by another record
  getManyReference: (resource, params) => {
    console.log("getManyReference", resource, params);
    if (resource === "users") {
      return httpClient(
        `${API_URL}/users?page=${params.pagination.page}&pageSize=${params.pagination.perPage}`
      ).then(({ json }) => ({
        data: json.payload.items,
        total: json.payload.pagination.totalItems,
      }));
    }

    const url = `${API_URL}/${resource}?page=${params.pagination.page}&pageSize=${params.pagination.perPage}&${params.target}=${params.id}`;

    return httpClient(url).then(({ json }) => ({
      data: json.payload.items,
      total: json.payload.pagination.totalItems,
    }));
  },
};
