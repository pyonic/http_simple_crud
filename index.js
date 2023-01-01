const server = require("./server");

const PORT = process.env.PORT || 5000;

server.app().listen(PORT, '127.0.0.1', () => {
    console.log(`Server started on port ${PORT}`);
})

