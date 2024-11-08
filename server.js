const express = require("express");
const session = require("express-session")
const hr = require("./routes/home.routes");
const csrf = require("./routes/csrf.routes");
const path = require("path")

const app = express();

const port = 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "anything",
        resave: false,
        saveUninitialized: true,
    })
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Doslo je do greske');
});



app.use("/", hr);
app.use("/csrf", csrf)


app.listen(port);


