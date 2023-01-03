const crypto = require('crypto');
const cluster = require('cluster');

let setData = () => true;

if (cluster.isWorker) {
    setData = require('./db').setData;
}

class UserDB {

    constructor (users) {
        this._users_database = users;
    }

    setUsers (users) {
        this._users_database = users;
    }

    getAll () {
        return this._users_database;
    }

    getOne (uid) {
        return this._users_database.find(u => u.id === uid);
    }

    updateOne (uid, data) {
        this._users_database = this._users_database.map(u => {
            if (u.id === uid) {
                u = { ...u, ...data }
            }
            return u
        })

        cluster.isWorker && setData('users', this._users_database);
        
        return this.getOne(uid);
    }

    deleteOne (uid) {
        this._users_database = this._users_database.filter(u => u.id !== uid).map(user => user);
        cluster.isWorker && setData('users', this._users_database);
    }

    insertUser (data) {
        if (!data.id) data.id = crypto.randomUUID();
        this._users_database.push(data);
        cluster.isWorker && setData('users', this._users_database);
    }

    getSerializedUsers () {
        return JSON.stringify({ data: this._users_database })
    }
}

module.exports = new UserDB([]);