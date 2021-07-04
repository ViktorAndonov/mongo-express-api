const express = require('express');
const app = express();
// Now we can use "app" to create routes and other stuff...

const mongoose = require('mongoose');
require('dotenv/config');

// Import Routes
const postsRoute = require('./routes/posts');
const authRoute = require('./routes/auth');

// Middleware - do stuff when we hit some route
app.use(express.json());

// routes go last
app.use('/posts', postsRoute);
app.use('/api/user', authRoute);


// Creating routes
app.get('/', (req, res) => {
    res.send('<h1>We are on home!</h1>');
});

// Connect to a DB (Mongo)
mongoose.connect(process.env.DB_CONNECTION, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => {
    console.log('Connected to the DB!');
});

app.set('trust proxy', true);
// Listening to a server port
app.listen(6969, () => console.log('Server started!'));
