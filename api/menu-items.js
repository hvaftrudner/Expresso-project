const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuitemsRouter = express.Router({mergeParams: true});

menuitemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = {$menuItemId: req.params.menuItemId};

    db.get(sql, values, (error, menuItemId) => {
        if(error){
            next(error);
        } else if(menuItemId){
            req.menuItem = menuItemId;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

//--GET all menu-items
/*menuitemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId';
    const values = {
        $menuId: req.params.menuId
    };

    db.all(sql, values, (error, items) => {
        if(error){
            next(error);
        } else {
            res.send(200).json({menuItems: items});
        }
    });
});*/

menuitemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id=$menuId';
    const values = {
        $menuId: req.params.menuId
    };

    db.all(sql, values, (error, items) => {
        if(error) {
            next(error);
        } else {
            res.status(200).json({menuItems: items});
        }
    });
});

//--POST a new menu-item, returns last entry

menuitemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    }

    const query = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    };

    db.run(query, values, function(error) {
        if (error) {
            next(error);
        } else {
        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            (error, item) => {
                if(error){
                    next(error);
                } else {
                res.status(201).json({menuItem: item});
                }
            });
        }
    });
});

menuitemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if(!name || !description || !inventory || !price){
        return res.sendStatus(400);
    }

    const sql = 'UPDATE MenuItem SET name=$name, description=$description, '+
                'inventory=$inventory, price=$price '+
                'WHERE MenuItem.id = $menuItemId';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    };

    db.run(sql, values, function(error){
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
            (error, menuitem) => {
                if(error){
                    next(error);
                } else {
                    res.status(200).json({menuItem: menuitem});
                }
            });
        }
    });
});

menuitemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = `DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`;
    db.run(sql, function(error){
        if(error){
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = menuitemsRouter;