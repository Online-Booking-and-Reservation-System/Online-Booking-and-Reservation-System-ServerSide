require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');

const auth = require('./routes/auth');
const userRoute = require('./routes/userRouter');
const managerRoute = require('./routes/managerRouter');
const reservationRoute = require('./routes/reservationRouter');
const httpStatusText = require("./utils/httpStatusText");
const path = require('path');

const app = express();

const port = process.env.PORT;

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
    console.log('mongodb server started');

})
const API_URL = "https://online-booking-and-reservation-system-server-side.vercel.app/api";
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}))
app.use(express.json());

const resturantRoute = require('./routes/resturantRouter');


// Serve uploaded images as static files
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', auth);
app.use('/api/users', userRoute);
app.use('/api/managers', managerRoute);

app.use('/api/resturants', resturantRoute);
app.use('/api/reservation', reservationRoute);

// app.get("/" ,(req, res)=>{
//     res.json({message : "hello world from backend "})
// })


app.all('*', (req, res, next) => {
    return res.status(404).json({ status: httpStatusText.ERROR, message: 'this resource is not available' })
})
app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);

})