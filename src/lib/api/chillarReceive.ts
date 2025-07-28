// src/lib/api/chillarReceive.ts
import { api } from './api';

export interface ChillarReceiveDto {
  receiveId: number;
  date: string;            // “YYYY‑MM‑DD”
  timeOfDay: 'morning' | 'evening';
  chillarName: string;
  inchargeName: string;
  dodhiName: string;
  dodhiID: number;
  grossLiters: number;
  lr?: number;
  fat?: number;
  netLiters: number;
}

export interface DodhiSimple {
  dodhiId: number;
  fullName: string;
}

export interface ChillarReceiveMetadata {
  chillarId: number;
  chillarInchargeId: number;
  remainingDodhis: DodhiSimple[];
  addedDodhis: ChillarReceiveDto[];
}

export interface CreateChillarReceiveRequest {
  date: string;            // “YYYY‑MM‑DD”
  timeOfDay: 'morning' | 'evening';
  chillarId: number;
  chillarInchargeId: number;
  dodhiId: number;
  grossLiters: number;
  lr?: number;
  fat?: number;
  netLiters: number;
}

// 1. Get the current employee’s chillar & incharge
export const getMyChillar = async () => {
  const resp = await api.get<{ chillarId: number; chillarInchargeId: number }>('/employees/me');
  return resp.data;
};

// 2. Get metadata (remaining + added) for a given date/time
export const getChillarReceiveMetadata = async (
  date: string,
  timeOfDay: 'morning'|'evening'
) => {
  const resp = await api.get<ChillarReceiveMetadata>(`/ChillarReceive/metadata?date=${date}&time=${timeOfDay}`);
  return resp.data;
};

// 3. Create a new receive entry
export const createChillarReceive = async (data: CreateChillarReceiveRequest) => {
  const resp = await api.post<ChillarReceiveDto>('/ChillarReceive', data);
  return resp.data;
};

// 4. Update an existing entry
export const updateChillarReceive = async (
  id: number,
  data: CreateChillarReceiveRequest
) => {
  const resp = await api.put<ChillarReceiveDto>(`/ChillarReceive/${id}`, data);
  return resp.data;
};
