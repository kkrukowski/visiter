
const express = require('express');
const router = express.Router();
const session = require('express-session');
const app = express();
const User = require('../models/User')


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: trueS
}));
app.use(express.json());

router.post('/', (req, res) => {
    userInfo = req.body;

    

});



module.exports = router;
