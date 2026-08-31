import type { z } from 'zod';
import { env } from '@/config/env';

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly responseData?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code?: string,
    details?: unknown,
    responseData?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.responseData = responseData;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export interface RequestOptions<T = unknown> extends Omit<RequestInit, 'body' | 'method'> {
  params?: QueryParams;
  schema?: z.ZodType<T>;
}

function buildUrl(path: string, params?: QueryParams): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = env.VITE_API_URL.replace(/\/$/, '');
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== '') {
            url.searchParams.append(key, String(item));
          }
        });
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function handleResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
  let responseData: unknown = null;
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else if (response.status !== 204) {
    responseData = await response.text();
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorCode: string | undefined;
    let errorDetails: unknown;

    if (responseData && typeof responseData === 'object') {
      const dataObj = responseData as Record<string, unknown>;
      if (typeof dataObj.message === 'string') {
        errorMessage = dataObj.message;
      } else if (Array.isArray(dataObj.message) && dataObj.message.length > 0) {
        errorMessage = dataObj.message.join(', ');
      }
      if (typeof dataObj.code === 'string') {
        errorCode = dataObj.code;
      }
      if (dataObj.errors || dataObj.details) {
        errorDetails = dataObj.errors || dataObj.details;
      }
    }

    throw new ApiClientError(errorMessage, response.status, errorCode, errorDetails, responseData);
  }

  if (schema && responseData !== null) {
    return schema.parse(responseData);
  }

  return responseData as T;
}

function mergeHeaders(base: Record<string, string>, extra?: HeadersInit): HeadersInit {
  if (!extra) return base;
  if (extra instanceof Headers) {
    const merged = new Headers(base);
    extra.forEach((value, key) => merged.set(key, value));
    return merged;
  }
  if (Array.isArray(extra)) {
    const merged = new Headers(base);
    extra.forEach(([key, value]) => merged.set(key, value));
    return merged;
  }
  return { ...base, ...extra };
}

export const httpClient = {
  async get<T>(path: string, options?: RequestOptions<T>): Promise<T> {
    const url = buildUrl(path, options?.params);
    const { params: _p, schema, headers, ...rest } = options || {};

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: mergeHeaders({ Accept: 'application/json' }, headers),
        ...rest,
      });

      return await handleResponse<T>(response, schema);
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'NETWORK_ERROR',
      );
    }
  },

  async post<T>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T> {
    const url = buildUrl(path, options?.params);
    const { params: _p, schema, headers, ...rest } = options || {};

    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: mergeHeaders(
          {
            Accept: 'application/json',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          },
          headers,
        ),
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
        ...rest,
      });

      return await handleResponse<T>(response, schema);
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'NETWORK_ERROR',
      );
    }
  },

  async patch<T>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T> {
    const url = buildUrl(path, options?.params);
    const { params: _p, schema, headers, ...rest } = options || {};

    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const response = await fetch(url, {
        method: 'PATCH',
        credentials: 'include',
        headers: mergeHeaders(
          {
            Accept: 'application/json',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          },
          headers,
        ),
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
        ...rest,
      });

      return await handleResponse<T>(response, schema);
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'NETWORK_ERROR',
      );
    }
  },

  async put<T>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T> {
    const url = buildUrl(path, options?.params);
    const { params: _p, schema, headers, ...rest } = options || {};

    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: mergeHeaders(
          {
            Accept: 'application/json',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          },
          headers,
        ),
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
        ...rest,
      });

      return await handleResponse<T>(response, schema);
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'NETWORK_ERROR',
      );
    }
  },

  async delete<T>(path: string, options?: RequestOptions<T>): Promise<T> {
    const url = buildUrl(path, options?.params);
    const { params: _p, schema, headers, ...rest } = options || {};

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: mergeHeaders({ Accept: 'application/json' }, headers),
        ...rest,
      });

      return await handleResponse<T>(response, schema);
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'NETWORK_ERROR',
      );
    }
  },
};
