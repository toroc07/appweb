// Inicializar fechas actuales
const today = new Date();
const lastMonth = new Date();
lastMonth.setMonth(today.getMonth() - 1);

document.addEventListener('DOMContentLoaded', function() {
    // Establecer fechas por defecto
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    if (startDateInput && endDateInput) {
        startDateInput.valueAsDate = lastMonth;
        endDateInput.valueAsDate = today;
    }

    // Funcionalidad para el control deslizante
    const alertThreshold = document.getElementById('alertThreshold');
    const thresholdValue = document.getElementById('thresholdValue');
    if (alertThreshold && thresholdValue) {
        alertThreshold.addEventListener('input', function() {
            thresholdValue.textContent = this.value + '%';
        });
    }

    // Funcionalidad para el menú móvil
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Funcionalidad para el modo oscuro
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark');
        });
    }

    // Funcionalidad para el menú contextual
    const chartContainers = document.querySelectorAll('.chart-container');
    const contextMenu = document.getElementById('contextMenu');
    if (chartContainers.length > 0 && contextMenu) {
        chartContainers.forEach(container => {
            container.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
                contextMenu.classList.add('active');
            });
        });

        document.addEventListener('click', function() {
            contextMenu.classList.remove('active');
        });
    }

    // Funcionalidad para los botones de pantalla completa
    const fullscreenButtons = document.querySelectorAll('.fullscreen-btn');
    if (fullscreenButtons.length > 0) {
        fullscreenButtons.forEach(button => {
            button.addEventListener('click', function() {
                const container = this.closest('.chart-container');
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(err => {
                        console.log(`Error al intentar mostrar a pantalla completa: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            });
        });
    }

    // Simulación de actualización de datos
    const updateButton = document.getElementById('updateButton');
    if (updateButton) {
        updateButton.addEventListener('click', function() {
            const originalContent = this.innerHTML;
            this.innerHTML = `
                <svg class="btn-icon animate-spin" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                Actualizando...
            `;

            setTimeout(() => {
                this.innerHTML = originalContent;
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = '¡Datos actualizados con éxito!';
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 3000);

                // Reinicializar dashboard
                if (typeof initializeDashboard === 'function') {
                    initializeDashboard();
                }
            }, 1500);
        });
    }

    // Mejorar la experiencia en dispositivos móviles
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    });
});

// =============================================================================
// DASHBOARD INTERACTIVO DE CALIDAD DEL AIRE - ITALIA (2004-2005)
// Versión JavaScript para Replit
// Dataset: UCI Air Quality Dataset (Datos sintéticos realistas)
// =============================================================================

console.log("🌬️ DASHBOARD DE CALIDAD DEL AIRE - ITALIA");
console.log("=".repeat(50));
console.log("✅ Iniciando análisis de datos ambientales...");

// Variables globales
let airQualityData = [];
let currentFilters = {
    contaminants: new Set(['CO(GT)', 'C6H6(GT)', 'NOx(GT)', 'NO2(GT)']),
    startDate: new Date(2004, 2, 1),  // 1 Marzo 2004
    endDate: new Date(2005, 3, 30)    // 30 Abril 2005
};
const contaminants = ['CO(GT)', 'C6H6(GT)', 'NOx(GT)', 'NO2(GT)'];
const meteorological = ['T', 'RH', 'AH'];

// =============================================================================
// 1. GENERACIÓN DE DATOS SINTÉTICOS REALISTAS
// =============================================================================

function generateRealisticAirQualityData() {
    console.log("\n🔄 Generando dataset sintético...");

    const data = [];
    const startDate = new Date(2004, 2, 1);
    const endDate = new Date(2005, 3, 30);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const hour = currentDate.getHours();
        const dayOfWeek = currentDate.getDay(); // 0=Sunday, 6=Saturday
        const month = currentDate.getMonth() + 1;

        // Factores de variación realistas

        // Factor de tráfico (mayor contaminación en horas pico y días laborables)
        let trafficFactor = 1.0;
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lunes a Viernes
            if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
                trafficFactor = 1.8; // Horas pico
            } else if (hour >= 10 && hour <= 16) {
                trafficFactor = 1.3; // Horas de trabajo
            }
        } else {
            trafficFactor = 0.7; // Fin de semana
        }

        // Factor estacional (más contaminación en invierno)
        const seasonalFactor = 1 + 0.4 * Math.sin((month - 6) / 12 * 2 * Math.PI);

        // Factor meteorológico aleatorio
        let weatherFactor = normalRandom(1, 0.2);
        weatherFactor = Math.max(0.5, Math.min(1.5, weatherFactor));

        const basePollution = trafficFactor * seasonalFactor * weatherFactor;

        // Generar valores de contaminantes
        const co = Math.max(0.1, normalRandom(2.0 * basePollution, 0.8));
        const c6h6 = Math.max(1.0, normalRandom(11.0 * basePollution, 4.0));
        const nox = Math.max(10, normalRandom(200 * basePollution, 100));
        const no2 = Math.max(5, normalRandom(112 * basePollution, 60));

        // Variables meteorológicas
        const tempBase = 18;
        const seasonalTemp = 12 * Math.sin((month - 3) / 12 * 2 * Math.PI);
        const dailyTemp = 5 * Math.sin((hour - 12) / 24 * 2 * Math.PI);
        const temperature = tempBase + seasonalTemp + dailyTemp + normalRandom(0, 3);

        const rhBase = 50;
        const seasonalRh = 20 * Math.sin((month - 9) / 12 * 2 * Math.PI);
        const humidity = Math.max(10, Math.min(95, rhBase + seasonalRh + normalRandom(0, 15)));

        const absHumidity = Math.max(0.5, 1.2 + 0.1 * (temperature - 15) + normalRandom(0, 0.3));

        const season = month >= 12 || month <= 2 ? 'Invierno' :
                      month >= 3 && month <= 5 ? 'Primavera' :
                      month >= 6 && month <= 8 ? 'Verano' : 'Otoño';

        data.push({
            'Datetime': new Date(currentDate),
            'Date': formatDate(currentDate),
            'Time': formatTime(currentDate),
            'CO(GT)': Math.round(co * 100) / 100,
            'C6H6(GT)': Math.round(c6h6 * 10) / 10,
            'NOx(GT)': Math.round(nox),
            'NO2(GT)': Math.round(no2),
            'T': Math.round(temperature * 10) / 10,
            'RH': Math.round(humidity * 10) / 10,
            'AH': Math.round(absHumidity * 100) / 100,
            'Hour': hour,
            'DayOfWeek': dayOfWeek,
            'Month': month,
            'Season': season
        });

        // Incrementar hora
        currentDate.setHours(currentDate.getHours() + 1);
    }

    console.log(`✅ Dataset generado: ${data.length.toLocaleString()} registros horarios`);
    console.log(`📅 Período: ${data[0].Datetime.toLocaleDateString()} a ${data[data.length-1].Datetime.toLocaleDateString()}`);

    return data;
}

function applyFilters(data) {
    return data.filter(record => {
        const recordDate = record.Datetime;
        const isContaminantSelected = Array.from(currentFilters.contaminants).some(c => record[c] !== undefined);
        
        return (
            isContaminantSelected &&
            recordDate >= currentFilters.startDate &&
            recordDate <= currentFilters.endDate
        );
    });
}

function setupFilterListeners() {
    // Controlador para checkboxes de contaminantes
    document.querySelectorAll('input[name="contaminant"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                currentFilters.contaminants.add(checkbox.value);
            } else {
                currentFilters.contaminants.delete(checkbox.value);
            }
        });
    });

    // Controlador para fechas
    document.getElementById('start-date').addEventListener('change', (e) => {
        currentFilters.startDate = new Date(e.target.value);
    });

    document.getElementById('end-date').addEventListener('change', (e) => {
        currentFilters.endDate = new Date(e.target.value);
    });
}

// =============================================================================
// 3. ACTUALIZACIÓN DE COMPONENTES
// =============================================================================

async function updateDashboard() {
    try {
        document.getElementById('loading').style.display = 'block';
        
        // Regenerar datos con los filtros actuales
        const filteredData = applyFilters(airQualityData);
        
        // Actualizar estadísticas
        displayDatasetInfo(filteredData);
        displayPollutantStats(filteredData);
        
        // Actualizar gráficos
        await refreshCharts(filteredData);
        
        // Actualizar KPIs
        const kpis = calculateEnvironmentalKPIs(filteredData);
        displayKPIs(kpis);

    } catch (error) {
        console.error("Error actualizando dashboard:", error);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function refreshCharts(data) {
    const charts = [
        { func: createMainDashboard, id: 'main-dashboard' },
        { func: createCorrelationMatrix, id: 'correlation-chart' },
        { func: createDistributionChart, id: 'distribution-chart' },
        { func: createHourlyPatterns, id: 'hourly-chart' },
        { func: createWeeklyPatterns, id: 'weekly-chart' },
        { func: createSeasonalAnalysis, id: 'seasonal-chart' },
        { func: createHeatmap, id: 'heatmap-chart' }
    ];

    for (const chart of charts) {
        const element = document.getElementById(chart.id);
        if (element) {
            element.style.display = 'none';
            await new Promise(resolve => setTimeout(resolve, 300));
            chart.func(data);
            element.style.display = 'block';
        }
    }
}

// Función para generar números aleatorios con distribución normal
function normalRandom(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    return mean + stdDev * randStdNormal;
}

// Funciones de formateo
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// =============================================================================
// 2. FUNCIONES DE ANÁLISIS DE DATOS
// =============================================================================

function calculateStatistics(data, variable) {
    const values = data.map(d => d[variable]).filter(v => !isNaN(v));
    values.sort((a, b) => a - b);

    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const min = values[0];
    const max = values[n - 1];
    const q25 = values[Math.floor(n * 0.25)];
    const median = values[Math.floor(n * 0.5)];
    const q75 = values[Math.floor(n * 0.75)];

    return { mean, min, max, q25, median, q75 };
}

function calculateCorrelation(data, var1, var2) {
    const values1 = data.map(d => d[var1]);
    const values2 = data.map(d => d[var2]);

    const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
    const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < values1.length; i++) {
        const diff1 = values1[i] - mean1;
        const diff2 = values2[i] - mean2;

        numerator += diff1 * diff2;
        sumSq1 += diff1 * diff1;
        sumSq2 += diff2 * diff2;
    }

    return numerator / Math.sqrt(sumSq1 * sumSq2);
}

function aggregateByDate(data) {
    const dateGroups = {};

    data.forEach(record => {
        const dateStr = record.Date;
        if (!dateGroups[dateStr]) {
            dateGroups[dateStr] = {
                date: record.Datetime,
                'CO(GT)': [],
                'C6H6(GT)': [],
                'NOx(GT)': [],
                'NO2(GT)': [],
                'T': [],
                'RH': []
            };
        }

        contaminants.concat(['T', 'RH']).forEach(variable => {
            dateGroups[dateStr][variable].push(record[variable]);
        });
    });

    return Object.values(dateGroups).map(group => {
        const result = { date: group.date };
        contaminants.concat(['T', 'RH']).forEach(variable => {
            result[variable] = group[variable].reduce((sum, val) => sum + val, 0) / group[variable].length;
        });
        return result;
    });
}

// =============================================================================
// 3. VISUALIZACIONES INTERACTIVAS
// =============================================================================

function createMainDashboard(data) {
    console.log("\n🔄 Creando dashboard principal...");

    const dailyData = aggregateByDate(data);

    const fig = {
        data: [],
        layout: {
            title: {
                text: '<b>🌬️ DASHBOARD DE CALIDAD DEL AIRE - SERIES TEMPORALES</b><br><sub>Promedios diarios - Italia 2004-2005</sub>',
                x: 0.5,
                font: { size: 16 }
            },
            grid: { rows: 3, columns: 2, pattern: 'independent' },
            height: 800,
            showlegend: false
        }
    };

    const variables = [
        { var: 'CO(GT)', row: 1, col: 1, color: 'red', title: 'Monóxido de Carbono (CO)' },
        { var: 'C6H6(GT)', row: 1, col: 2, color: 'blue', title: 'Benceno (C6H6)' },
        { var: 'NOx(GT)', row: 2, col: 1, color: 'orange', title: 'Óxidos de Nitrógeno (NOx)' },
        { var: 'NO2(GT)', row: 2, col: 2, color: 'green', title: 'Dióxido de Nitrógeno (NO2)' },
        { var: 'T', row: 3, col: 1, color: 'purple', title: 'Temperatura' },
        { var: 'RH', row: 3, col: 2, color: 'brown', title: 'Humedad Relativa' }
    ];

    variables.forEach((config, index) => {
        fig.data.push({
            x: dailyData.map(d => d.date),
            y: dailyData.map(d => d[config.var]),
            type: 'scatter',
            mode: 'lines',
            line: { color: config.color, width: 2 },
            name: config.var,
            xaxis: `x${index + 1}`,
            yaxis: `y${index + 1}`
        });

        fig.layout[`xaxis${index + 1}`] = {
            domain: index % 2 === 0 ? [0, 0.48] : [0.52, 1],
            anchor: `y${index + 1}`,
            title: 'Fecha'
        };

        fig.layout[`yaxis${index + 1}`] = {
            domain: index < 2 ? [0.7, 1] : index < 4 ? [0.36, 0.66] : [0, 0.3],
            anchor: `x${index + 1}`,
            title: config.title
        };
    });

    Plotly.newPlot('mainChart', fig.data, fig.layout, {responsive: true});
}

function createCorrelationMatrix(data) {
    console.log("\n🔄 Generando matriz de correlaciones...");

    const allVars = [...contaminants, ...meteorological];
    const correlationMatrix = [];

    for (let i = 0; i < allVars.length; i++) {
        const row = [];
        for (let j = 0; j < allVars.length; j++) {
            if (i === j) {
                row.push(1);
            } else {
                const corr = calculateCorrelation(data, allVars[i], allVars[j]);
                row.push(corr);
            }
        }
        correlationMatrix.push(row);
    }

    const trace = {
        z: correlationMatrix,
        x: allVars,
        y: allVars,
        type: 'heatmap',
        colorscale: 'RdBu',
        reversescale: true,
        showscale: true,
        text: correlationMatrix.map(row => 
            row.map(val => val.toFixed(2))
        ),
        texttemplate: '%{text}',
        textfont: { size: 12 }
    };

    const layout = {
        title: {
            text: '🔗 MATRIZ DE CORRELACIÓN ENTRE VARIABLES',
            x: 0.5,
            font: { size: 16 }
        },
        height: 600,
        xaxis: { side: 'bottom' },
        yaxis: { side: 'left' }
    };

    Plotly.newPlot('correlationChart', [trace], layout, {responsive: true});
}

function createDistributionChart(data) {
    console.log("\n🔄 Creando análisis de distribuciones...");

    const colors = ['red', 'blue', 'orange', 'green'];
    const traces = [];

    contaminants.forEach((variable, index) => {
        traces.push({
            x: data.map(d => d[variable]),
            type: 'histogram',
            name: variable,
            marker: { color: colors[index], opacity: 0.7 },
            nbinsx: 30,
            xaxis: `x${index + 1}`,
            yaxis: `y${index + 1}`
        });
    });

    const layout = {
        title: {
            text: '📊 DISTRIBUCIÓN DE CONCENTRACIONES DE CONTAMINANTES',
            x: 0.5,
            font: { size: 16 }
        },
        grid: { rows: 2, columns: 2, pattern: 'independent' },
        height: 600,
        showlegend: false
    };

    // Configurar subplots
    for (let i = 0; i < 4; i++) {
        layout[`xaxis${i + 1}`] = {
            domain: i % 2 === 0 ? [0, 0.48] : [0.52, 1],
            anchor: `y${i + 1}`,
            title: contaminants[i]
        };

        layout[`yaxis${i + 1}`] = {
            domain: i < 2 ? [0.55, 1] : [0, 0.45],
            anchor: `x${i + 1}`,
            title: 'Frecuencia'
        };
    }

    Plotly.newPlot('distributionChart', traces, layout, {responsive: true});
}

function createHourlyPatterns(data) {
    console.log("\n🔄 Analizando patrones temporales...");

    // Agrupar por hora
    const hourlyGroups = {};
    for (let hour = 0; hour < 24; hour++) {
        hourlyGroups[hour] = { hour };
        contaminants.forEach(variable => {
            hourlyGroups[hour][variable] = [];
        });
    }

    data.forEach(record => {
        const hour = record.Hour;
        contaminants.forEach(variable => {
            hourlyGroups[hour][variable].push(record[variable]);
        });
    });

    const hourlyData = Object.values(hourlyGroups).map(group => {
        const result = { hour: group.hour };
        contaminants.forEach(variable => {
            result[variable] = group[variable].reduce((sum, val) => sum + val, 0) / group[variable].length;
        });
        return result;
    });

    const colors = ['red', 'blue', 'orange', 'green'];
    const traces = contaminants.map((variable, index) => ({
        x: hourlyData.map(d => d.hour),
        y: hourlyData.map(d => d[variable]),
        type: 'scatter',
        mode: 'lines+markers',
        name: variable,
        line: { color: colors[index], width: 3 },
        marker: { size: 6 }
    }));

    const layout = {
        title: {
            text: '⏰ PATRONES HORARIOS DE CONTAMINANTES<br><sub>Promedio por hora del día</sub>',
            x: 0.5,
            font: { size: 16 }
        },
        xaxis: { title: 'Hora del día' },
        yaxis: { title: 'Concentración promedio' },
        height: 500,
        hovermode: 'x unified'
    };

    Plotly.newPlot('hourlyChart', traces, layout, {responsive: true});
}

function createWeeklyPatterns(data) {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Agrupar por día de la semana
    const weeklyGroups = {};
    for (let day = 0; day < 7; day++) {
        weeklyGroups[day] = { day };
        contaminants.forEach(variable => {
            weeklyGroups[day][variable] = [];
        });
    }

    data.forEach(record => {
        const day = record.DayOfWeek;
        contaminants.forEach(variable => {
            weeklyGroups[day][variable].push(record[variable]);
        });
    });

    const weeklyData = Object.values(weeklyGroups).map(group => {
        const result = { day: group.day };
        contaminants.forEach(variable => {
            result[variable] = group[variable].reduce((sum, val) => sum + val, 0) / group[variable].length;
        });
        return result;
    });

    const colors = ['red', 'blue', 'orange', 'green'];
    const traces = contaminants.map((variable, index) => ({
        x: dayNames,
        y: weeklyData.map(d => d[variable]),
        type: 'bar',
        name: variable,
        marker: { color: colors[index], opacity: 0.8 }
    }));

    const layout = {
        title: {
            text: '📅 PATRONES SEMANALES DE CONTAMINANTES<br><sub>Promedio por día de la semana</sub>',
            x: 0.5,
            font: { size: 16 }
        },
        xaxis: { title: 'Día de la semana' },
        yaxis: { title: 'Concentración promedio' },
        height: 500,
        barmode: 'group'
    };

    Plotly.newPlot('weeklyChart', traces, layout, {responsive: true});
}

function createSeasonalAnalysis(data) {
    console.log("\n🔄 Generando análisis estacional...");

    const seasons = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
    const seasonColors = ['green', 'orange', 'brown', 'blue'];
    const categories = [...contaminants, 'T', 'RH'];

    // Agrupar por estación
    const seasonalGroups = {};
    seasons.forEach(season => {
        seasonalGroups[season] = {};
        categories.forEach(variable => {
            seasonalGroups[season][variable] = [];
        });
    });

    data.forEach(record => {
        const season = record.Season;
        categories.forEach(variable => {
            seasonalGroups[season][variable].push(record[variable]);
        });
    });

    // Calcular promedios por estación
    const seasonalData = {};
    seasons.forEach(season => {
        seasonalData[season] = {};
        categories.forEach(variable => {
            const values = seasonalGroups[season][variable];
            seasonalData[season][variable] = values.reduce((sum, val) => sum + val, 0) / values.length;
        });
    });

    // Normalizar valores para el gráfico radar
    const maxValues = {};
    categories.forEach(variable => {
        maxValues[variable] = Math.max(...data.map(d => d[variable]));
    });

    const traces = seasons.map((season, index) => {
        const values = categories.map(variable => {
            const val = seasonalData[season][variable];
            return (val / maxValues[variable]) * 100;
        });

        return {
            type: 'scatterpolar',
            r: values,
            theta: categories,
            fill: 'toself',
            name: season,
            line: { color: seasonColors[index] }
        };
    });

    const layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 100]
            }
        },
        title: {
            text: '🔄 ANÁLISIS ESTACIONAL (Valores Normalizados)',
            x: 0.5,
            font: { size: 16 }
        },
        height: 600,
        showlegend: true
    };

    Plotly.newPlot('seasonalChart', traces, layout, {responsive: true});
}

function createHeatmap(data) {
    console.log("\n🔄 Creando mapa de calor temporal...");

    // Crear matriz de datos: horas vs meses
    const heatmapData = Array(24).fill().map(() => Array(12).fill(0));
    const counts = Array(24).fill().map(() => Array(12).fill(0));

    data.forEach(record => {
        const hour = record.Hour;
        const month = record.Month - 1; // 0-based
        const co = record['CO(GT)'];

        heatmapData[hour][month] += co;
        counts[hour][month]++;
    });

    // Calcular promedios
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 12; m++) {
            if (counts[h][m] > 0) {
                heatmapData[h][m] = heatmapData[h][m] / counts[h][m];
            }
        }
    }

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const trace = {
        z: heatmapData,
        x: monthNames,
        y: Array.from({length: 24}, (_, i) => i),
        type: 'heatmap',
        colorscale: 'Reds',
        showscale: true,
        colorbar: {
            title: 'CO (mg/m³)'
        }
    };

    const layout = {
        title: {
            text: '🔥 MAPA DE CALOR: CONCENTRACIÓN DE CO POR HORA Y MES',
            x: 0.5,
            font: { size: 16 }
        },
        xaxis: { title: 'Mes' },
        yaxis: { title: 'Hora del día' },
        height: 600
    };

    Plotly.newPlot('heatmapChart', [trace], layout, {responsive: true});
}

// =============================================================================
// 4. MÉTRICAS Y KPIs AMBIENTALES
// =============================================================================

function calculateEnvironmentalKPIs(data) {
    console.log("\n📊 Calculando métricas ambientales...");

    const limits = {
        'CO(GT)': 10,    // mg/m³
        'C6H6(GT)': 5,   // µg/m³
        'NOx(GT)': 200,  // ppb
        'NO2(GT)': 200   // µg/m³
    };

    const kpis = {};

    contaminants.forEach(pollutant => {
        const values = data.map(d => d[pollutant]);
        const limit = limits[pollutant];

        const sortedValues = [...values].sort((a, b) => a - b);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const max = Math.max(...values);
        const percentil95 = sortedValues[Math.floor(sortedValues.length * 0.95)];
        const exceedances = values.filter(val => val > limit).length;
        const exceedancePercentage = (exceedances / values.length) * 100;

        // Días críticos (concentraciones > 1.5 * límite)
        const criticalDays = new Set();
        data.forEach(record => {
            if (record[pollutant] > limit * 1.5) {
                criticalDays.add(record.Date);
            }
        });

        kpis[pollutant] = {
            promedio: mean,
            maximo: max,
            percentil95: percentil95,
            excedencias: exceedances,
            porcentajeExcedencias: exceedancePercentage,
            diasCriticos: criticalDays.size
        };
    });

    return kpis;
}

function displayDatasetInfo(data) {
    const infoDiv = document.getElementById('dataset-info');
    if (!infoDiv) return;

    const startDate = data[0].Datetime.toLocaleDateString();
    const endDate = data[data.length - 1].Datetime.toLocaleDateString();
    const days = Math.floor((data[data.length - 1].Datetime - data[0].Datetime) / (1000 * 60 * 60 * 24));

    infoDiv.innerHTML = `
        <div class="metric">
            <span class="metric-label">Registros totales:</span>
            <span class="metric-value">${data.length.toLocaleString()}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Variables:</span>
            <span class="metric-value">${Object.keys(data[0]).length}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Período temporal:</span>
            <span class="metric-value">${days} días</span>
        </div>
        <div class="metric">
            <span class="metric-label">Frecuencia:</span>
            <span class="metric-value">Mediciones horarias</span>
        </div>
        <div class="metric">
            <span class="metric-label">Desde:</span>
            <span class="metric-value">${startDate}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Hasta:</span>
            <span class="metric-value">${endDate}</span>
        </div>
    `;
}

function displayPollutantStats(data) {
    const statsDiv = document.getElementById('pollutant-stats');
    if (!statsDiv) return;

    let html = '';

    contaminants.forEach(pollutant => {
        const stats = calculateStatistics(data, pollutant);
        html += `
            <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>${pollutant}:</strong><br>
                <div class="metric">
                    <span class="metric-label">Promedio:</span>
                    <span class="metric-value">${stats.mean.toFixed(2)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Máximo:</span>
                    <span class="metric-value">${stats.max.toFixed(2)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Mediana:</span>
                    <span class="metric-value">${stats.median.toFixed(2)}</span>
                </div>
            </div>
        `;
    });

    statsDiv.innerHTML = html;
}

function displayKPIs(kpis) {
    const pollutantIds = ['co-metrics', 'c6h6-metrics', 'nox-metrics', 'no2-metrics'];

    contaminants.forEach((pollutant, index) => {
        const metricsDiv = document.getElementById(pollutantIds[index]);
        if (!metricsDiv) return;

        const metrics = kpis[pollutant];

        metricsDiv.innerHTML = `
            <div class="metric">
                <span class="metric-label">Concentración promedio:</span>
                <span class="metric-value">${metrics.promedio.toFixed(2)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Concentración máxima:</span>
                <span class="metric-value">${metrics.maximo.toFixed(2)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Percentil 95:</span>
                <span class="metric-value">${metrics.percentil95.toFixed(2)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Excedencias detectadas:</span>
                <span class="metric-value">${metrics.excedencias}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Porcentaje de excedencias:</span>
                <span class="metric-value">${metrics.porcentajeExcedencias.toFixed(1)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Días críticos:</span>
                <span class="metric-value">${metrics.diasCriticos}</span>
            </div>
        `;
    });
}

// =============================================================================
// 5. FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// =============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Configuración inicial
    setupFilterListeners();
    
    // Inicializar fechas en los inputs
    document.getElementById('start-date').value = '2004-03-01';
    document.getElementById('end-date').value = '2005-04-30';
    
    // Generar datos iniciales
    airQualityData = generateRealisticAirQualityData();
    
    // Configurar botón de actualización
    document.getElementById('updateButton').addEventListener('click', async () => {
        await updateDashboard();
    });

    // Carga inicial del dashboard
    await updateDashboard();
});

async function initializeDashboard() {
    try {

        // Regenerar datos con los filtros actuales
        const filteredData = applyFilters(airQualityData);

        // Ocultar loading
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // Mostrar estadísticas básicas
        const statsSection = document.getElementById('stats-section');
        if (statsSection) {
            statsSection.style.display = 'grid';
            displayDatasetInfo(filteredData);
            displayPollutantStats(filteredData);
        }

        const kpis = calculateEnvironmentalKPIs(filteredData);
        const kpisSection = document.getElementById('kpis-section');
        if (kpisSection) {
            kpisSection.style.display = 'grid';
            displayKPIs(kpis);
        }

        console.log("✅ Dashboard completamente cargado");

    } catch (error) {
        console.error("❌ Error inicializando dashboard:", error);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div style="color: red;">
                    ❌ Error cargando el dashboard: ${error.message}
                </div>
            `;
        }
    }
}

// Inicializar dashboard cuando la página esté cargada
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Iniciando dashboard...");
    // Delay para asegurar que Plotly esté cargado
    setTimeout(() => {
        if (typeof Plotly !== 'undefined') {
            initializeDashboard();
        } else {
            console.error("❌ Plotly.js no está disponible");
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.innerHTML = `
                    <div style="color: red;">
                        ❌ Error: La librería Plotly.js no se pudo cargar correctamente.
                    </div>
                `;
            }
        }
    }, 1000);
});

// ===== SISTEMA DE DOCUMENTACIÓN =====
const documentationContent = {
    'co-filter': {
        title: 'Monóxido de Carbono (CO)',
        content: 'Gas tóxico producido por combustión incompleta de materiales carbonosos. Niveles peligrosos superan 35 ppm (partes por millón).',
        referencia: 'EPA Air Quality Standards 2024'
    }
};

// Tooltips dinámicos
document.querySelectorAll('[data-tooltip]').forEach(el => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-documentation';
    tooltip.textContent = el.dataset.tooltip;
    document.body.appendChild(tooltip);

    el.addEventListener('mousemove', (e) => {
        tooltip.style.left = `${e.pageX + 15}px`;
        tooltip.style.top = `${e.pageY + 15}px`;
        tooltip.style.display = 'block';
    });

    el.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});

// Panel de documentación
document.getElementById('docButton').addEventListener('click', () => {
    document.getElementById('docPanel').classList.add('active');
});

document.getElementById('closeDocPanel').addEventListener('click', () => {
    document.getElementById('docPanel').classList.remove('active');
});

// Carga de contenido documental
document.querySelectorAll('.documentable').forEach(el => {
    el.addEventListener('click', () => {
        const key = el.dataset.docKey;
        const doc = documentationContent[key];
        const content = `
            <h4>${doc.title}</h4>
            <p>${doc.content}</p>
            ${doc.referencia ? `<div class="doc-reference"><em>Referencia:</em> ${doc.referencia}</div>` : ''}
        `;
        document.querySelector('.doc-content').innerHTML = content;
    });
});

// Referencias a elementos
const docButton = document.getElementById('docButton');
const docPanel = document.getElementById('docPanel');
const closeDocPanel = document.getElementById('closeDocPanel');

// Mostrar el panel al hacer clic en el botón flotante
if (docButton && docPanel) {
  docButton.addEventListener('click', () => {
    docPanel.classList.add('active');
  });
}

// Ocultar el panel al hacer clic en el botón de cerrar
if (closeDocPanel && docPanel) {
  closeDocPanel.addEventListener('click', () => {
    docPanel.classList.remove('active');
  });
}
