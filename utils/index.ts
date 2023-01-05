import { ClientRequest } from "http";

const serializer = (obj: Object) => JSON.stringify(obj);

const parseBody = async (req: ClientRequest) => {
    return new Promise((resolve, reject) => {
        const body: Array<Buffer> = [];
        req.on('data', (chunk) => body.push(chunk));
        req.on('end', () => {
            const reqBody = Buffer.concat(body).toString();
            let requestData = {}

            try {
                requestData = JSON.parse(reqBody)
            } catch (error) {
                resolve(null);
            }
            
            resolve(requestData);
        })
    });
}

export { serializer, parseBody }