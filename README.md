# Simple Crud API
Task: https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md
```
Deadlines: start: 2023-01-02	end: 2023-01-17

Approximate score: **222**
```

> **Note**

> POST/PUT User object accepted with data object wrapper -> Request body {"data": {...user_data} } [See CURL examples below](#curl-example-of-postput-request)

> Self score calculations are in the borrom of Readme 

## Instalation dependencies
NodeJS required version *18 LTS*
```
npm install
```
## Building production application

```
npm run build
```

## Starting application
```
// Dev mode
npm run start:dev
// Producton # after build
npm run start:prod

// Multi instances modes
npm run start:multi
```
## CURL Example of POST&PUT request
```
curl --location --request POST 'http://localhost:5000/api/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "data": {
        "age": 22,
        "username": "Andy",
        "hobbies": [
            "1",
            "2"
        ]
    }
}'

curl --location --request PUT 'http://localhost:5000/api/users/{user_id}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "data": {
        "age": 22,
        "username": "Loosi",
        "hobbies": [
            "1",
            "2"
        ]
    }
}'
```

## RestAPI Test

```
npm run test
```

Test coverage
![image](https://user-images.githubusercontent.com/90814469/210254295-3b722d2f-974c-4747-a678-44d8c5f5e9a4.png)

## Endpoints

``` 
GET    http://localhost:5000/api/users 
GET    http://localhost:5000/api/users/{uuid}
PUT    http://localhost:5000/api/users/{uuid}
DELETE http://localhost:5000/api/users/{uuid}
POST   http://localhost:5000/api/users
```

```
+10 The repository with the application contains a Readme.md file containing detailed instructions for installing, running and using the application
+10 GET api/users implemented properly
+10 GET api/users/${userId} implemented properly
+10 POST api/users implemented properly
+10 PUT api/users/{userId} implemented properly
+10 DELETE api/users/${userId} implemented properly
+30 Code Written on TypeScript
+6 Users are stored in the form described in the technical requirements
+6 Value of port on which application is running is stored in .env file
+10 Processing of requests to non-existing endpoints implemented properly
+10 Errors on the server side that occur during the processing of a request should be handled and processed properly
+10 Development mode: npm script start:dev implemented properly
+10 Production mode: npm script start:prod implemented properly
+30 There are tests for API (not less than 3 scenarios)
+50 There is horizontal scaling for application with a load balancer
```
