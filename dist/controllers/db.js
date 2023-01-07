"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setData = void 0;
const setData = (key, value) => {
    // @ts-ignore
    process.send(JSON.stringify({ action: 'set', key, value }));
};
exports.setData = setData;
