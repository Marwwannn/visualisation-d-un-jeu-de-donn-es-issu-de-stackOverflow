let chartInstance = null; // Variable pour stocker l'instance du graphique

async function fetchData(continent) {
    try {
        const urls = {
            europe: "survey_results_WE.json",
            america: "survey_results_NA.json"
        };

        const url = urls[continent];
        if (!url) throw new Error(`Aucune URL trouvée pour le continent: ${continent}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur lors du chargement des données depuis ${url}`);
        
        return await response.json();
    } catch (error) {
        console.error(error.message);
        alert('Erreur lors du chargement des données. Vérifiez les fichiers JSON.');
        return null;
    }
}

function createOrUpdateChart(labels, data, chartType = 'line', title = 'Graphique') {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Si un graphique existe déjà, on met à jour ses données
    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = data;
        chartInstance.data.datasets[0].label = title;
        chartInstance.update();
    } else {
        // Sinon, on crée un nouveau graphique
        chartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,  // Commencer l'échelle à 0
                        min: 0,  // Définir une valeur minimale si nécessaire
                        title: {
                            display: true,
                            text: 'Valeurs'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Catégories'
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
    }
}

// Fonction pour regrouper les données et calculer la moyenne des revenus
function groupAndAverageData(experience, income) {
    const dataMap = {};

    // Définir un seuil raisonnable pour les revenus, ajustable selon tes données
    const incomeThreshold = 500000;  // Limite pour exclure les revenus trop élevés

    experience.forEach((exp, index) => {
        const currentIncome = income[index];

        // Vérifier si les valeurs sont valides
        if (isNaN(exp) || isNaN(currentIncome) || currentIncome < 0 || currentIncome > incomeThreshold) {
            console.warn(`Valeur ignorée à l'index ${index} : expérience ${exp}, revenu ${currentIncome}`);
            return;  // Ignorer cette valeur si elle est invalide
        }

        if (!dataMap[exp]) {
            dataMap[exp] = { sum: 0, count: 0 };
        }
        dataMap[exp].sum += currentIncome;  // Ajouter le revenu pour cette expérience
        dataMap[exp].count += 1;  // Compter le nombre d'entrées pour cette expérience
    });

    // Calculer les moyennes des revenus pour chaque expérience unique
    const uniqueExperience = Object.keys(dataMap).map(Number);  // Liste des expériences uniques
    const averageIncome = uniqueExperience.map(exp => {
        const average = dataMap[exp].sum / dataMap[exp].count;
        return average;  // Retourner la moyenne des revenus
    });

    return { uniqueExperience, averageIncome };
}


document.getElementById('continentSelector').addEventListener('change', async (event) => {
    const selectedContinent = event.target.value;
    const data = await fetchData(selectedContinent);

    if (data) {
        const experience = data.map(item => item.experience_years);
        const averageIncome = data.map(item => item.average_income);

        createOrUpdateChart(experience, averageIncome, 'bar', `Revenus moyens (${selectedContinent})`);
    }
});

// Chargement initial pour l'Europe
fetchData('europe').then(data => {
    if (data) {
        console.log('Données récupérées:', data);  // Vérifie les données

        // Créer des tableaux d'expérience et de revenus valides
        const filteredData = data.filter(item => {
            const experience = parseInt(item.WorkExp);
            const averageIncome = parseInt(item.CompTotal);
            return !isNaN(experience) && !isNaN(averageIncome) && experience >= 0 && averageIncome >= 0;  // Filtrer si les deux sont valides
        });

        // Extraire l'expérience et les revenus moyens après filtration
        const experience = filteredData.map(item => parseInt(item.WorkExp));
        const averageIncome = filteredData.map(item => parseInt(item.CompTotal));

        console.log('Expérience:', experience);  // Affiche les données d'expérience
        console.log('Revenus moyens:', averageIncome);  // Affiche les revenus moyens

        // Calculer la moyenne des revenus pour chaque expérience unique
        const { uniqueExperience, averageIncome: averagedIncome } = groupAndAverageData(experience, averageIncome);

        console.log('Expériences uniques:', uniqueExperience);
        console.log('Revenus moyens (moyenne):', averagedIncome);

        // Si les données sont valides, on crée ou met à jour le graphique
        if (uniqueExperience.length > 0 && averagedIncome.length > 0) {
            createOrUpdateChart(uniqueExperience, averagedIncome, 'line', 'Revenus moyens (Europe)');
        } else {
            console.error('Les données sont vides ou mal formatées.');
        }
    }
});
