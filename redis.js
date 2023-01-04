const net = require('net');

const inMemoryDb = {};
const clients = [];
const server = net.createServer(socket => {
    clients.push(socket);
    process.stdout.write('\n[IN_MEMORY_SERVER]: Client connected to socket\n')
    socket.on('error', (e) => {
        console.log('[IN_MEMORY_SERVER]: ', e);
    })
    socket.on('data', (d) => {
        const data = JSON.parse(d.toString());
        console.log('data: ', data);
        const { action, key, value } = data;
        if (action === 'set') {
            if (!key || !value) {
                socket.write(JSON.stringify({ set: false, error: 'no-key-value' }))
            } else {
                inMemoryDb[key] = value;
                console.log('[IN_MEMORY_SERVER]: Sent data to listeners');
                clients.forEach(c => {
                    c.write(JSON.stringify({ set: true, data: inMemoryDb[key] }))
                })
            }
        } else if (action === 'get') {
            if (!key) {
                socket.write(JSON.stringify({ get: false, error: 'no-key' }))
            } else {
                const data = inMemoryDb[key];
                socket.write(JSON.stringify({ get: true, key, data }))
            }
        }
    });
});


server.listen(2020, () => {
    process.stdout.write('\n[IN_MEMORY_SERVER]: Server bounded on 127.0.0.1:2020 \n')
});

server.on('error', (e) => {
    console.log('[IN_MEMORY_SERVER]: ',e);
})