// Map Data Across the Globe - Meteorite Landings

// Configuration
const config = {
    width: 800,
    height: 500,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    minMass: 0,
    maxMass: 100000
};

// Global variables
let svg, projection, path, zoom;
let world, meteorites = [];
let currentFilter = 0;

// DOM elements
const mapArea = document.getElementById('mapArea');
const loadingElement = document.getElementById('loading');
const meteoriteCountElement = document.getElementById('meteoriteCount');
const totalMassElement = document.getElementById('totalMass');
const massFilter = document.getElementById('massFilter');
const massValue = document.getElementById('massValue');
const resetZoomBtn = document.getElementById('resetZoomBtn');
const toggleLegendBtn = document.getElementById('toggleLegendBtn');
const legend = document.getElementById('legend');
const meteoriteDetailsElement = document.getElementById('meteoriteDetails');

// Statistics elements
const statTotal = document.getElementById('statTotal');
const statAverage = document.getElementById('statAverage');
const statLargest = document.getElementById('statLargest');
const statRecent = document.getElementById('statRecent');
const statCountries = document.getElementById('statCountries');
const topMeteorites = document.getElementById('topMeteorites');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadData();
});

// Event listeners
function setupEventListeners() {
    massFilter.addEventListener('input', updateMassFilter);
    resetZoomBtn.addEventListener('click', resetZoom);
    toggleLegendBtn.addEventListener('click', toggleLegend);
}

