export interface User {
    id: number,
    username: string,
    password: string,
    last_activity: number,
    email: string,
    birthday: number,
    services: {[key: string ]: string},
    registerService(key: string);
    unregisterService(key: string);
}