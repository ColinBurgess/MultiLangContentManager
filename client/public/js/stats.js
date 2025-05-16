document.addEventListener('DOMContentLoaded', function() {
    // Cargar los datos de estadísticas
    loadStats();

    // Configurar el botón de actualizar
    document.getElementById('refreshStatsBtn').addEventListener('click', loadStats);
});

async function loadStats() {
    try {
        // En producción, esto se obtendría de la API
        // Para demostración, usaremos los datos en localStorage
        const contentData = JSON.parse(localStorage.getItem('contentData')) || [];

        // Actualizar contadores
        updateCounters(contentData);

        // Generar gráficos
        createLanguageDistributionChart(contentData);
        createPublicationTrendChart(contentData);
        createPopularTagsChart(contentData);
        createPublicationStatusChart(contentData);

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateCounters(contentData) {
    const totalCount = contentData.length;
    const publishedEsCount = contentData.filter(item => item.publishedEs).length;
    const publishedEnCount = contentData.filter(item => item.publishedEn).length;
    const pendingCount = contentData.filter(item => !item.publishedEs && !item.publishedEn).length;

    document.getElementById('totalContentCount').textContent = totalCount;
    document.getElementById('publishedEsCount').textContent = publishedEsCount;
    document.getElementById('publishedEnCount').textContent = publishedEnCount;
    document.getElementById('pendingCount').textContent = pendingCount;
}

function createLanguageDistributionChart(contentData) {
    const ctx = document.getElementById('languageDistribution').getContext('2d');

    // Datos para el gráfico
    const publishedEsOnly = contentData.filter(item => item.publishedEs && !item.publishedEn).length;
    const publishedEnOnly = contentData.filter(item => !item.publishedEs && item.publishedEn).length;
    const publishedBoth = contentData.filter(item => item.publishedEs && item.publishedEn).length;
    const notPublished = contentData.filter(item => !item.publishedEs && !item.publishedEn).length;

    // Si ya existe un gráfico, destruirlo
    if (window.languageChart) {
        window.languageChart.destroy();
    }

    // Crear el nuevo gráfico
    window.languageChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Solo Español', 'Solo Inglés', 'Ambos idiomas', 'No publicado'],
            datasets: [{
                data: [publishedEsOnly, publishedEnOnly, publishedBoth, notPublished],
                backgroundColor: ['#0284c7', '#10B981', '#8B5CF6', '#F59E0B']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#FFFFFF'
                    }
                }
            }
        }
    });
}

function createPublicationTrendChart(contentData) {
    const ctx = document.getElementById('publicationTrend').getContext('2d');

    // Agrupar contenido por mes de creación
    const monthlyData = {};

    contentData.forEach(item => {
        const date = new Date(item.createdAt || Date.now());
        const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;

        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                total: 0,
                publishedEs: 0,
                publishedEn: 0
            };
        }

        monthlyData[monthYear].total++;
        if (item.publishedEs) monthlyData[monthYear].publishedEs++;
        if (item.publishedEn) monthlyData[monthYear].publishedEn++;
    });

    // Ordenar por fecha
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const [monthA, yearA] = a.split('/').map(Number);
        const [monthB, yearB] = b.split('/').map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
    });

    // Si ya existe un gráfico, destruirlo
    if (window.trendChart) {
        window.trendChart.destroy();
    }

    // Crear el nuevo gráfico
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Total',
                    data: sortedMonths.map(month => monthlyData[month].total),
                    borderColor: '#A0AEC0',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Español',
                    data: sortedMonths.map(month => monthlyData[month].publishedEs),
                    borderColor: '#0284c7',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Inglés',
                    data: sortedMonths.map(month => monthlyData[month].publishedEn),
                    borderColor: '#10B981',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFFFFF'
                    }
                }
            }
        }
    });
}

function createPopularTagsChart(contentData) {
    const ctx = document.getElementById('popularTags').getContext('2d');

    // Contar frecuencia de etiquetas
    const tagCounts = {};

    contentData.forEach(item => {
        if (!item.tags) return;

        const tags = Array.isArray(item.tags)
            ? item.tags
            : item.tags.split(',').map(tag => tag.trim());

        tags.forEach(tag => {
            if (!tag) return;
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    // Ordenar por popularidad y tomar los 10 más populares
    const sortedTags = Object.keys(tagCounts)
        .sort((a, b) => tagCounts[b] - tagCounts[a])
        .slice(0, 10);

    // Si ya existe un gráfico, destruirlo
    if (window.tagsChart) {
        window.tagsChart.destroy();
    }

    // Crear el nuevo gráfico
    window.tagsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedTags,
            datasets: [{
                label: 'Frecuencia',
                data: sortedTags.map(tag => tagCounts[tag]),
                backgroundColor: '#0284c7'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFFFFF'
                    }
                }
            }
        }
    });
}

function createPublicationStatusChart(contentData) {
    const ctx = document.getElementById('publicationStatus').getContext('2d');

    // Contar los diferentes estados de publicación
    const bothPublished = contentData.filter(item => item.publishedEs && item.publishedEn).length;
    const onlyEsPublished = contentData.filter(item => item.publishedEs && !item.publishedEn).length;
    const onlyEnPublished = contentData.filter(item => !item.publishedEs && item.publishedEn).length;
    const nonePublished = contentData.filter(item => !item.publishedEs && !item.publishedEn).length;

    // Si ya existe un gráfico, destruirlo
    if (window.statusChart) {
        window.statusChart.destroy();
    }

    // Crear el nuevo gráfico
    window.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ambos publicados', 'Solo ES publicado', 'Solo EN publicado', 'Ninguno publicado'],
            datasets: [{
                data: [bothPublished, onlyEsPublished, onlyEnPublished, nonePublished],
                backgroundColor: ['#8B5CF6', '#0284c7', '#10B981', '#F59E0B']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFFFFF'
                    }
                }
            }
        }
    });
}