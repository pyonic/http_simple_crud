const crypto = require('crypto');

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

        return this.getOne(uid);
    }

    deleteOne (uid) {
        this._users_database = this._users_database.filter(u => u.id !== uid).map(user => user);
    }

    insertUser (data) {
        if (!data.id) data.id = crypto.randomUUID();
        this._users_database.push(data);
    }

    getSerializedUsers () {
        return JSON.stringify({ data: this._users_database })
    }
}


module.exports = new UserDB([]);