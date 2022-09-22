const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = express.Router({mergeParams: true});


// TimesheetID param
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: timesheetId};

    db.get(sql, values, (error, timesheet) => {
        if(error){
            next(error);
        } else if(timesheet){
            req.timesheet = timesheet;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});


//--GET all timesheets with the employeeid 
timesheetsRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`;
    const values = {
        $employeeId: req.params.employeeId,
    };

    db.all(sql, values, (error, timesheets) => {
        if(error){
            next(error);
        } else {
            res.status(200).json({timesheets: timesheets});
        }
    });
});

// POST posts a timesheet and returns latest entry
timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) '+
                'VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            (err, timesheet) => {
                res.status(201).json({timesheet: timesheet});
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Timesheet SET hours=$hours, rate=$rate, date=$date WHERE Timesheet.id=$timesheetId';
    
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: req.params.timesheetId
    };

    db.run(sql, values, function(error){
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
            (error, timesheet) => {
                if(error){
                    next(error);
                } else {
                    res.status(200).json({timesheet: timesheet});
                }
            });
        }
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = `DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`;
    db.run(sql, function(error){
        if(error){
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetsRouter;