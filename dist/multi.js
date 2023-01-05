"use strict";
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
const child_process = require('child_process');
const server = require('./server');
const cluster = require('cluster');
const http = require('http');
const os = require('os');
const { parseBody } = require('./utils');
require('dotenv').config();
const PORT = parseInt(process.env.PORT) || 5000;
if (cluster.isMaster) {
    let current_server = 0;
    const workers = [];
    const servers = [];
    const ports = [];
    const CPUS = os.cpus().length;
    for (let i = 1; i < CPUS + 1; i++) {
        servers.push(`http://localhost:${PORT + i}`);
        ports.push(PORT + i);
    }
    for (let i = 0; i < CPUS; i++) {
        const worker = cluster.fork();
        workers.push(worker);
    }
    // Worker sends update data -> master sends update data to all workers
    workers.forEach((w) => {
        w.on('message', (data) => {
            const workerData = JSON.parse(data);
            if (workerData.action === 'set') {
                process.stdout.write(`\nUpdate message came from worker ${w.pid}\n`);
                workers.forEach(w => w.send(JSON.stringify({ users: workerData.value })));
            }
        });
    });
    // Master server on {PORT}
    const masterServer = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.setHeader('Content-Type', 'application/json');
        const body = req.method === 'POST' || req.method === 'PUT' ? yield parseBody(req) : {};
        const requestData = JSON.stringify(body);
        const loadServer = servers[current_server];
        current_server === (servers.length - 1) ? current_server = 0 : current_server++;
        const destination = `${loadServer}${req.url}`;
        process.stdout.write(`\nSending request to [${req.method}] ${destination}\n`);
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
        const request = http.request(options, (response) => __awaiter(void 0, void 0, void 0, function* () {
            response.setEncoding('utf8');
            res.statusCode = response.statusCode;
            if (response.statusCode == 204) {
                res.end();
            }
            response.on('data', (chunk) => {
                res.end(chunk);
            });
        }));
        if (req.method !== 'GET') {
            request.write(requestData);
        }
        request.end();
    }));
    masterServer.listen(PORT, '127.0.0.1', () => {
        console.log(`\nMaster pid: ${process.pid} started on port ${PORT}`);
    });
}
else {
    const worker_id = parseInt(cluster.worker.id);
    const CHILD_PORT = PORT + worker_id;
    const app = server.app();
    app.listen(CHILD_PORT, '127.0.0.1', () => {
        console.log(`\nServer pid: ${process.pid} started on port ${CHILD_PORT}`);
    });
}
