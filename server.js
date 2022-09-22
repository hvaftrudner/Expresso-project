const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(errorhandler());

const PORT = process.env.PORT || 4000;

app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});

module.exports = app;