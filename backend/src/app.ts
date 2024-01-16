import express  from 'express';
import { connectDB } from './utils/db.js';
import indexRouter from './routes/index.routes.js';
import { errorMiddleware } from './middlewares/error.js';
import {Redis} from 'ioredis'
import { config } from 'dotenv';
import Stripe from 'stripe';

config({
    path:'./.env'
})

const port = process.env.PORT || 8000;
const mongoUri = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
const app = express();

connectDB(mongoUri);

export const stripe = new Stripe(stripeKey);

export const client = new Redis({
    port: 6379, // Redis port
    host: "127.0.0.1", // Redis host
    password: "Rahul",
    db: 0, // Defaults to 0
  });

app.use(express.json());
// app.use(express.urlencoded({extended:true}));

//Static files
app.use('/uploads',express.static("uploads"));


app.use('/api/v1',indexRouter)

app.use(errorMiddleware)
app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})