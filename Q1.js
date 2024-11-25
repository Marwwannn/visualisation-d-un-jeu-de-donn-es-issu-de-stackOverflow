function recupDonnee(lien) {
    return $.getJSON(lien)
        .fail(function() {
            console.error('Erreur lors du chargement du fichier JSON.');
        });
}

function calculMoy(data, paysSelectione) {
    const objet = {}; // faire un objet pour le compteur et stocker le salaire par année

    const limiteSalaire = 100000000; // limite le salaire car il y a une donnée faussée

    data.forEach(entry => {
        const annee = parseInt(entry.YearsCodePro); // ou YearPro?
        const salaire = parseInt(entry.CompTotal);

        if ((paysSelectione === 'tous' || entry.Country === paysSelectione) &&
            !isNaN(annee) && !isNaN(salaire) && salaire < limiteSalaire) {

            if (!objet[annee]) {
                objet[annee] = { totalsalaire: 0, count: 0 };
            }
            const salaireEUR = salaire * 0.91 // convertion en euro
            objet[annee].totalsalaire += salaireEUR;
            objet[annee].count += 1;    
        }
    });

    const anneeCodePro = [];
    const moySalaire = [];
    for (const annee in objet) {
        anneeCodePro.push(parseInt(annee));
        const average = objet[annee].totalsalaire / objet[annee].count; // Calcul de la moyenne
        moySalaire.push(average);
    }

    return { anneeCodePro, moySalaire };
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

    //quand on change de continent ou de pays detruit l'ancien graphique
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line', // Type de graphique 'line' pour une courbe
        data: {
            labels: chartData.anneeCodePro, // Années d'expérience professionnelle
            datasets: [{
                label: 'Revenu moyen (USD)', // Titre de la courbe
                data: chartData.moySalaire, // Données des salaires moyens
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Couleur de fond (transparente)
                borderColor: 'rgba(255, 50, 120, 1)', // Couleur de la courbe
                borderWidth: 2, // Épaisseur de la courbe
                tension: 0.3, // Lissage de la courbe
                pointRadius: 3, // Taille des points sur la courbe
                pointBackgroundColor: 'rgba(255, 50, 120, 1)' // Couleur des points
            }]
        },
        options: {
            responsive: true, // Graphique réactif
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Annees d'experience professionnelle"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Revenu moyen (EURO)"
                    },
                    beginAtZero: true // Commencer l'axe Y à zéro
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
