# Simple Crud API

## Instalation dependencies
NodeJS required version *18 LTS*
```
npm install
```

## Starting application
```
// Dev mode
npm run start:dev
// Producton
npm run start:prod

// Multi instances modes
npm run start:multi
npm run start:multi:prod
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
