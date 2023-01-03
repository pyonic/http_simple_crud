const cluster = require('cluster');
const child_process = require('child_process')
const os = require('os');

const PORT = process.env.PORT || 5000;


if (cluster.isMaster) {
    // Hand made InMemory Redis server
    child_process.fork('./redis');

    
    const CPUS = os.cpus().length - 1;
    const workers = [];
    
    for (let i = 0; i < CPUS; i++) {
        const worker = cluster.fork();
        workers.push(worker);
    }
    
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
} else {
    const server = require('./server');
    const app = server.app();
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`\nServer pid: ${process.pid} started on port ${PORT}`);
    })
}
    