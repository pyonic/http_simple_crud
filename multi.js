const child_process = require('child_process');
const server = require('./server');
const cluster = require('cluster');
const http = require('http');
const os = require('os');
const { parseBody } = require('./utils');

require('dotenv').config()

const PORT = parseInt(process.env.PORT) || 5000;

if (cluster.isMaster) {
    // Fork the hand made InMemory Redis server
    child_process.fork('./redis');
    let current_server = 0;
    const workers = [];
    const servers = [];
    const ports = [];
    
    const CPUS = os.cpus().length;
    for (let i = 1; i < CPUS + 1; i++) {
        servers.push(`http://localhost:${PORT + i}`)
        ports.push(PORT + i)
    }

    
    for (let i = 0; i < CPUS; i++) {
        const worker = cluster.fork();
        workers.push(worker);
    }
    
    // InMemory(redis) sends update info to master and master send this update to all workers
    const { getSocket } = require('./controllers/db');
    getSocket().on('data', (data) => {
        process.stdout.write(`Message came to process ${process.pid} - ${data.toString() } \n`);
        const socketData = JSON.parse(data.toString());
        console.log(socketData);
        if ( socketData.set ) {
            const users = socketData.data;
            workers.forEach(w => w.send(JSON.stringify({ users })));
        }
    });

    // Master server on {PORT}
    const server = http.createServer(async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        const body = req.method === 'POST' || req.method === 'PUT' ? await parseBody(req) : {};
        const requestData = JSON.stringify(body);
        const loadServer = servers[current_server];
        current_server === (servers.length - 1) ? current_server = 0 : current_server++;
        const destination = `${loadServer}${req.url}`

        process.stdout.write(`\nSending request to [${req.method}] ${destination}\n`)

        const options = {
            hostname: '127.0.0.1',
            port: ports[current_server],
            path: req.url,
            method: req.method,
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(requestData),
            },
        };

        const request = http.request(options, async (response) => {
            response.setEncoding('utf8');
            res.statusCode = response.statusCode;
            if (response.statusCode == 204) {
                res.end()
            }
            response.on('data', (chunk) => {
              res.end(chunk);
            });
        });
        
        if (req.method !== 'GET') {
            request.write(requestData);
        }
        
        request.end();
    });

    server.listen(PORT, '127.0.0.1', () => {
        console.log(`\nMaster pid: ${process.pid} started on port ${PORT}`);
    })
} else {
    const worker_id = parseInt(cluster.worker.id);
    const CHILD_PORT = parseInt(PORT) + worker_id;
    const app = server.app();
    app.listen(CHILD_PORT, '127.0.0.1', () => {
        console.log(`\nServer pid: ${process.pid} started on port ${CHILD_PORT}`);
    })
}
    