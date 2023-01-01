const supertest = require('supertest');
const server = require('../server');

const mockUsers = [
    {
        id: 'a41a21d7-dfb8-4781-bced-50dcab2667f4',
        username: 'Test User',
        age: 77,
        hobbies: ['films', 'chess']
    }
];

const newUser = {
    username: 'New User',
    age: 15,
    hobbies: ['swimming']
}

describe('Api tests', () => {
    let request = null;
    let app = null;

    beforeAll(() => {
        app = server.app(mockUsers).listen(8080, () => { console.log(`Testing server started at PORT = ${8080}`);});
        request = supertest.agent(app); 
    });

    afterAll(() => {
        app.close();
    });

    test("Testing users list API", async () => {
        const response = await request.get('/api/users');

        expect(JSON.parse(JSON.stringify(response.body.data))[0].username).toBe(mockUsers[0].username);
    });

    test("Test get by id API", async () => {
        const userId = mockUsers[0].id;
        const user = await request.get(`/api/users/${userId}`);

        expect(user.body.data.username).toBe(mockUsers[0].username);
    });

    test('Delete single user API', async () => {
        const userId = mockUsers[0].id;

        const [notExistingUser, incorrectUUID, deleteResponse, getUserRequest] = await Promise.all([
            request.delete(`/api/users/f0c8968a-8a06-11ed-a1eb-0242ac120002`),
            request.delete(`/api/users/13`),
            request.delete(`/api/users/${userId}`),
            request.get(`/api/users/${userId}`)
        ])
                
        expect(notExistingUser.status).toBe(404);
        expect(incorrectUUID.status).toBe(400);
        expect(deleteResponse.status).toBe(204);

        expect(getUserRequest.status).toBe(404);
    })

    test('Insert user test', async () => {
        const response = await request
                                .post('/api/users')
                                .send({ data: newUser })
                                .expect(201);

        const getUsers = await request.get('/api/users');

        expect(JSON.parse(JSON.stringify(getUsers.body.data)).length).toBe(1);
    })

})