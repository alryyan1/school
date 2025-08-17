// src/api/paymentMethodApi.ts
import axiosClient from "../axios-client";
import { PaymentMethod } from "@/types/paymentMethod";

type CollectionResponse = { data: PaymentMethod[] };
type ResourceResponse = { data: PaymentMethod };

export const PaymentMethodApi = {
  getAll: () => axiosClient.get<CollectionResponse>("/payment-methods"),
  create: (payload: { name: string }) => axiosClient.post<ResourceResponse>("/payment-methods", payload),
};


