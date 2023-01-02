const http = require('http');
const crypto = require('crypto');
const cluster = require('cluster');

const { USER_UUID_MATCHER, GET_USER_MATCHER, API_ROUTE_MATCHER, USERS_ROUTE_MATCHER } = require('./constants');
const { validateUser } = require('./utils/validators');

const setNotFound = (res) => res.statusCode = 404;
const setJsonResponse = (res) => res.setHeader('Content-Type', 'application/json');
const setStatus = (res, status) =>  res.statusCode = status;

const users = [
    {
        id: '123e4567-e89b-12d3-a456-426655440000',
        username: 'Andy',
        age: 20,
        hobbies: ['chess', 'books']
    }
];

const parseBody = async (req) => {
    return new Promise((resolve, reject) => {
        const body = [];
        req.on('data', (chunk) => body.push(chunk));
        req.on('end', () => {
            const reqBody = Buffer.concat(body).toString();
            let requestData = {}

            try {
                requestData = JSON.parse(reqBody)
            } catch (error) {
                resolve(null);
            }
            
            resolve(requestData);
        })
    });
}

const app = (users) => {
    process.stdout.write(`Server created - ${process.pid}\n`)

    const server = http.createServer(async (req, res) => {
        process.stdout.write(`Request handled - ${process.pid}`)
        let url = req.url;
        const method = req.method;
    
        process.stdout.write(`[INFO] REQUEST ${method} --> '${url}'\n`);
    
        setJsonResponse(res);
        
        if (url.match(API_ROUTE_MATCHER) === null) {
            setNotFound(res);
            res.end(JSON.stringify({ error: 'Not found' }));
            return;
        } else {
            url = url.replace('/api', '');
        }
    
        if ((userData = url.match(GET_USER_MATCHER)) && method === 'GET') {
            const user_matchers = url.match(USER_UUID_MATCHER);
            const uid = user_matchers[2];

            if (!user_matchers) {
                setStatus(res, 400)
                res.end(JSON.stringify({ error: 'Incorrect User ID'}))
                return;
            }
            
            if (cluster.isWorker) {
                process.send({action: 'get_single_user', userId: uid})
                process.on('message', (data) => {
                    if (data.label === 'get_single_user' && data.pid === process.pid) {
                        if (!data) setNotFound(res);
                        res.end(JSON.stringify({ data: data.user || null }))
                    }
                })
            } else {
                const data = users.find(u => u.id === uid);
                if (!data) setNotFound(res);   
                res.end(JSON.stringify({ data: data || null }))
            }

        } else if (url.match(USERS_ROUTE_MATCHER) && method == 'GET') {
            if (cluster.isWorker) {
                process.send({action: 'get_users'});
                process.on('message', (data) => {
                    if (data.label === 'get_users' && data.pid === process.pid) {
                        console.log(data.pid, 'get_users');
                        res.end(JSON.stringify({data: data.users || []}));
                        process.exit()
                    }
                })
            } else {
                res.end(JSON.stringify({ data: users }))
            }
        } else if ((userData = url.match(GET_USER_MATCHER)) && method === 'PUT') {
            const userId = url.match(USER_UUID_MATCHER);
            const uuid = userId[2];

            if (!userId) {
                setStatus(res, 400)
                res.end(JSON.stringify({ error: 'Incorrect User ID'}))
                return;
            }
    
            const body = await parseBody(req);
    
            const updateData = body ? body.data : {};
           
            // If process is worker
            if (cluster.isWorker) {
                process.send({action: 'update_user', userId: uuid, updateData});
                process.on('message', (data) => {
                    if (data.label === 'update_user' && data.pid == process.pid) {
                        console.log(data, process.pid);
                        if (data.status) {
                            setNotFound(res)
                            res.end(JSON.stringify({ error: 'User not found'}));
                        } else {
                            setStatus(res, 200);
                            res.end(JSON.stringify({ success: true }));
                        };
                    }
                })
            } else {
                const user = users.find(u => u.id === userId[2]);
                
                if (!user) {
                    setNotFound(res);
                    res.end(JSON.stringify({ error: 'User not found'}));
                    return;
                }
        
                else {
                    users = users.map(u => {
                        if (u.id === userId[2]) {
                            return { ...u, ...updateData}
                        }
                        u = { ...u, ...updateData}
                        console.log(u);
                    });
                }
        
                setStatus(res, 200);
                
                res.end(JSON.stringify({
                    users
                }))
            }
        } else if (url.match(USERS_ROUTE_MATCHER) && method == 'POST') {
            const requestBody = await parseBody(req);
    
            if (!requestBody.data) {
                setStatus(res, 400);
                res.end(JSON.stringify({ error: 'Data required'}));
                return;
            }
            
            if (validateUser(requestBody.data)) {
                const userId = crypto.randomUUID();
    
                const newUser = {
                    id: userId,
                    ...requestBody.data
                }

                setStatus(res, 201);

                if (cluster.isWorker) {
                    process.send({action: 'insert_user', user: newUser});
                    process.on('message', (data) => {
                        if (data.label === 'insert_user' && data.pid === process.pid) {
                            const users = data.users;
                            res.end(JSON.stringify({
                                users: users
                            }))
                        }
                    })
                } else {
                    users.push(newUser);
                    res.end(JSON.stringify({
                        users
                    }))
                }
            } else {
                setStatus(res, 400);
                res.end(JSON.stringify({
                    error: 'Please fill all required data {username: str, age: number, hobbies: array->string }'
                }))
            }
        } else if ((userData = url.match(GET_USER_MATCHER)) && method === 'DELETE') {
            const userId = url.match(USER_UUID_MATCHER);
            
            if (!userId) {
                setStatus(res, 400)
                res.end(JSON.stringify({ error: 'Incorrect User ID'}))
                return;
            }
            console.log(users.find(u => u.id === userId[2]));
            console.log(userId[2]);
            if (!users.find(u => u.id === userId[2])) {
                setNotFound(res);
                res.end(JSON.stringify({ error: 'User not found'}))
                return;
            }
    
    
            users = users.filter(u => u.id !== userId[2]).map(u => u);
            console.log(users);
            setStatus(res, 204);
            res.end();
        } else {
            setNotFound(res);
            res.end(JSON.stringify({error: 'Requested url not found'}))
        }
    });

    return server;
}

module.exports = {
    app: (dataset = users) => app(dataset)
}