const net = require('net');

const socket = new net.Socket();

socket.connect({
    port: 2020,
    host: '127.0.0.1'
}, () => {
    process.stdout.write('\nConnected to Redis socket')
});

socket.on('error', (e) => {
    console.log('Client error ', e);
    setTimeout(() => {
        socket.connect({
            port: 2020,
            host: '127.0.0.1'
        }, () => {
            process.stdout.write('Connected to Redis socket \n')
        });
    }, 500)
})

const setData = (key, value) => {
    socket.write(JSON.stringify({ action: 'set', key, value }))
}

const getData = (key) => {
    socket.write(JSON.stringify({ action: 'get', key }))
}

const getSocket = () => socket;

module.exports = {
    setData,
    getData,
    getSocket
}