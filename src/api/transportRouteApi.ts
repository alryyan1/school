// src/api/transportRouteApi.ts
import axiosClient from '../axios-client';
import { TransportRoute, TransportRouteFormData } from '@/types/transportRoute';

type CollectionResponse = { data: TransportRoute[] };
type ResourceResponse = { data: TransportRoute };

export const TransportRouteApi = {
    getAll: (filters: { school_id: number }) =>
        axiosClient.get<CollectionResponse>('/transport-routes', { params: filters }),
    create: (data: TransportRouteFormData) =>
        axiosClient.post<ResourceResponse>('/transport-routes', data),
    update: (id: number, data: Partial<TransportRouteFormData>) =>
        axiosClient.put<ResourceResponse>(`/transport-routes/${id}`, data),
    delete: (id: number) => axiosClient.delete(`/transport-routes/${id}`),
};