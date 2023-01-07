"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_METHODS = exports.USERS_ROUTE_MATCHER = exports.API_ROUTE_MATCHER = exports.GET_USER_MATCHER = exports.USER_UUID_MATCHER = void 0;
const USER_UUID_MATCHER = /^[/](users)[/]([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/;
exports.USER_UUID_MATCHER = USER_UUID_MATCHER;
const GET_USER_MATCHER = /^[/](users)[/]\w+/;
exports.GET_USER_MATCHER = GET_USER_MATCHER;
const API_ROUTE_MATCHER = /[/](api)[/]/;
exports.API_ROUTE_MATCHER = API_ROUTE_MATCHER;
const USERS_ROUTE_MATCHER = /[/](users)[/]?$/;
exports.USERS_ROUTE_MATCHER = USERS_ROUTE_MATCHER;
const HTTP_METHODS = {
    get: 'GET',
    put: 'PUT',
    post: 'POST',
    delete: 'DELETE'
};
exports.HTTP_METHODS = HTTP_METHODS;
