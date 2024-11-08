async function upravljajCSRFTokenom() {
    
    try {
        await fetch("/csrf/ranjivostOnOff", {
            method: "POST"
        })
    } catch(error) {
        console.error("Pogreska pri promjeni statusa ranjivosti na CSRF napad:", error)
    }
    
    try {
        await fetch("/csrf/dohvatiPodatkeOSesiji", {method: "GET"}).then(response => {
            return response.json()
        }).then (podaci => {
            if (podaci.statusRanjivosti == "UKLJUCENA") {
                document.getElementById("statusRanjivostiTekst").textContent = "Ranjivost UKLJUCENA"
                skriveniInput = document.getElementById("skriveniInput")
                if (skriveniInput) {
                    document.getElementById("transakcijskaForma").removeChild(skriveniInput)   //Uklanjanje skrivenog polja unosa nakon što se ranjivost uključi
                }
            } else if (podaci.statusRanjivosti == "ISKLJUCENA") {
                document.getElementById("statusRanjivostiTekst").textContent = "Ranjivost ISKLJUCENA"
                skriveniInput = document.createElement("input")
                skriveniInput.name = "CSRFToken"
                skriveniInput.value = podaci.CSRFToken
                skriveniInput.id = "skriveniInput"
                skriveniInput.type = "hidden"
                document.getElementById("transakcijskaForma").appendChild(skriveniInput)  //Dodavanje skrivenog polje unosa nakon što se ranjivost isključi
            }
        })
    } catch(error) {
        console.error("Greska pri dobivanju podataka o sesiji:", error)
    }

}

async function skriveniElement() {         //Funkcija napisana u slučaju nepredviđenog ponašanja koja osigurava da se skriveno polje kreira čak i ako je na samom početku rada stranice ranjivost isključena.
    try {                                  //Međutim, čim se sesija kreira, sve ranjivosti su, prema pretpostavljenoj vrijednosti, uključene pa ne bi trebalo doći do ove situacije.
        await fetch("/csrf/dohvatiPodatkeOSesiji", {method: "GET"}).then(response => {
            return response.json()
        }).then (podaci => {
            if (podaci.statusRanjivosti == "ISKLJUCENA") {
                document.getElementById("statusRanjivostiTekst").textContent = "Ranjivost ISKLJUCENA"
                skriveniInput = document.createElement("input")
                skriveniInput.name = "CSRFToken"
                skriveniInput.value = podaci.CSRFToken
                skriveniInput.id = "skriveniInput"
                skriveniInput.type = "hidden"
                document.getElementById("transakcijskaForma").appendChild(skriveniInput)
            }
        })
    } catch(error) {
        console.error("Greska pri dohvacanju podataka o sesiji:", error)
    }
    
}

skriveniElement()
