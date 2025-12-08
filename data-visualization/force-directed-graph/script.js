// Chart dimensions
const width = 900;
const height = 600;

// Create SVG
const svg = d3.select("#chart")
  .attr("width", width)
  .attr("height", height);

// Tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

// Color scale for genres
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Force simulation
const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(50))
  .force("charge", d3.forceManyBody().strength(-100))
  .force("center", d3.forceCenter(width / 2, height / 2));

// Fetch data and create graph
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/movie-data.json")
  .then(data => {
    const links = data.links;
    const nodes = data.nodes;

    // Process nodes
    nodes.forEach(node => {
      node.value = +node.value;
    });

    // Create links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Create nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", d => Math.sqrt(d.value) * 2)
      .attr("fill", d => colorScale(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", (d, i) => {
        tooltip
          .html(`
            <div>${d.title || d.id}</div>
            <div>Genre: ${getGenreName(d.group)}</div>
            <div>Value: ${d.value}</div>
          `)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .classed("show", true);
      })
      .on("mouseout", () => {
        tooltip.classed("show", false);
      });

    // Add labels
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.title || d.id)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Start simulation
    simulation
      .nodes(nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(links);

    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Create legend
    const genres = [...new Set(nodes.map(d => d.group))].sort();
    const legend = d3.select("#legend")
      .append("svg")
      .attr("width", 400)
      .attr("height", genres.length * 25 + 20)
      .append("g")
      .attr("transform", "translate(20,20)");

    const legendItems = legend.selectAll(".legend-item")
      .data(genres)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0,${i * 25})`);

    legendItems.append("circle")
      .attr("r", 8)
      .attr("fill", d => colorScale(d));

    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 5)
      .text(d => getGenreName(d))
      .style("font-size", "12px");

    function getGenreName(group) {
      const genreNames = {
        1: "Action",
        2: "Adventure",
        3: "Comedy",
        4: "Drama",
        5: "Animation"
      };
      return genreNames[group] || `Genre ${group}`;
    }
  })
  .catch(error => {
    console.error("Error loading data:", error);
  });
