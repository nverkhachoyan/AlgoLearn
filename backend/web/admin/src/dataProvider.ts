import { fetchUtils } from "react-admin";
import {
  CourseResponse,
  UnitResponse,
  ModuleResponse,
  ApiResponse,
} from "./types";

const API_URL = "/api/v1";

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

const sortData = (data: any[], field: string, order: string) => {
  return [...data].sort((a, b) => {
    if (a[field] == null) return 1;
    if (b[field] == null) return -1;

    const aValue = a[field].toString().toLowerCase();
    const bValue = b[field].toString().toLowerCase();

    if (order === "ASC") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
};

const adaptGetListResponse = (json: CourseResponse, params: any) => {
  if (!json.success) {
    throw new Error(json.message);
  }

  let items = json.payload.items;
  if (params.sort && params.sort.field) {
    items = sortData(items, params.sort.field, params.sort.order);
  }

  return {
    data: items.map((item) => ({
      ...item,
      id: item.id,
    })),
    total: json.payload.pagination.totalItems,
  };
};

const adaptBulkResponse = (
  json: UnitResponse | ModuleResponse,
  params: any
) => {
  if (!json.success) {
    throw new Error(json.message);
  }

  let items = json.payload;
  if (params.sort && params.sort.field) {
    items = sortData(items, params.sort.field, params.sort.order);
  }

  return {
    data: items.map((item) => ({
      ...item,
      id: item.id,
    })),
    total: items.length,
  };
};

const adaptGetOneResponse = (json: ApiResponse<any>) => {
  if (!json.success) {
    throw new Error(json.message);
  }
  return {
    data: {
      ...json.payload,
      id: json.payload.id,
    },
  };
};

const getResourceUrl = (resource: string, params: any) => {
  switch (resource) {
    case "units":
      if (!params.filter?.courseId) {
        throw new Error("Course ID is required for units");
      }
      return `${API_URL}/courses/${params.filter.courseId}/units`;
    case "modules":
      if (!params.filter?.courseId || !params.filter?.unitId) {
        throw new Error("Course ID and Unit ID are required for modules");
      }
      return `${API_URL}/courses/${params.filter.courseId}/units/${params.filter.unitId}/modules/bulk`;
    default:
      return `${API_URL}/${resource}`;
  }
};

const getOneResourceUrl = (
  resource: string,
  id: string | number,
  params: any
) => {
  switch (resource) {
    case "units":
      if (!params.courseId) {
        throw new Error("Course ID is required for unit operations");
      }
      return `${API_URL}/courses/${params.courseId}/units/${id}`;
    case "modules":
      if (!params.courseId || !params.unitId) {
        throw new Error(
          "Course ID and Unit ID are required for module operations"
        );
      }
      return `${API_URL}/courses/${params.courseId}/units/${params.unitId}/modules/${id}`;
    default:
      return `${API_URL}/${resource}/${id}`;
  }
};

export const dataProvider: any = {
  getList: async (resource: string, params: any) => {
    const { page, perPage } = params.pagination;
    const url = `${getResourceUrl(
      resource,
      params
    )}?page=${page}&pageSize=${perPage}`;

    const { json } = await httpClient(url);

    if (resource === "courses") {
      return adaptGetListResponse(json as CourseResponse, params);
    } else {
      return adaptBulkResponse(json as UnitResponse | ModuleResponse, params);
    }
  },

  getOne: async (resource: string, params: any) => {
    const url = getOneResourceUrl(resource, params.id, params.data || {});
    const { json } = await httpClient(url);
    return adaptGetOneResponse(json);
  },

  create: async (resource: string, params: any) => {
    const url = getResourceUrl(resource, {
      filter: {
        courseId: params.data.courseId,
        unitId: params.data.unitId,
      },
    });
    const { json } = await httpClient(url, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    return adaptGetOneResponse(json);
  },

  update: async (resource: string, params: any) => {
    const url = getOneResourceUrl(resource, params.id, params.data);
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return adaptGetOneResponse(json);
  },

  updateMany: async (resource: string, params: any) => {
    await Promise.all(
      params.ids.map((id: string | number) =>
        httpClient(getOneResourceUrl(resource, id, params.data), {
          method: "PUT",
          body: JSON.stringify(params.data),
        })
      )
    );
    return { data: params.ids };
  },

  delete: async (resource: string, params: any) => {
    const url = getOneResourceUrl(resource, params.id, params.previousData);
    await httpClient(url, {
      method: "DELETE",
    });
    return { data: params.previousData };
  },

  deleteMany: async (resource: string, params: any) => {
    await Promise.all(
      params.ids.map((id: string | number) =>
        httpClient(getOneResourceUrl(resource, id, params.data), {
          method: "DELETE",
        })
      )
    );
    return { data: params.ids };
  },

  getMany: async (resource: string, params: any) => {
    const responses = await Promise.all(
      params.ids.map((id: string | number) =>
        httpClient(getOneResourceUrl(resource, id, params.data))
      )
    );
    return {
      data: responses.map((response) => ({
        ...response.json.payload,
        id: response.json.payload.id,
      })),
    };
  },

  getManyReference: async (resource: string, params: any) => {
    const { page, perPage } = params.pagination;
    const url = `${getResourceUrl(
      resource,
      params
    )}?page=${page}&pageSize=${perPage}&${params.target}=${params.id}`;

    const { json } = await httpClient(url);
    if (resource === "courses") {
      return adaptGetListResponse(json as CourseResponse, params);
    } else {
      return adaptBulkResponse(json as UnitResponse | ModuleResponse, params);
    }
  },
};
