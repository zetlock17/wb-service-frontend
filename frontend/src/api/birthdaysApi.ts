import type { ApiResponse } from './api';
import { getRequest } from './api';
import type { Birthday, BirthDayType } from '../types/portal';

export const getBirthdays = async (time_unit: BirthDayType): Promise<ApiResponse<Birthday[]>> => {
    return await getRequest<Birthday[]>(`/api/v1/birthday/upcoming?time_unit=${time_unit}`);
}