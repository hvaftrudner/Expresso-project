const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuitemsRouter = require('./menu-items');

const menusRouter = express.Router();

//--Param for MenuID
menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    
    const values = {$menuId: menuId};

    db.get(sql, values, (error, menuId) => {
        if(error){
            next(error);
        } else if (menuId){
            req.menuId = menuId;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

//--Get all menus
menusRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Menu';
    db.all(sql, (error, menus) => {
        if(error){
            next(error);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menusRouter.use('/:menuId/menu-items', menuitemsRouter);

//--POST a new menu, retrieves the last entry
menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if(!title){
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {$title: title};

    db.run(sql, values, function(error){
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
                if(error){
                    next(error);
                } else {
                    res.status(201).json({menu: menu});
                }
            });
        }
    });
});

//---Get a specific menu
menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menuId});
    next();
});

//---PUT--Update existing menu from menu id
menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Menu SET title=$title WHERE Menu.id = $menuId';
    const values = {
        $title: title,
        $menuId: req.params.menuId
    };

    db.run(sql, values, function(error){
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) => {
                if(error){
                    next(error);
                } else {
                    res.status(200).json({menu: menu});
                }
            });
        }
    });
}); 

//--DELETE an existing menu 
menusRouter.delete('/:menuId', (req, res, next) => {
    const deletesql = `SELECT * FROM MenuItem WHERE menu_id = $menuId`;
    const deletevalue = {$menuId: req.params.menuId};
    db.run(deletesql, deletevalue, (error, menuitem) => {
        if(error){
            next(error);
        } else if(menuitem){
            return res.sendStatus(400);
        } else {
            db.run(`DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`, function(error){
                if(error){
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});


module.exports = menusRouter;