import type { ApiResponse } from './api';
import { getRequest } from './api';
import type { Birthday, BirthDayType } from '../types/portal';

interface BirthdayListResponse {
    birthdays: Birthday[];
}

interface TelegramLinkResponse {
    telegram_link: string;
}

export const getBirthdays = async (time_unit: BirthDayType = 'month'): Promise<BirthdayListResponse> => {
    const response =  await getRequest<BirthdayListResponse>(`/api/v1/birthday/upcoming?time_unit=${time_unit}`);
    console.log('Birthdays response:', response);
    return response.data;
}

export const getBirthdayTelegramLink = async (eid: number, message: string): Promise<ApiResponse<TelegramLinkResponse>> => {
    return await getRequest<TelegramLinkResponse>(`/api/v1/birthday/link`, { eid, message });
}