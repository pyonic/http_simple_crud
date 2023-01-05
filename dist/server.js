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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const http = __importStar(require("http"));
const crypto = __importStar(require("crypto"));
const User_1 = require("./controllers/User");
const UserDB = new User_1.UserDB([]);
const index_1 = require("./constants/index");
const validators_1 = require("./utils/validators");
const index_2 = require("./utils/index");
process.on('message', (data) => {
    const messageData = JSON.parse(data.toString());
    process.stdout.write(`Updating users on worker ${process.pid}\n`);
    UserDB.setUsers(messageData.users);
});
const setJsonResponse = (res) => res.setHeader('Content-Type', 'application/json');
const requestHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const method = req.method;
    let responseStatus;
    let url = req.url;
    let response;
    process.stdout.write(`[INFO] REQUEST ${method} --> '${url}'\n`);
    setJsonResponse(res);
    url = url.replace('/api', '');
    const userMatched = url.match(index_1.GET_USER_MATCHER);
    const usersRouteMatcher = url.match(index_1.USERS_ROUTE_MATCHER);
    if (userMatched && method === index_1.HTTP_METHODS.get) {
        const user = url.match(index_1.USER_UUID_MATCHER);
        if (!user) {
            responseStatus = 400;
            response = JSON.stringify({ error: 'Incorrect User ID' });
        }
        else {
            const uuid = user[2];
            const data = UserDB.getOne(uuid);
            if (!data)
                responseStatus = 404;
            else
                responseStatus = 200;
            response = JSON.stringify({ data: data || [] });
        }
    }
    else if (usersRouteMatcher && method == index_1.HTTP_METHODS.get) {
        responseStatus = 200;
        response = (0, index_2.serializer)({ data: UserDB.getAll() });
    }
    else if (userMatched && method === index_1.HTTP_METHODS.put) {
        const userId = url.match(index_1.USER_UUID_MATCHER);
        if (!userId) {
            responseStatus = 400;
            response = JSON.stringify({ error: 'Incorrect User ID' });
        }
        else {
            const uuid = userId[2];
            const user = UserDB.getOne(uuid);
            if (!user) {
                responseStatus = 404;
                response = JSON.stringify({ error: 'User not found' });
            }
            else {
                const body = yield (0, index_2.parseBody)(req);
                const updateData = body ? body.data : {};
                const user = UserDB.updateOne(uuid, updateData);
                responseStatus = 200;
                response = (0, index_2.serializer)({ data: user });
            }
        }
    }
    else if (usersRouteMatcher && method === index_1.HTTP_METHODS.post) {
        const requestBody = yield (0, index_2.parseBody)(req);
        if (!requestBody.data) {
            responseStatus = 404;
            response = JSON.stringify({ error: 'Data required' });
        }
        if ((0, validators_1.validateUser)(requestBody.data)) {
            const userId = crypto.randomUUID();
            const newUser = Object.assign({ id: userId }, requestBody.data);
            UserDB.insertUser(newUser);
            responseStatus = 201;
            response = UserDB.getSerializedUsers();
        }
        else {
            responseStatus = 400;
            response = JSON.stringify({
                error: 'Please fill all required data {username: str, age: number, hobbies: array->string }'
            });
        }
    }
    else if (userMatched && method === index_1.HTTP_METHODS.delete) {
        const userId = url.match(index_1.USER_UUID_MATCHER);
        if (!userId) {
            responseStatus = 400;
            response = JSON.stringify({ error: 'Incorrect User ID' });
        }
        else {
            const uuid = userId[2];
            if (!UserDB.getOne(uuid)) {
                responseStatus = 404;
                response = JSON.stringify({ error: 'User not found' });
            }
            else {
                UserDB.deleteOne(uuid);
                responseStatus = 204;
            }
        }
    }
    else {
        responseStatus = 404;
        response = JSON.stringify({ error: 'Requested url not found' });
    }
    return { response, status: responseStatus };
});
const app = (users = []) => {
    if (users.length)
        UserDB.setUsers(users);
    const server = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log(`\nServer started ${process.pid}`);
        try {
            const data = yield requestHandler(req, res);
            console.log(data);
            if (!data.status) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not found' }));
            }
            else {
                res.statusCode = data.status;
                res.end(data.response);
            }
        }
        catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message || 'Unexpected error' }));
        }
    }));
    return server;
};
exports.app = app;
