const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;


// ====================
// MIDDLEWARE
// ====================

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static("public"));


// ====================
// IMAGE UPLOAD
// ====================

const upload = multer({
    storage: multer.memoryStorage()
});


// ====================
// SUPABASE POSTGRES DATABASE
// ====================

const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});


// ====================
// TEST DATABASE CONNECTION
// ====================

pool.query("SELECT NOW()")
    .then(() => {

        console.log(
            "SUPABASE DATABASE CONNECTED"
        );

    })
    .catch((err) => {

        console.error(
            "DATABASE CONNECTION ERROR:",
            err
        );

    });


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


        await pool.query(
            `INSERT INTO farmers
            (name, mobile, password, village, district, land, paddy)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                name,
                mobile,
                password,
                village,
                district,
                land,
                paddy
            ]
        );


        console.log(
            "FARMER REGISTERED"
        );


        res.redirect(
            "/login.html"
        );


    } catch (err) {

        console.error(
            "REGISTRATION ERROR:",
            err
        );


        res.send(
            "Registration Failed! Check terminal."
        );

    }

});


// ====================
// FARMER LOGIN
// ====================

app.post("/login", async (req, res) => {

    try {

        const {
            mobile,
            password
        } = req.body;


        const result = await pool.query(
            `SELECT name
             FROM farmers
             WHERE mobile = $1
             AND password = $2`,
            [
                mobile,
                password
            ]
        );


        if (result.rows.length > 0) {

            console.log(
                "LOGIN SUCCESS"
            );


            res.redirect(
                "/dashboard.html"
            );


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


        res.send(
            "Login Failed!"
        );

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

                error:
                    "Image upload failed."

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

server.on(
    "error",
    (err) => {

        console.error(
            "SERVER ERROR:",
            err
        );

    }
);


// ====================
// KEEP SERVER RUNNING
// ====================

process.stdin.resume();