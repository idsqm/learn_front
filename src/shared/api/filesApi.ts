import axios from 'axios';
import { filesClient, filesBaseURL } from './apiClient';

export type FileKind = 'image' | 'video' | 'document';

interface CreateFileResponse {
  id: number;
  upload_url: string;
  expires_at: string;
}

export async function uploadFile(file: File, kind: FileKind): Promise<{ id: number; downloadUrl: string }> {
  const { data: created } = await filesClient.post<CreateFileResponse>('/files', {
    filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    kind,
  });

  // Presigned S3/MinIO PUT: must be a bare request with only the signed
  // Content-Type header — no baseURL, no Authorization, no JSON default.
  await axios.put(created.upload_url, file, {
    headers: { 'Content-Type': file.type },
  });

  await filesClient.post(`/files/${created.id}/complete`);

  return {
    id: created.id,
    downloadUrl: `${filesBaseURL}/api/v1/files/${created.id}/download`,
  };
}
