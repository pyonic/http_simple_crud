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
exports.parseBody = exports.serializer = void 0;
const serializer = (obj) => JSON.stringify(obj);
exports.serializer = serializer;
const parseBody = (req) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const body = [];
        req.on('data', (chunk) => body.push(chunk));
        req.on('end', () => {
            const reqBody = Buffer.concat(body).toString();
            let requestData = {};
            try {
                requestData = JSON.parse(reqBody);
            }
            catch (error) {
                resolve(null);
            }
            resolve(requestData);
        });
    });
});
exports.parseBody = parseBody;
