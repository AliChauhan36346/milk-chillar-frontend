//src/lib/api/employees.ts
import { api } from './api';

export type Employee = {
    employeeId: number;
    fullName: string;
    designation: string;
    contactNumber: string;
    salary: number;
    isActive: boolean;
    chillarId?: number;
    chillarName?: string;
};

export interface PagedEmployeeResponse {
    items: Employee[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export const getEmployees = async (): Promise<Employee[]> => {
    const response = await api.get('/Employees/all');
    return response.data;
};

export const getPagedEmployees = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    tenantId?: number,
    search?: string,
    isActive?: boolean
): Promise<PagedEmployeeResponse> => {
    try {
        const params = new URLSearchParams();
        params.append('PageNumber', pageNumber.toString());
        params.append('PageSize', pageSize.toString());
        if (tenantId) params.append('TenantId', tenantId.toString());
        if (search) params.append('Search', search);
        if (isActive !== undefined) params.append('IsActive', isActive.toString());

        const response = await api.get(`/Employees/paged?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

// Fixed: Removed /api prefix to match other endpoints
export const getEmployeeById = async (id: number): Promise<Employee> => {
    const response = await api.get(`/Employees/${id}`);
    return response.data;
};

export const updateEmployee = async (id: number, employee: Employee): Promise<void> => {
    try {
        await api.put(`/Employees/${id}`, employee);
    } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
    }
};

export const deleteEmployee = async (id: number): Promise<void> => {
    try {
        await api.delete(`/Employees/${id}`);
    } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
};

export const createEmployee = async (employee: Omit<Employee, 'employeeId'>): Promise<void> => {
    try {
        await api.post('/Employees', {
            ...employee,
            isActive: true, // ensure isActive is set
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
};