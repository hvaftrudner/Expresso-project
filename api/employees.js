const express = require('express');
const timesheetsRouter = require('./timesheets');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const employeesRouter = express.Router();

//get / select all currently employeed
employeesRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1;';
    db.all(sql, (error, employees) => {
        if(error){
            next(error);
        } else {
            res.status(200).json({employees: employees});
        }
    });
});

//-.----------param to target all employeeID requests
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
    const values = {$employeeId: employeeId};

    db.get(sql, values, (error, employee) => {
        if(error){
            next(error);
        } else if (employee){
            req.employee = employee;
            next();
        } else {
            res.status(404).send('not a valid employee');
        }
    });
});

//employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);
//Post a new employee, returns last entry
employeesRouter.post('/', (req, res, next) => {

    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee ) '+
                'VALUES ($name, $position, $wage, $isCurrentEmployee) ;';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
    };

    if(!name || !position || !wage ){
        return res.sendStatus(400);
    }
    db.run(sql, values, function(error){
        if(error){
            next(error);
        }
        db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
            (error, employee) => {
                if(error){
                    next(error);
                }
                res.status(201).json({employee: employee});

        });
    });
});

//.---- GET a specific employee based on id
employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

//.-------PUT changes an employee based on id

employeesRouter.put('/:employeeId', (req, res, next) => {
    
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    if(!name ||!position ||!wage){
        return res.sendStatus(400);
    }
    const sql = 'UPDATE Employee SET name = $name, '+
                'position = $position, wage = $wage, '+
                'is_current_employee = $isCurrentEmployee '+
                'WHERE Employee.id = $employeeId';
    
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };

    db.run(sql, values, function(error){
        if(error){
            next(error);
        }
        db.get(`SELECT * FROM Employee WHERE employee.id = ${req.params.employeeId}`, (error, employee) => {
            if(error){
                next(error);
            } else {
                res.status(200).json({employee: employee});
            }
        });
    });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
    const value = {$employeeId: req.params.employeeId};

    db.all(sql, value, function(error){
        if(error){
            next(error);
        }
        db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (error, employee) => {
            if(error){
                next(error);
            }
            res.status(200).json({employee: employee});
        });
    });
});


module.exports = employeesRouter;