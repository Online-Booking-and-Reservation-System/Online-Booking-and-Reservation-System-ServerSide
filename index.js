require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');

const auth = require('./routes/auth');
const userRoute = require('./routes/userRouter')
const httpStatusText = require("./utils/httpStatusText");
const resturantRoute = require('./routes/resturantRouter');
const path = require('path');

const app = express();

const port = process.env.PORT;

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
    console.log('mongodb server started');

})
const API_URL = "https://online-booking-and-reservation-system-server-side.vercel.app/api";
app.use(cors({
    origin : API_URL ,
    methods : ['GET' , 'POST'] ,
    credentials : true 
}))
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth' , auth) ;
app.use('/api/users', userRoute)
app.use('/api/resturants', resturantRoute)

app.get("/" ,(req, res)=>{
    res.json({message : "hello world from backend "})
})


app.all('*', (req, res, next) => {
    return res.status(404).json({ status: httpStatusText.ERROR, message: 'this resource is not available' })
})
app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);

})