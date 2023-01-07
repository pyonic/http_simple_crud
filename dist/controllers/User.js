"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDB = void 0;
const crypto = __importStar(require("crypto"));
const cluster_1 = __importDefault(require("cluster"));
const db_1 = require("./db");
class UserDB {
    constructor(users) {
        this._users_database = [];
        this._users_database = users;
    }
    setUsers(users) {
        this._users_database = users;
    }
    getAll() {
        return this._users_database;
    }
    getOne(uid) {
        return this._users_database.find(u => u.id === uid);
    }
    updateOne(uid, data) {
        this._users_database = this._users_database.map(u => {
            if (u.id === uid) {
                if (data.username)
                    u.username = data.username;
                if (data.age)
                    u.age = data.age;
                if (data.hobbies)
                    u.hobbies = data.hobbies;
            }
            return u;
        });
        cluster_1.default.isWorker && (0, db_1.setData)('users', this._users_database);
        return this.getOne(uid);
    }
    deleteOne(uid) {
        this._users_database = this._users_database.filter(u => u.id !== uid).map(user => user);
        cluster_1.default.isWorker && (0, db_1.setData)('users', this._users_database);
    }
    insertUser(data) {
        data.id = crypto.randomUUID();
        this._users_database.push(data);
        cluster_1.default.isWorker && (0, db_1.setData)('users', this._users_database);
    }
    getSerializedUsers() {
        return JSON.stringify({ data: this._users_database });
    }
}
exports.UserDB = UserDB;
