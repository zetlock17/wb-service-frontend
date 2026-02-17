import { postFormRequest } from './api';

// const params = new URLSearchParams({
//   grant_type: 'password',
//   client_id: 'wb-client',
//   client_secret: 'y8ped27zLJ65N3tNoPzkLjzqRrhLYcSc',
//   username: 'petrov.av',
//   password: 'password3',
// });

interface LoginParams {
    grant_type: 'password' | 'refresh_token';
    client_id: string;
    client_secret: string;
    username?: string;
    password?: string;
    refresh_token?: string;
}

export interface LoginResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    not_before_policy?: number;
    session_state?: string;
    scope?: string;
}

export const login = async (login: string, password: string) => {
    const params: LoginParams = {
        grant_type: 'password',
        client_id: 'wb-client',
        client_secret: 'y8ped27zLJ65N3tNoPzkLjzqRrhLYcSc', // брать из окружения потом
        username: login,
        password: password,
    };

    const body = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            body.append(key, String(value));
        }
    });

    return postFormRequest<LoginResponse>(
        'http://localhost:8080/realms/wb-realm/protocol/openid-connect/token',
        body,
        {
            skipAuthRefresh: true,
            skipAuthRedirect: true,
        }
    );
}

export const refreshToken = async (refreshTokenValue: string) => {
    const params: LoginParams = {
        grant_type: 'refresh_token',
        client_id: 'wb-client',
        client_secret: 'y8ped27zLJ65N3tNoPzkLjzqRrhLYcSc', // брать из окружения потом
        refresh_token: refreshTokenValue,
    };

    const body = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            body.append(key, String(value));
        }
    });

    return postFormRequest<LoginResponse>(
        'http://localhost:8080/realms/wb-realm/protocol/openid-connect/token',
        body,
        {
            skipAuthRefresh: true,
            isRefreshRequest: true,
        }
    );
}