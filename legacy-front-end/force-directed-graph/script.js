// National Contiguity - Force Directed Graph

// Configuration
const config = {
    width: 800,
    height: 600,
    nodeRadius: 20,
    linkDistance: 100,
    chargeStrength: -300,
    flagSize: 16
};

// Global variables
let svg, simulation, nodes, links, nodeElements, linkElements, labelElements;
let showLabels = true;
let zoomTransform = d3.zoomIdentity;

// DOM elements
const graphArea = document.getElementById('graphArea');
const loadingElement = document.getElementById('loading');
const nodeCountElement = document.getElementById('nodeCount');
const linkCountElement = document.getElementById('linkCount');
const totalCountriesElement = document.getElementById('totalCountries');
const totalBordersElement = document.getElementById('totalBorders');
const mostConnectedElement = document.getElementById('mostConnected');
const isolatedCountriesElement = document.getElementById('isolatedCountries');
const countryDetailsElement = document.getElementById('countryDetails');

// Control buttons
const resetBtn = document.getElementById('resetBtn');
const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadData();
});

// Event listeners
function setupEventListeners() {
    resetBtn.addEventListener('click', resetGraph);
    toggleLabelsBtn.addEventListener('click', toggleLabels);
    zoomInBtn.addEventListener('click', () => zoomByFactor(1.5));
    zoomOutBtn.addEventListener('click', () => zoomByFactor(0.67));
}

// Load data from API
async function loadData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json');
        const data = await response.json();

        nodes = data.nodes.map((node, index) => ({
            ...node,
            id: index,
            x: Math.random() * config.width,
            y: Math.random() * config.height,
            connections: 0
        }));

        links = data.links.map(link => ({
            source: typeof link.source === 'object' ? link.source.id : link.source,
            target: typeof link.target === 'object' ? link.target.id : link.target
        }));

        // Count connections for each node
        links.forEach(link => {
            nodes[link.source].connections++;
            nodes[link.target].connections++;
        });

        initializeGraph();
        updateStatistics();

    } catch (error) {
        console.error('Error loading data:', error);
        loadingElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading data. Please try again.</p>
        `;
    }
}

// Initialize D3 graph
function initializeGraph() {
    // Clear loading
    loadingElement.style.display = 'none';

    // Create SVG
    svg = d3.select('#graphArea')
        .append('svg')
        .attr('width', config.width)
        .attr('height', config.height)
        .style('background', '#f8f9fa');

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            zoomTransform = event.transform;
            svg.select('.graph-group').attr('transform', event.transform);
        });

    svg.call(zoom);

    // Create main group
    const g = svg.append('g')
        .attr('class', 'graph-group');

    // Create force simulation
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(config.linkDistance))
        .force('charge', d3.forceManyBody().strength(config.chargeStrength))
        .force('center', d3.forceCenter(config.width / 2, config.height / 2))
        .force('collision', d3.forceCollide(config.nodeRadius + 5));

    // Create links
    linkElements = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', 'link');

    // Create nodes
    nodeElements = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);

    // Add circles to nodes
    nodeElements.append('circle')
        .attr('r', config.nodeRadius)
        .attr('fill', d => getNodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    // Add flags to nodes
    nodeElements.each(function(d) {
        const node = d3.select(this);
        const flagUrl = `https://flagcdn.com/24x18/${d.code}.png`;

        // Create image element for flag
        const image = node.append('image')
            .attr('x', -config.flagSize / 2)
            .attr('y', -config.flagSize / 2)
            .attr('width', config.flagSize)
            .attr('height', config.flagSize)
            .attr('href', flagUrl)
            .attr('clip-path', 'circle()')
            .on('error', function() {
                // Fallback for missing flags
                d3.select(this).remove();
                node.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .attr('font-size', '12px')
                    .attr('fill', 'white')
                    .attr('font-weight', 'bold')
                    .text(d.code.toUpperCase());
            });
    });

    // Add labels
    labelElements = g.append('g')
        .attr('class', 'labels')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'label-group');

    labelElements.append('rect')
        .attr('class', 'country-label-bg')
        .attr('x', -25)
        .attr('y', -8)
        .attr('width', 50)
        .attr('height', 16)
        .attr('rx', 3);

    labelElements.append('text')
        .attr('class', 'country-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text(d => d.country.length > 10 ? d.country.substring(0, 10) + '...' : d.country);

    // Update positions on simulation tick
    simulation.on('tick', () => {
        linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
        labelElements.attr('transform', d => `translate(${d.x},${d.y + config.nodeRadius + 15})`);
    });

    // Update counts
    nodeCountElement.textContent = nodes.length;
    linkCountElement.textContent = links.length;
}

// Node color based on connections
function getNodeColor(node) {
    if (node.connections === 0) return '#6c757d'; // Isolated
    if (node.connections <= 2) return '#28a745'; // Few connections
    if (node.connections <= 5) return '#ffc107'; // Medium connections
    return '#dc3545'; // Many connections
}

// Drag functions
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
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
            <strong>${d.country}</strong><br>
            Code: ${d.code.toUpperCase()}<br>
            Borders: ${d.connections} countries
        `);

    // Update sidebar info
    updateCountryDetails(d);
}

function hideTooltip() {
    d3.select('.tooltip').remove();
}

// Control functions
function resetGraph() {
    simulation.restart();
    svg.transition().duration(750).call(
        d3.zoom().transform,
        d3.zoomIdentity
    );
}

function toggleLabels() {
    showLabels = !showLabels;
    labelElements.style('opacity', showLabels ? 1 : 0);
    toggleLabelsBtn.innerHTML = showLabels
        ? '<i class="fas fa-tag"></i> Hide Labels'
        : '<i class="fas fa-tag"></i> Show Labels';
}

function zoomByFactor(factor) {
    svg.transition().duration(300).call(
        d3.zoom().scaleBy,
        factor
    );
}

// Update country details in sidebar
function updateCountryDetails(country) {
    const flagUrl = `https://flagcdn.com/80x60/${country.code}.png`;

    countryDetailsElement.innerHTML = `
        <div class="flag-display">
            <img src="${flagUrl}" alt="${country.country} flag" class="flag-large"
                 onerror="this.style.display='none'">
        </div>
        <h4>${country.country}</h4>
        <p><strong>Country Code:</strong> ${country.code.toUpperCase()}</p>
        <p><strong>Bordering Countries:</strong> ${country.connections}</p>
        <p><strong>Connectivity:</strong> ${getConnectivityLabel(country.connections)}</p>
    `;
}

function getConnectivityLabel(connections) {
    if (connections === 0) return 'Isolated';
    if (connections <= 2) return 'Low';
    if (connections <= 5) return 'Medium';
    return 'High';
}

// Statistics
function updateStatistics() {
    const totalCountries = nodes.length;
    const totalBorders = links.length;

    // Find most connected country
    const mostConnected = nodes.reduce((max, node) =>
        node.connections > max.connections ? node : max
    );

    // Count isolated countries
    const isolatedCount = nodes.filter(node => node.connections === 0).length;

    // Update UI
    totalCountriesElement.textContent = totalCountries;
    totalBordersElement.textContent = totalBorders;
    mostConnectedElement.textContent = mostConnected.country;
    isolatedCountriesElement.textContent = isolatedCount;
}

// Handle window resize
window.addEventListener('resize', () => {
    if (svg) {
        // Could implement responsive resizing here
    }
});
