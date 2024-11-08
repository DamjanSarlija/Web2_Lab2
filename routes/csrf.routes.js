const express = require("express")
const router = express.Router();
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
    
        const rezultat = await client.query("SELECT * FROM transakcije")
        const transakcijeRetci = rezultat.rows
    
        const rezultatUpozorenja = await client.query("SELECT * FROM upozorenja")
        const upozorenjaRetci = rezultatUpozorenja.rows
        await client.end()
    
        res.render("csrf", {statusRanjivosti: req.session.ranjivost, transakcije: transakcijeRetci, upozorenja: upozorenjaRetci})
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
})



router.get("/placanje", async (req, res) => {
    
    try {
        if (!req.session.user) {
            res.redirect("/")
        } else {
            const client = new Client({
                user: "postgres",
                password: "bazepodataka",
                host: "localhost",
                port: "5432",
                database: "Web_Lab2_Database"
            })
        
            await client.connect();
    
            if (req.session.ranjivost == "ISKLJUCENA") {
                if (!req.query.CSRFToken || req.query.CSRFToken.toString() != req.session.CSRFToken) {
                    await client.query("INSERT INTO upozorenja(napadac, zrtva, svota) VALUES($1, $2, $3)", [req.query.primatelj, req.session.user, req.query.svota])
                    
                } else {
                    await client.query("INSERT INTO transakcije(posiljatelj, primatelj, svota, ranjivost) VALUES($1, $2, $3, $4)", [req.session.user, req.query.primatelj, req.query.svota, false])
                }
    
            } else {
                await client.query("INSERT INTO transakcije(posiljatelj, primatelj, svota, ranjivost) VALUES($1, $2, $3, $4)", [req.session.user, req.query.primatelj, req.query.svota, true])
    
            }
    
            await client.end()
            res.redirect("/csrf")
        }
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
})



router.post("/ranjivostOnOff", (req, res) => {
    
    if (req.session.ranjivost == "UKLJUCENA") {
        req.session.ranjivost = "ISKLJUCENA"
        if (!req.session.csrftoken) {
            req.session.CSRFToken = Math.floor(Math.random() * (1000000000))   //U trenutku isključivanja ranjivosti, generira se CSRF token (koji je za potrebe demonstracije predstavljen nasumičnim prirodnim brojem između 1 i 1000000000.)
        }                                                                      //Ovaj isti token bit će dodan u obrazac na csrf.ejs stranici kao nevidljivi unos. Ovu funkcionalnost moguće je vidjeti u datoteci script.js.
        
    } else if (req.session.ranjivost == "ISKLJUCENA" || !req.session.ranjivost) {  //U trenutku uključivanja ranjivosti, CSRF token se briše, a skriveno polje unosa u csrf.ejs datoteci također se uklanja (vidljivo u script.js).
        req.session.ranjivost = "UKLJUCENA"
        
        delete req.session.CSRFToken
        

    }
    res.redirect("/csrf")
})

router.get("/dohvatiPodatkeOSesiji", (req, res) => {
    res.json({
        statusRanjivosti: req.session.ranjivost,
        CSRFToken: req.session.CSRFToken
    })
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
        await client.query("DELETE FROM transakcije")
        await client.end()
    
        res.redirect("/csrf")
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
})

router.get("/izbrisiSvaUpozorenja", async (req, res) => {
    try {
        const client = new Client({
            user: "postgres",
            password: "bazepodataka",
            host: "localhost",
            port: "5432",
            database: "Web_Lab2_Database"
        })
    
        await client.connect();
        await client.query("DELETE FROM upozorenja")
        await client.end()
    
        res.redirect("/csrf")
    } catch (error) {
        console.error("Greska u dohvacanju podataka:", error);
        res.status(500).send("Internal Server Error");
    }
    
})



module.exports = router