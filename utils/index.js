const serializer = (obj) => JSON.stringify.call(this, obj)

const parseBody = async (req) => {
    return new Promise((resolve, reject) => {
        const body = [];
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

module.exports = {
    serializer,
    parseBody
}