// src/lib/api/chillar.ts

import { api } from './api';

export interface Chillar {
    chillarId: number;
    name: string;
    location: string;
    numberOfChillars: number;
    capacity: number;
}

export const getChillars = async (): Promise<Chillar[]> => {
    const response = await api.get('/Chillar');
    return response.data;
};
