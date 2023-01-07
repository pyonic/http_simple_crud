import * as dotenv from 'dotenv';
import cluster from 'cluster';
import * as http from 'http';
import os from 'os';

import { HTTP_METHODS } from './constants';
import { app as ServerApp } from './server';
import { parseBody } from './utils';

dotenv.config({ path: __dirname + '/.env'})

const PORT: number = parseInt(process.env.PORT!) || 5000;

if (cluster.isPrimary) {
    let current_server: number = 0;
    const workers: Array<any> = [];
    const servers: string[] = [];
    const ports: number[] = [];
    
    const CPUS = os.cpus().length;
    for (let i = 1; i < CPUS + 1; i++) {
        servers.push(`http://localhost:${PORT + i}`)
        ports.push(PORT + i)
    }

    
    for (let i = 0; i < CPUS; i++) {
        const worker = cluster.fork();
        workers.push(worker);
    }

    // Worker sends update data -> master sends update data to all workers
    workers.forEach((w) => {
        w.on('message', (data: string) => {
            const workerData = JSON.parse(data);
            if (workerData.action === 'set') {
                workers.forEach(w => w.send(JSON.stringify({ users: workerData.value })));
            }
        })
    })
    
    // Master server on {PORT}
    const masterServer = http.createServer(async (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        
        const body = req.method === HTTP_METHODS.post || req.method === HTTP_METHODS.put ? await parseBody(req) : {};
        const requestData = JSON.stringify(body);

        current_server === (servers.length - 1) ? current_server = 0 : current_server++;
        
        const destination = `${servers[current_server]}${req.url}`

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

        const request = http.request(options, async (response: any) => {
            response.setEncoding('utf8');
            res.statusCode = response.statusCode;
            if (response.statusCode == 204) {
                res.end()
            }
            response.on('data', (chunk: any) => {
              res.end(chunk);
            });
        });
        
        if (req.method !== HTTP_METHODS.get) {
            request.write(requestData);
        }
        
        request.end();
    });

    masterServer.listen(PORT, '127.0.0.1', () => {
        console.log(`\nMaster pid: ${process.pid} started on port ${PORT}`);
    })
} else {
    // @ts-ignore
    const worker_id: number = parseInt(cluster.worker.id);
    const CHILD_PORT: number = PORT + worker_id;
    const app: http.Server = ServerApp();
    app.listen(CHILD_PORT, '127.0.0.1', () => {
        console.log(`\nServer pid: ${process.pid} started on port ${CHILD_PORT}`);
    })
}
    