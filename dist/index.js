"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
require('dotenv').config();
const PORT = parseInt(process.env.PORT, 10) || 5000;
(0, server_1.app)().listen(PORT, '127.0.0.1', () => {
    console.log(`Server started on port ${PORT}`);
});
