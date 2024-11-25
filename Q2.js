function recupDonnee(lien) {
    return $.getJSON(lien)
        .fail(function() {
            console.error('Erreur lors du chargement du fichier JSON.');
        });
}

function calculMoy(data, paysSelectione) {
    const objet = {}; // Faire un objet pour le compteur et stocker le salaire par niveau d'éducation

    const limiteSalaire = 100000000; // Limiter le salaire car il y a une donnée faussée
    
    data.forEach(entry => {
        const niveauEcole = String(entry.EdLevel); // Utilisation de EdLevel comme le niveau d'éducation
        const salaire = parseInt(entry.CompTotal);
        if ((paysSelectione === 'tous' || entry.Country === paysSelectione) &&
            !isNaN(salaire) && salaire < limiteSalaire) {
            
            if (!objet[niveauEcole]) {
                objet[niveauEcole] = { totalsalaire: 0, count: 0 };
            }
            const salaireEUR = salaire * 0.91; // Conversion en euro
            objet[niveauEcole].totalsalaire += salaireEUR;
            objet[niveauEcole].count += 1;
        }
    });

    const niveauxEcole = [];
    const moySalaire = [];
    for (const niveau in objet) {
        niveauxEcole.push(String(niveau)); // Utilisation de la chaîne de caractères pour les niveaux
        const average = objet[niveau].totalsalaire / objet[niveau].count; // Calcul de la moyenne
        moySalaire.push(average);
    }

    return { niveauxEcole, moySalaire };
}


function paysSelector(data, paysSelectione) {
    const continent = $('#continentSelector').val();
    const pays = new Set(); // Les doublons sont gérés directement avec Set

    // recup tous les pays en fonction du continent choisi pour les mettre dans le select
    data.forEach(entry => {
        if (continent === 'Amerique' && entry.Continent === 'NA') {
            if (paysSelectione === 'tous' || entry.Country === paysSelectione) {
                pays.add(entry.Country);
            }
        } else {
            pays.add(entry.Country);
        }
    });

    const payssSelector = $('#paysSelector');
    payssSelector.empty();
    payssSelector.append('<option value="tous">Tous les pays</option>'); 
    pays.forEach(country => { // Prendre tous les pays que l'on a stockés
        payssSelector.append(`<option value="${country}">${country}</option>`);
    });
}

function displayChart(chartData) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    // Quand on change de continent ou de pays, détruire l'ancien graphique
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar', // Type de graphique 'bar' pour un diagramme en barres
        data: {
            labels: chartData.niveauxEcole, // Années d'expérience professionnelle
            datasets: [{
                label: 'Revenu moyen (EURO)',  // Label pour la barre
                data: chartData.moySalaire,   // Données des salaires moyens
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Couleur de fond des barres
                borderColor: 'rgba(75, 192, 192, 1)',     // Couleur du bord des barres
                borderWidth: 1, // Largeur du bord
                barThickness: 30, // Épaisseur des barres
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)', // Couleur au survol
                hoverBorderColor: 'rgba(75, 192, 192, 1)' // Bord au survol
            }]
        },
        options: {
            responsive: true, // Graphique réactif
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Niveau d'etude"
                    },
                    ticks: {
                        autoSkip: false, // Ne pas couper les labels
                        maxRotation: 45, // Limiter la rotation des labels à 45 degrés
                        minRotation: 0
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Revenu moyen (EURO)"
                    },
                    beginAtZero: true, // Commencer l'axe Y à zéro
                    ticks: {
                        callback: function(value) { // Afficher les valeurs avec des séparateurs pour les milliers
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}


$(document).ready(function() {
    function chargerDonnees() {
        const continent = $('#continentSelector').val();
        let jsonFile = '';

        if (continent === 'Amerique') {
            jsonFile = 'survey_results_NA.json';
        } else if (continent === 'Europe') {
            jsonFile = 'survey_results_WE.json';
        }

        recupDonnee(jsonFile).then(function(data) {
            const pays = $('#paysSelector').val();
            const moyenne = calculMoy(data, pays);
            displayChart(moyenne); 
            paysSelector(data, pays); 
        });
    }
    $('#continentSelector').change(function() {
        chargerDonnees();
    });

    $('#paysSelector').change(function() {
        chargerDonnees();
    });
    chargerDonnees(); // faire cela car si l'on change de pays puis de continent on aura pas de graphique au depart 
});
