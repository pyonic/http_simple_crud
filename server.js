const http = require('http');
const crypto = require('crypto');
const UserDB = require('./controllers/User');

const { USER_UUID_MATCHER, GET_USER_MATCHER, USERS_ROUTE_MATCHER, HTTP_METHODS } = require('./constants');
const { validateUser } = require('./utils/validators');
const { serializer, parseBody } = require('./utils');

const setJsonResponse = (res) => res.setHeader('Content-Type', 'application/json');

const requestHandler = async (req, res) => {
    const method = req.method;
    let responseStatus;
    let url = req.url;
    let response;

    process.stdout.write(`[INFO] REQUEST ${method} --> '${url}'\n`);

    setJsonResponse(res);
    
    url = url.replace('/api', '');

    if ((userData = url.match(GET_USER_MATCHER)) && method === HTTP_METHODS.get) {
        const user = url.match(USER_UUID_MATCHER);
        
        if (!user) {
            responseStatus = 400;
            response = JSON.stringify({ error: 'Incorrect User ID'});
        } else {
            const uuid = user[2];
            const data = UserDB.getOne(uuid);
            if (!data) responseStatus = 404; 
            else responseStatus = 200   
            response = JSON.stringify({ data: data || [] });
        }

    } else if (url.match(USERS_ROUTE_MATCHER) && method == HTTP_METHODS.get) {
        
        responseStatus = 200;
        response = serializer({data: UserDB.getAll()});
    
    } else if ((userData = url.match(GET_USER_MATCHER)) && method === HTTP_METHODS.put) {
        const userId = url.match(USER_UUID_MATCHER);
        
        if (!userId) {
            responseStatus = 400;
            response = JSON.stringify({ error: 'Incorrect User ID'});
        } else {
            const uuid = userId[2];
            const user = UserDB.getOne(uuid);

            if (!user) {
                responseStatus = 404;
                response = JSON.stringify({ error: 'User not found'});
            } else {
                const body = await parseBody(req);

                const updateData = body ? body.data : {};
    
                const user = UserDB.updateOne(uuid, updateData)
                
                responseStatus = 200;
                response = serializer({data: user});
            }
        }

    } else if (url.match(USERS_ROUTE_MATCHER) && method === HTTP_METHODS.post) {
        const requestBody = await parseBody(req);

        if (!requestBody.data) {
            responseStatus = 404;
            response = JSON.stringify({ error: 'Data required'});
        }
        
        if (validateUser(requestBody.data)) {
            const userId = crypto.randomUUID();

            const newUser = {
                id: userId,
                ...requestBody.data
            }
            
            UserDB.insertUser(newUser);

            responseStatus = 201;

            response = UserDB.getSerializedUsers();
        } else {
            responseStatus = 400;
            response = JSON.stringify({
                error: 'Please fill all required data {username: str, age: number, hobbies: array->string }'
            });
        }
    } else if ((userData = url.match(GET_USER_MATCHER)) && method === HTTP_METHODS.delete) {
        const userId = url.match(USER_UUID_MATCHER);
        
        if (!userId) {
            responseStatus = 400;
            response = JSON.stringify({ error: 'Incorrect User ID'});
        } else {
            const uuid = userId[2];

            if (!UserDB.getOne(uuid)) {
                responseStatus = 404;
                response = JSON.stringify({ error: 'User not found'});
            } else {
                UserDB.deleteOne(uuid);
                responseStatus = 204;
            }
        }
    } else {
        responseStatus = 404;
        response = JSON.stringify({error: 'Requested url not found'});
    }

    return { response, status: responseStatus }
}

const app = (users = []) => {
    if (users.length) UserDB.setUsers(users);

    const server = http.createServer(async (req, res) => {
        try {
            const data = await requestHandler(req, res);
            console.log(data);
            if (!data.status) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not found' }));
            } else {
                res.statusCode = data.status;
                res.end(data.response);
            }
        } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message || 'Unexpected error' }));
        }
    });
    
    return server;
}

module.exports = {
    app
}