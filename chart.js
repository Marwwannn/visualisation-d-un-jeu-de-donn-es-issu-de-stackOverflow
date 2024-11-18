/**$(document).ready(function() {
    // Utiliser getJSON pour charger le fichier JO.json
    $.getJSON('JO.json')
        .then(function(data) {
            // Parcourir et afficher chaque année
            let outputDiv = $('#output');
            $.each(data, function(index, e) {
                const year = e["Year"];
                const city = e["City"];
                const athlete = e["Athlete"];

                outputDiv.append(`<p>Year: ${year}, City: ${city}, Athlete: ${athlete}</p>`);
            });
        })
        .fail(function() {
            console.error('Erreur lors du chargement du fichier JSON.');
        });
});
**/
lien = "JO.json"

function recupDonnee(lien) {
    return $.getJSON(lien)
        .fail(function() {
            console.error('Erreur lors du chargement du fichier JSON.');
        });
}

function getCountryData(data, country) {
    countryData = data.filter(function(e) {
        return e.Country === country;
    });
    return countryData;
}

function getYears(data) { // On utilise Set pck les doublons sont directement traité
    const yearsSet = new Set();
    data.forEach(function(e) {
        yearsSet.add(e.Year); 
    });
    return Array.from(yearsSet);
}

function aggregateYears(data, years) {
    const medailleDelivre = new Map();  
    

    years.forEach(function(year) {
        medailleDelivre.set(year, 0);
    });
    data.forEach(function(e) {
        const year = e.Year;
        if (years.includes(year)) {
            medailleDelivre.set(year, medailleDelivre.get(year) + 1);
        }
    });

    return medailleDelivre;  
}


function treatData(data, country){
    tableauAnnee = []
    tableauNombre = []

    countryData = getCountryData(data, country);

    uniqueYears = getYears(countryData).sort((a, b) => a - b);

    uniqueYears.forEach(function(e) {
        tableauAnnee.push(e)
    })

    const medailleMap = aggregateYears(countryData, tableauAnnee);
    medailleMap.forEach(function(nbrMed) {
        tableauNombre.push(nbrMed);
    });

    return {
        annees: tableauAnnee,
        medailles: tableauNombre
    };
}

function loadChart(medals, years) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Médailles remportées',
                data: medals,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de médailles'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Années'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
    return lineChart; 
}


$(document).ready(function() {
    const country = "France";

    recupDonnee('JO.json').then(function(data) {
        const treat = treatData(data, country);
        const annees = treat.annees;
        const med = treat.medailles;
        const chart = loadChart(med, annees);
        createCountriesDropDown(data,chart); 
    });
});

function getCountries(data) {
    const pays = new Set();
    data.forEach(function(e) {
        pays.add(e.Country); 
    });
    return Array.from(pays).sort();
}

function updateCountry(chart, nomPays, dataJs){

    const dataA = treatData(dataJs,nomPays)

    chart.data.datasets[0].data = dataA.medailles;  
    chart.data.labels = dataA.annees; 
    chart.update()
}   

    function createCountriesDropDown(data, chart){
        const select = document.createElement("select");

        select.id = "mon zgeg"
        
        const pays = getCountries(data);

        console.log('Unique countries:', pays);

        pays.forEach(function(payss) {
            let option = document.createElement('option');
            option.value = payss;
            option.text = payss;
            // On ajoute l'option au dropDown
            select.appendChild(option);
        })

        document.getElementById("dropdownContainer").appendChild(select);

        select.addEventListener('change', function() {
            const selectedCountry = this.value;
            updateCountry(chart, selectedCountry, data);
        });
    }

function filter(critere,data,valeur){
    dataFiltre = data.filter(function(e) {
        return e[critere] === valeur;
    });
    return dataFiltre;
}

function getValues(data, critere){
    const valeurCritere = new Set();

    data.forEach(function(e){
        valeurCritere.add(e[critere])
    })

    return Array.from(valeurCritere).sort()
}

