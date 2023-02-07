const express = require('express');
const cors = require('cors');
// const { user, appEvents } = require('./api');
var morgan = require("morgan");
const chalk = require('chalk');
const routes = require('./v1/controller/routes');


module.exports = async (app) => {

    app.use(express.json());//app.use(express.json({ limit: '1mb'}));
    app.use(express.urlencoded({ extended: false }))//app.use(express.urlencoded({ extended: true, limit: '1mb'}));

    app.use(cors());
    app.use("/api/v1", routes);
    // app.use(function (req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header(
    //         "Access-Control-Allow-Headers",
    //         "Origin, X-Requested-With, Content-Type, Accept"
    //     );
    //     next();
    // });


    if (process.env.NODE_ENV === "development") {
        app.use(
            morgan(function (tokens, req, res) {
                return (
                    chalk.blue(tokens["remote-addr"](req, res)) +
                    " " +
                    chalk.cyanBright(tokens.method(req, res)) +
                    " " +
                    chalk.green(tokens.url(req, res)) +
                    " " +
                    chalk.yellow(tokens.status(req, res)) +
                    " " +
                    chalk.red(tokens["response-time"](req, res))
                );
            })
        );
    }

    //Listen to Events//
    // appEvents(app)

    //api
    // user(app);
    app.use(function (req, res, next) {
        res.status(404);
        res.json({ status: false, message: ["404 error"] })
    })

    const errorHandler = (err, req, res, next) => {
        return res.json({ status: false, message: [err.message] })
    }
    app.use(errorHandler)






}
