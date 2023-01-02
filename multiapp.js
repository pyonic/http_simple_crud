const server = require("./server");
const os = require('os');
const cluster = require('cluster');

const PORT = process.env.PORT || 5000;

const CPUS_LENGTH = os.cpus().length;

let users_list = [
    {
        id: '123e4567-e89b-12d3-a456-426655440000',
        username: 'Tommy',
        age: 20,
        hobbies: ['chess', 'books']
    }
];


const workerHandler = (worker, data) => {
    if (data.action === 'get_users') {
        console.log('1');
        worker.send({label: data.action, users: users_list, pid: worker.process.pid})
    } else if (data.action === 'get_single_user') {
        const userId = data.userId;
        worker.send({label: data.action, user: users_list.find(u => u.id === userId) || null, pid: worker.process.pid});
    } else if (data.action === 'delete_user' ) {
        const userId = data.userId;
        users_list = users_list.filter(u => u.id !== userId).map(u => u)
    } else if (data.action === 'update_user') {
        const userId = data.userId;
        const newData = data.updateData;
        console.log(users_list.find(u => u.id === userId));
        if (!users_list.find(u => u.id === userId)) {
            worker.send({label: data.action, success: false, pid: worker.process.pid});
        } else {
            users_list = users_list.map(u => {
                if (u.id === userId) {
                    u = { ...u, ...newData }
                }
                return u;
            })
            worker.send({label: data.action, success: true, pid: worker.process.pid})
        }
    } else if (data.action === 'insert_user') {
        const newUser = data.user;
        users_list.push(newUser);
        worker.send({ label: 'insert_user', users: users_list, pid: worker.process.pid })
    }
}

if (cluster.isPrimary) {
    console.log(process.pid);
    for (let i = 0; i < CPUS_LENGTH; i++) {
        const worker = cluster.fork();
        worker.on('message', (data) => workerHandler(worker, data))
    } 

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        const newWorker = cluster.fork();
        newWorker.on('message', (data) => workerHandler(newWorker, data))
      });
} else {
    server.app().listen(PORT, '127.0.0.1', () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
    })
}


