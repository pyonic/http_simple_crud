import * as dotenv from 'dotenv';
import { app } from './server';

dotenv.config({ path: __dirname + '/.env'})

const PORT: number = parseInt(process.env.PORT!, 10) || 5000;

app().listen(PORT, '127.0.0.1', () => {
    console.log(`Server started on port ${PORT}`);
})