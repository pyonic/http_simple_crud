import agent from 'supertest';
import { IUser } from '../models/User';

import { app as ServerApp, UserDB } from '../server';

const mockUsers: Array<IUser> = [
    {
        id: '10b529aa-430b-48db-8907-a83bc065ed5b',
        username: 'Test User',
        age: 77,
        hobbies: ['films', 'chess']
    }
];

const newUser: IUser = {
    username: 'New User',
    age: 15,
    hobbies: ['swimming']
}

const app: any = ServerApp(mockUsers).listen(8080, () => { console.log(`Testing server started at PORT = ${8080}`);});    

const request: any = agent(app);

describe('REST-API tests', () => {
    afterAll( () => {
        app.close();
    });

    describe('Api test - Scenario 1', () => {
    
        afterAll(() => {
            UserDB.setUsers([]);
        });
    
        test("Testing users list API", async () => {
            const response: Object | any = await request.get('/api/users');
    
            expect(JSON.parse(JSON.stringify(response.body.data))[0].username).toBe(mockUsers[0].username);
        });
    
        test("Test get by id API", async () => {
            const userId = mockUsers[0].id;
            const user = await request.get(`/api/users/${userId}`);
    
            expect(user.body.data.username).toBe(mockUsers[0].username);
        });
    
        test('Delete single user API', async () => {
            const userId: string | undefined = mockUsers[0].id;
    
            const [deleteResponse, getUserRequest] = await Promise.all([
                request.delete(`/api/users/${userId}`),
                request.get(`/api/users/${userId}`)
            ])
    
            expect(deleteResponse.status).toBe(204);
            expect(getUserRequest.status).toBe(404);
        });
    
        test('Insert user test', async () => {
            const response = await request
                                    .post('/api/users')
                                    .send({ data: newUser })
                                    .expect(201);
    
            const getUsers = await request.get('/api/users');
    
            expect(JSON.parse(JSON.stringify(getUsers.body.data)).length).toBe(1);
        });
    
    });
    
    describe('Api test - Scenario 2', () => {
        afterAll(() => {
            UserDB.setUsers([]);
        });
    
        let userId: string = '';
    
        test("Empty users list test", async () => {
            const response: Object | any = await request.get('/api/users');
    
            expect(JSON.parse(JSON.stringify(response.body.data)).length).toBe(0);
        });
    
        test('Insert user test', async () => {
            await request.post('/api/users')
                    .send({ data: newUser })
                    .expect(201);
    
            const getUsers = await request.get('/api/users');
            
            userId = JSON.parse(JSON.stringify(getUsers.body.data))[0].id;
    
            expect(JSON.parse(JSON.stringify(getUsers.body.data)).length).toBe(1);
        });
    
        test("Get created user", async () => {
            const user = await request.get(`/api/users/${userId}`);
            expect(user.body.data.username).toBe(newUser.username);
        });
    });
    
    describe('Api test - Scenario 3 - Validation, Error & 404 Management', () => {
        afterAll(() => {
            UserDB.setUsers([]);
        });
    
        test("Empty users list 404 test", async () => {
            const response: Object | any = await request.get('/api/users');
            const response404: Object | any = await request.get('/api/user');
    
            expect(response404.status).toBe(404);
            expect(JSON.parse(JSON.stringify(response.body.data)).length).toBe(0);
        });
    
        test('Insertion test 505 & 400 statuses', async () => {
            await request.post('/api/users')
                    .type('json')
                    .send('{"data": \"malformed data}')
                    .expect(500);
    
            const malformedUser = {
                age: 20
            }
    
            await request.post('/api/users')
                    .send({ data: malformedUser })
                    .expect(400);
        });
    
        test('Delete test  400 & 404 statuses', async () => {
            const [notExistingUser, incorrectUUID ] = await Promise.all([
                request.delete(`/api/users/f0c8968a-8a06-11ed-a1eb-0242ac120002`),
                request.delete(`/api/users/13`)
            ])
                    
            expect(notExistingUser.status).toBe(404);
            expect(incorrectUUID.status).toBe(400);
        })
    });
})