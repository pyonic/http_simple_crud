const USER_UUID_MATCHER = /^[/](users)[/]([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/;
const GET_USER_MATCHER = /^[/](users)[/]\w+/;
const API_ROUTE_MATCHER = /[/](api)[/]/;
const USERS_ROUTE_MATCHER = /[/](users)[/]?$/;

// Errors

module.exports = {
    USER_UUID_MATCHER,
    GET_USER_MATCHER,
    API_ROUTE_MATCHER,
    USERS_ROUTE_MATCHER
}