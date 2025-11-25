// src/api/databaseBackupApi.ts
import axiosClient from "../axios-client";

export interface BackupFile {
  path: string;
  size: number;
  size_human: string;
  date: string;
  age: string;
}

export interface BackupResponse {
  success: boolean;
  message?: string;
  backup?: {
    path: string;
    size: number;
    date: string;
  };
  backups?: BackupFile[];
}

export const DatabaseBackupApi = {
  create: () =>
    axiosClient.post<BackupResponse>("/database-backup/create"),

  list: () =>
    axiosClient.get<BackupResponse>("/database-backup/list"),

  download: (path: string) =>
    axiosClient.get(`/database-backup/download?path=${encodeURIComponent(path)}`, {
      responseType: 'blob',
    }),

  delete: (path: string) =>
    axiosClient.delete<BackupResponse>("/database-backup/delete", {
      data: { path },
    }),
};

