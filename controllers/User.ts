import * as crypto from 'crypto';
import cluster from 'cluster';

import { setData } from './db';

interface User {
    id?: string,
    username: string,
    age:  number,
    hobbies: Array<string>
}

class UserDB {
    _users_database: Array<User> = [];

    constructor (users: Array<User>) {
        this._users_database = users;
    }

    setUsers (users: Array<User>) {
        this._users_database = users;
    }

    getAll () {
        return this._users_database;
    }

    getOne (uid: string) {
        return this._users_database.find(u => u.id === uid);
    }

    updateOne (uid: string, data: User) {
        this._users_database = this._users_database.map(u => {
            if (u.id === uid) {
                if (data.username) u.username = data.username;
                if (data.age) u.age = data.age;
                if (data.hobbies) u.hobbies = data.hobbies;
            }
            return u
        })

        cluster.isWorker && setData('users', this._users_database);
        
        return this.getOne(uid);
    }

    deleteOne (uid: string) {
        this._users_database = this._users_database.filter(u => u.id !== uid).map(user => user);
        console.log(cluster.isWorker);
        
        cluster.isWorker && setData('users', this._users_database);
    }

    insertUser (data: User) {
        data.id = crypto.randomUUID();
        this._users_database.push(data);
        cluster.isWorker && setData('users', this._users_database);
    }

    getSerializedUsers () {
        return JSON.stringify({ data: this._users_database })
    }
}

export { UserDB, User }