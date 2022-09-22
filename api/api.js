const express = require('express');
const employeesRouter = require('./employees');
const menusRouter = require('./menus');

const apiRouter = express.Router();

apiRouter.use('/menus', menusRouter);
apiRouter.use('/employees', employeesRouter);




module.exports = apiRouter;

