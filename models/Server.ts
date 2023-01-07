import { IUser } from "./User";

interface ServerResponse {
    data?: Array<IUser> | IUser,
    error?: string,
    message?: string 
}

interface HttpResponse {
    response: ServerResponse,
    status: number
}

export { ServerResponse, HttpResponse }