// Load world map and meteorite data
async function loadData() {
    try {
        // Load world map data (using a free TopoJSON source)
        const worldResponse = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        world = await worldResponse.json();

        // Load meteorite data
        const meteoriteResponse = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json');
        const meteoriteData = await meteoriteResponse.json();

        // Process meteorite data
        meteorites = meteoriteData.features
            .filter(d => d.geometry && d.properties.mass)
            .map(d => ({
                name: d.properties.name,
                mass: parseFloat(d.properties.mass),
                year: d.properties.year ? new Date(d.properties.year).getFullYear() : 'Unknown',
                coordinates: d.geometry.coordinates,
                reclat: d.properties.reclat,
                reclong: d.properties.reclong
            }))
            .filter(d => !isNaN(d.mass) && d.mass > 0);

        initializeMap();
        updateStatistics();

    } catch (error) {
        console.error('Error loading data:', error);
        loadingElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading map data. Please try again.</p>
        `;
    }
}

// Initialize D3 map
function initializeMap() {
    // Clear loading
    loadingElement.style.display = 'none';

    // Create SVG
    svg = d3.select('#mapArea')
        .append('svg')
        .attr('width', config.width)
        .attr('height', config.height);

    // Create projection
    projection = d3.geoNaturalEarth1()
        .scale(150)
        .translate([config.width / 2, config.height / 2]);

    // Create path generator
    path = d3.geoPath().projection(projection);

    // Add zoom behavior
    zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);

    svg.call(zoom);

    // Create main group
    const g = svg.append('g');

    // Draw countries
    g.selectAll('.country')
        .data(topojson.feature(world, world.objects.countries).features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path);

    // Create meteorite group
    const meteoriteGroup = g.append('g')
        .attr('class', 'meteorites');

    // Add meteorite points
    updateMeteoritePoints();

    // Fit map to container
    const bounds = path.bounds(topojson.feature(world, world.objects.countries));
    const scale = 0.95 / Math.max(
        (bounds[1][0] - bounds[0][0]) / config.width,
        (bounds[1][1] - bounds[0][1]) / config.height
    );
    const translate = [
        config.width / 2 - scale * (bounds[1][0] + bounds[0][0]) / 2,
        config.height / 2 - scale * (bounds[1][1] + bounds[0][1]) / 2
    ];

    g.attr('transform', `translate(${translate}) scale(${scale})`);

    // Update display counts
    updateDisplayCounts();
}

// Update meteorite points based on current filter
function updateMeteoritePoints() {
    const filteredMeteorites = meteorites.filter(d => d.mass >= currentFilter);

    const meteoriteSelection = svg.select('.meteorites')
        .selectAll('.meteorite-point')
        .data(filteredMeteorites, d => d.name + d.year);

    // Remove old points
    meteoriteSelection.exit().remove();

    // Add new points
    meteoriteSelection.enter()
        .append('circle')
        .attr('class', 'meteorite-point')
        .attr('cx', d => projection([d.reclong, d.reclat])[0])
        .attr('cy', d => projection([d.reclong, d.reclat])[1])
        .attr('r', d => getRadius(d.mass))
        .attr('fill', d => getColor(d.mass))
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip)
        .on('click', d => updateMeteoriteDetails(d));

    // Update existing points
    meteoriteSelection
        .attr('r', d => getRadius(d.mass))
        .attr('fill', d => getColor(d.mass));
}

// Get radius based on mass
function getRadius(mass) {
    const minRadius = 2;
    const maxRadius = 15;
    const scale = d3.scaleSqrt()
        .domain([1, d3.max(meteorites, d => d.mass)])
        .range([minRadius, maxRadius]);

    return Math.max(minRadius, scale(mass));
}

// Get color based on mass
function getColor(mass) {
    if (mass < 1000) return '#28a745';      // Small - Green
    if (mass < 10000) return '#ffc107';     // Medium - Yellow
    if (mass < 50000) return '#fd7e14';     // Large - Orange
    return '#dc3545';                       // Huge - Red
}

// Tooltip functions
function showTooltip(event, d) {
    // Remove existing tooltip
    d3.select('.tooltip').remove();

    // Create new tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .html(`
            <h4>${d.name}</h4>
            <p><strong>Mass:</strong> ${d.mass.toLocaleString()} kg</p>
            <p><strong>Year:</strong> ${d.year}</p>
            <p><strong>Location:</strong> ${d.reclat?.toFixed(2) ?? 'N/A'}°, ${d.reclong?.toFixed(2) ?? 'N/A'}°</p>
        `);

    // Update sidebar details
    updateMeteoriteDetails(d);
}

function hideTooltip() {
    d3.select('.tooltip').remove();
}

// Update meteorite details in sidebar
function updateMeteoriteDetails(meteorite) {
    meteoriteDetailsElement.innerHTML = `
        <h4>${meteorite.name}</h4>
        <p><strong>Mass:</strong> <span class="mass-highlight">${meteorite.mass.toLocaleString()} kg</span></p>
        <p><strong>Year:</strong> ${meteorite.year}</p>
        <p><strong>Coordinates:</strong> ${meteorite.reclat?.toFixed(4) ?? 'N/A'}, ${meteorite.reclong?.toFixed(4) ?? 'N/A'}</p>
        <p><strong>Size Category:</strong> ${getSizeCategory(meteorite.mass)}</p>
    `;
}

function getSizeCategory(mass) {
    if (mass < 1000) return 'Small (< 1kg)';
    if (mass < 10000) return 'Medium (1-10kg)';
    if (mass < 50000) return 'Large (10-50kg)';
    return 'Massive (> 50kg)';
}

// Control functions
function updateMassFilter() {
    currentFilter = parseInt(massFilter.value);
    massValue.textContent = currentFilter.toLocaleString();
    updateMeteoritePoints();
    updateDisplayCounts();
}

function resetZoom() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
}

function toggleLegend() {
    const isHidden = legend.style.display === 'none';
    legend.style.display = isHidden ? 'block' : 'none';
    toggleLegendBtn.innerHTML = isHidden
        ? '<i class="fas fa-info-circle"></i> Hide Legend'
        : '<i class="fas fa-info-circle"></i> Show Legend';
}

function zoomed(event) {
    svg.select('g').attr('transform', event.transform);
}

// Update display counts
function updateDisplayCounts() {
    const filteredCount = meteorites.filter(d => d.mass >= currentFilter).length;
    const totalMass = meteorites
        .filter(d => d.mass >= currentFilter)
        .reduce((sum, d) => sum + d.mass, 0);

    meteoriteCountElement.textContent = filteredCount.toLocaleString();
    totalMassElement.textContent = (totalMass / 1000).toFixed(1) + ' tons';
}

// Statistics
function updateStatistics() {
    const validMeteorites = meteorites.filter(d => !isNaN(d.mass) && d.mass > 0);

    if (validMeteorites.length === 0) return;

    // Basic stats
    const total = validMeteorites.length;
    const average = validMeteorites.reduce((sum, d) => sum + d.mass, 0) / total;
    const largest = d3.max(validMeteorites, d => d.mass);
    const mostRecent = d3.max(validMeteorites.filter(d => d.year !== 'Unknown'), d => d.year);

    // Unique countries (rough estimate based on coordinates)
    const countries = new Set();
    validMeteorites.forEach(d => {
        if (d.reclat && d.reclong) {
            countries.add(`${Math.round(d.reclat)},${Math.round(d.reclong)}`);
        }
    });

    // Update UI
    statTotal.textContent = total.toLocaleString();
    statAverage.textContent = Math.round(average).toLocaleString() + ' kg';
    statLargest.textContent = largest.toLocaleString() + ' kg';
    statRecent.textContent = mostRecent;
    statCountries.textContent = countries.size;

    // Top 5 largest meteorites
    const top5 = validMeteorites
        .sort((a, b) => b.mass - a.mass)
        .slice(0, 5);

    topMeteorites.innerHTML = top5.map((d, i) => `
        <div class="top-item">
            <div class="name">${i + 1}. ${d.name}</div>
            <div class="mass">${d.mass.toLocaleString()} kg</div>
            <div class="year">${d.year}</div>
        </div>
    `).join('');
}

// Handle window resize
window.addEventListener('resize', () => {
    if (svg) {
        // Could implement responsive resizing here
    }
});
