import { DataProvider, fetchUtils, RaRecord, Identifier } from "react-admin";
import { Course } from '../types';

interface HttpClientOptions extends RequestInit {
  headers?: Headers | Record<string, string>;
}

interface BaseRecord extends RaRecord {
  id: Identifier;
}

const API_URL = "/api/v1";
const S3_BASE_URL = "https://algolearn.sfo3.cdn.digitaloceanspaces.com";

// Utility function to get full S3 URL
const getFullS3Url = (key: string | null | undefined) => {
  if (!key) return null;
  return `${S3_BASE_URL}/${key}`;
};

// Transform function for courses to add full URLs
const transformCourseData = (course: Course | null) => {
  if (!course) return course;
  return {
    ...course,
    iconUrl: getFullS3Url(course.iconUrl),
  };
};

// Simple function to add auth header to all requests
const httpClient = (url: string, options: HttpClientOptions = {}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  options.headers = new Headers(headers);

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

    // Special case for tags search
    if (resource === 'tags' && params.filter?.q) {
      return httpClient(`${API_URL}/courses/tags/search?page=${params.pagination.page}&pageSize=${params.pagination.perPage}&q=${params.filter.q}`).then(({ json }) => ({
        data: json.payload.items,
        total: json.payload.pagination.totalItems,
      }));
    }

    return httpClient(url).then(({ json }) => {
      if (resource === "courses") {
        return {
          data: json.payload.items.map(transformCourseData),
          total: json.payload.pagination.totalItems,
        };
      }
      return {
        data: json.payload.items,
        total: json.payload.pagination.totalItems,
      };
    });
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
        data: resource === "courses" ? transformCourseData(json.payload) : json.payload,
      })
    );
  },

  // Create a record
  create: (resource, params) => {
    let url = `${API_URL}/${resource}`;

    // Special case for tags
    if (resource === 'tags') {
      url = `${API_URL}/courses/tags?name=${encodeURIComponent(params.data.name)}`;
    }

    // Special case for adding tag to course
    if (resource.match(/^courses\/\d+\/tags$/)) {
      const courseId = resource.split('/')[1];
      url = `${API_URL}/courses/${courseId}/tags/${params.data.tagId}`;
    }

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

    // Special case for tags - don't send body
    if (resource === 'tags' || resource.match(/^courses\/\d+\/tags$/)) {
      return httpClient(url, {
        method: "POST",
      }).then(({ json }) => {
        // For tag creation, return the payload directly
        if (resource === 'tags') {
          return {
            data: {
              id: json.payload.id,
              name: json.payload.name,
            },
          };
        }
        // For tag association, return a response with an id to satisfy react-admin
        const tagId = url.split('/').pop(); // Get the tag ID from the URL
        return {
          data: {
            id: parseInt(tagId!),
            success: true,
          },
        };
      });
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
  delete: <RecordType extends BaseRecord>(resource: string, params: { id: Identifier; meta?: { courseId?: string; unitId?: string } }) => {
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
    }).then(() => ({
      data: { id: params.id } as RecordType,
    }));
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

  // Add file upload method
  upload: async (resource: string, params: { file: File }) => {
    try {
      // Get presigned URL
      const presignResponse = await httpClient(`${API_URL}/upload/presign`, {
        method: "POST",
        body: JSON.stringify({
          filename: params.file.name,
          contentType: params.file.type,
        }),
      });

      const { url, key } = presignResponse.json.payload;

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": params.file.type,
          "x-amz-acl": "public-read",
        },
        body: params.file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      return { data: { key } };
    } catch (error) {
      throw new Error(`Upload error: ${error}`);
    }
  },
};
