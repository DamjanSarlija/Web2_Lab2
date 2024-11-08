const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")

const { Client } = require("pg")


router.get("/", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login")
        }
    
        const client = new Client({
            user: "postgres",
            password: "bazepodataka",
            host: "localhost",
            port: "5432",
            database: "Web_Lab2_Database"
        })
    
        await client.connect();
        
        const rezultat = await client.query("SELECT * FROM objave")
        const poruke = rezultat.rows
        const rezultatVjerodajnice = await client.query("SELECT * FROM vjerodajnice")
        const retciVjerodajnice = rezultatVjerodajnice.rows
        
        await client.end()
        res.render("home", {
            objave: poruke,
            statusXSS: req.session.ranjivostXSS,
            statusNesigurna: req.session.ranjivostNesigurna,
            retciVjerodajnice: retciVjerodajnice
        })
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
    
})

router.post("/upis", async (req, res) => {
    try {
        const client = new Client({
            user: "postgres",
            password: "bazepodataka",
            host: "localhost",
            port: "5432",
            database: "Web_Lab2_Database"
        })
    
        await client.connect();
    
        tekstZaUpis = req.body.tekstObjave;
        
        if (req.session.ranjivostXSS == "ISKLJUCENA") {       //Ako je ranjivost na XSS isključena, provodi se sanitizacija unosa. Ako je uključena, tada se sanitizacija ne provodi.
           tekstZaUpis =  tekstZaUpis.replaceAll("<", "&lt")  //Znakovi <, >, \, ', & zamjenjuju se sekvencama znakova koji ih predstavljaju. To onemogućuje injekciju malicioznog JavaScript koda na stranicu.
                    .replaceAll(">", "&gt")
                    .replaceAll("\"", "&quot")
                    .replaceAll("'", "&#39")
                    .replaceAll("&", "&amp")
                    
        }
    
        await client.query("INSERT INTO objave(sadrzaj) VALUES($1)", [tekstZaUpis]);
    
        const rezultat = await client.query("SELECT * FROM objave")
        const poruke = rezultat.rows
    
        await client.end()
    
        res.redirect("/")
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
    
})

router.get("/izbrisiSve", async (req, res) => {
    try {
        const client = new Client({
            user: "postgres",
            password: "bazepodataka",
            host: "localhost",
            port: "5432",
            database: "Web_Lab2_Database"
        })
    
        await client.connect();
        await client.query("DELETE FROM objave")
        await client.end()
    
        res.redirect("/")
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
})






router.post("/login", (req, res) => {
    if ((req.body.username == "korisnik1" && req.body.password == "lozinka1") || (req.body.username == "korisnik2" && req.body.password == "lozinka2")) {
        req.session.user = req.body.username
        req.session.ranjivostXSS = "UKLJUCENA"
        req.session.ranjivost = "UKLJUCENA"
        req.session.ranjivostNesigurna = "UKLJUCENA"
        res.redirect("/")
    } else {
        res.redirect("/login")
    }
})

router.post("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/login")
})

router.get("/login", (req, res) => {
    res.render("csrflogin", {})
})

router.post("/promijeniStatusXSS", (req, res) => {
    if (req.session.ranjivostXSS == "UKLJUCENA") {
        req.session.ranjivostXSS = "ISKLJUCENA"
    } else if (req.session.ranjivostXSS == "ISKLJUCENA") {
        req.session.ranjivostXSS = "UKLJUCENA"
    } else {
        console.log("Error")
    }
    res.redirect("/")
})

router.post("/promijeniStatusNesigurna", (req, res) => {
    if (req.session.ranjivostNesigurna == "UKLJUCENA") {
        req.session.ranjivostNesigurna = "ISKLJUCENA"
    } else if (req.session.ranjivostNesigurna == "ISKLJUCENA") {
        req.session.ranjivostNesigurna = "UKLJUCENA"
    } else {
        console.log("Error")
    }
    res.redirect("/")
})

router.post("/upisVjerodajnica", async (req, res) => {
    try {
        const client = new Client({
            user: "postgres",
            password: "bazepodataka",
            host: "localhost",
            port: "5432",
            database: "Web_Lab2_Database"
        })
    
        var lozinkaZaUpis = ""
    
        if (req.session.ranjivostNesigurna == "ISKLJUCENA") {          //Ako je ranjivost isključena, tada se računa sažetak lozinke i on pohranjuje u bazu.
            lozinkaZaUpis = await bcrypt.hash(req.body.password, 10)
        } else {                                                       //Ako je ranjivost uključena, lozinka se sprema u bazu nepromijenjena, u čistom tekstu.
            lozinkaZaUpis = req.body.password
        }
        
        await client.connect();
        await client.query("INSERT INTO vjerodajnice(username, password) VALUES($1, $2)", [req.body.username, lozinkaZaUpis])
        await client.end()
        res.redirect("/")
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
})

router.get("/izbrisiSveVjerodajnice", async (req, res) => {
    try {
        const client = new Client({
            user: "postgres",
            password: "bazepodataka",
            host: "localhost",
            port: "5432",
            database: "Web_Lab2_Database"
        })
    
        await client.connect();
        await client.query("DELETE FROM vjerodajnice")
        await client.end()
    
        res.redirect("/")
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
})


module.exports = router