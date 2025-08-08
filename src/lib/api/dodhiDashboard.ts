// lib/api/dashboard.ts
import { api } from './api';

export interface DodhiDashboardStats {
  totalPurchaseLiters: number;
  totalReceivedLiters: number;
}

export interface DashboardStatsParams {
  startDate: string;
  endDate: string;
  timeOfDay?: string;
  dodhiId: number;
  chillarId?: number;
}

// lib/api/dodhiDashboard.ts
export const fetchMyDodhiId = async (): Promise<number> => {
  try {
    const response = await api.get('/Purchase/mydodhi'); // Remove /api prefix
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dodhi ID:', error);
    throw new Error('Failed to fetch your dodhi information');
  }
};

export const fetchDodhiDashboardStats = async (params: DashboardStatsParams): Promise<DodhiDashboardStats> => {
  try {
    const queryParams = new URLSearchParams({
      StartDate: params.startDate,
      EndDate: params.endDate,
      DodhiId: params.dodhiId.toString(),
      ...(params.timeOfDay && { TimeOfDay: params.timeOfDay }),
      ...(params.chillarId && { ChillarId: params.chillarId.toString() })
    });

    const response = await api.get(`/DashboardStats/DodhiDashboardStats?${queryParams.toString()}`); // Remove /api prefix
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dodhi dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};