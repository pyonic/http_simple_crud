import { IUser } from "./User";

interface WorkerMessage {
    users: Array<IUser>,
    data: Object
}

export { WorkerMessage }