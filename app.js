const express = require("express");
const oracledb = require("oracledb");
const multer = require("multer");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;


// ====================
// MIDDLEWARE
// ====================

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));


// ====================
// IMAGE UPLOAD
// ====================

const upload = multer({
    storage: multer.memoryStorage()
});


// ====================
// ORACLE DATABASE
// ====================

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};


// ====================
// HOME PAGE
// ====================

app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/public/register.html"
    );

});


// ====================
// FARMER REGISTRATION
// ====================

app.post("/register", async (req, res) => {

    let connection;

    try {

        const {
            name,
            mobile,
            password,
            village,
            district,
            land,
            paddy
        } = req.body;

        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `INSERT INTO farmers
            (name, mobile, password, village, district, land, paddy)
            VALUES
            (:name, :mobile, :password, :village, :district, :land, :paddy)`,
            {
                name,
                mobile,
                password,
                village,
                district,
                land,
                paddy
            },
            {
                autoCommit: true
            }
        );

        res.redirect("/login.html");

    } catch (err) {

        console.error(
            "REGISTRATION ERROR:",
            err
        );

        res.send(
            "Registration Failed! Check terminal."
        );

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// ====================
// FARMER LOGIN
// ====================

app.post("/login", async (req, res) => {

    let connection;

    try {

        const {
            mobile,
            password
        } = req.body;

        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `SELECT name
             FROM farmers
             WHERE mobile = :mobile
             AND password = :password`,
            {
                mobile,
                password
            }
        );

        if (result.rows.length > 0) {

            res.redirect("/dashboard.html");

        } else {

            res.send(
                "Invalid Mobile Number or Password!"
            );

        }

    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );

        res.send("Login Failed!");

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


// ====================
// DISEASE IMAGE UPLOAD
// ====================

app.post(
    "/analyze-disease",
    upload.single("image"),
    async (req, res) => {

        try {

            console.log(
                "Paddy leaf image received!"
            );

            if (!req.file) {

                return res.status(400).json({
                    error: "No image received"
                });

            }

            console.log(
                "Image size:",
                req.file.size,
                "bytes"
            );

            // AI analysis is currently paused

            res.json({
                result:
                    "Image received successfully. AI disease analysis is currently paused."
            });

        } catch (error) {

            console.error(
                "IMAGE ERROR:",
                error
            );

            res.status(500).json({
                error: "Image upload failed."
            });

        }

    }
);


// ====================
// SERVER START
// ====================

const server = app.listen(
    PORT,
    () => {

        console.log(
            "SERVER STARTED"
        );

        console.log(
            `Website: http://localhost:${PORT}`
        );

    }
);


// ====================
// SERVER ERROR
// ====================

server.on("error", (err) => {

    console.error(
        "SERVER ERROR:",
        err
    );

});


// ====================
// KEEP SERVER RUNNING
// ====================

process.stdin.resume();