import { api } from './api';

export type Employee = {
    employeeId: number;
    fullName: string;
    designation: string;
    contactNumber: string;
    salary: number;
    isActive: boolean;
};

export const getEmployees = async (): Promise<Employee[]> => {
    const response = await api.get('/Employees/all');
    return response.data;
}; 