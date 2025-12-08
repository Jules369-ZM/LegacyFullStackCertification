// Chart dimensions and margins
const margin = { top: 100, right: 40, bottom: 40, left: 40 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

// Color scale for different categories
const colorScale = d3.scaleOrdinal()
  .range([
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5"
  ]);

// Create treemap layout
const treemap = d3.treemap()
  .size([width, height])
  .paddingInner(1)
  .paddingOuter(2)
  .paddingTop(20);

// Load data and create treemap
d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json")
  .then(data => {
    // Create root node
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Apply treemap layout
    treemap(root);

    // Create groups for each category
    const categories = svg.selectAll("g")
      .data(root.children)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Add category labels
    categories.append("text")
      .attr("class", "category-label")
      .attr("x", 5)
      .attr("y", 15)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#fff")
      .text(d => d.data.name);

    // Create tiles
    const tiles = categories.selectAll(".tile")
      .data(d => d.children)
      .enter()
      .append("rect")
      .attr("class", "tile")
      .attr("x", d => d.x0 - d.parent.x0)
      .attr("y", d => d.y0 - d.parent.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.category))
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .on("mouseover", (d, i) => {
        const revenue = d3.format("$,")(d.data.value);

        tooltip
          .html(`
            <div><strong>${d.data.name}</strong></div>
            <div>Category: ${d.data.category}</div>
            <div>Revenue: ${revenue}</div>
          `)
          .attr("data-value", d.data.value)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .classed("show", true);
      })
      .on("mouseout", () => {
        tooltip.classed("show", false);
      });

    // Add movie names to tiles (only if tile is large enough)
    categories.selectAll(".tile-label")
      .data(d => d.children.filter(movie =>
        (movie.x1 - movie.x0) > 60 && (movie.y1 - movie.y0) > 20
      ))
      .enter()
      .append("text")
      .attr("class", "tile-label")
      .attr("x", d => d.x0 - d.parent.x0 + 5)
      .attr("y", d => d.y0 - d.parent.y0 + 15)
      .style("font-size", "10px")
      .style("fill", "#fff")
      .style("pointer-events", "none")
      .text(d => {
        const name = d.data.name;
        const maxLength = Math.floor((d.x1 - d.x0) / 6);
        return name.length > maxLength ? name.substring(0, maxLength - 3) + "..." : name;
      });

    // Create legend
    const legendData = [...new Set(data.children.map(d => d.name))];
    const legendWidth = 800;
    const legendRectSize = 18;
    const legendSpacing = 4;

    const legend = d3.select("#legend")
      .append("svg")
      .attr("width", legendWidth)
      .attr("height", 200);

    const legendItems = legend.selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => {
        const itemsPerRow = Math.floor(legendWidth / 150);
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * 150}, ${row * 25})`;
      });

    legendItems.append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .attr("fill", d => colorScale(d));

    legendItems.append("text")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .style("font-size", "12px")
      .style("fill", "#333")
      .text(d => d);

  })
  .catch(error => {
    console.error("Error loading data:", error);
  });
