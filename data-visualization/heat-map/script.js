// Chart dimensions and margins
const margin = { top: 100, right: 40, bottom: 120, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

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

// Color scale
const colorScale = d3.scaleQuantize()
  .range([
    "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf",
    "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"
  ]);

// Month names
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Fetch data and create chart
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(data => {
    const baseTemperature = data.baseTemperature;
    const dataset = data.monthlyVariance;

    // Process data
    dataset.forEach(d => {
      d.year = +d.year;
      d.month = +d.month;
      d.variance = +d.variance;
      d.temperature = baseTemperature + d.variance;
    });

    // Scales
    const xScale = d3.scaleBand()
      .domain(d3.range(d3.min(dataset, d => d.year), d3.max(dataset, d => d.year) + 1))
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(d3.range(1, 13))
      .range([0, height])
      .padding(0.05);

    colorScale.domain(d3.extent(dataset, d => d.variance));

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(year => year % 10 === 0))
      .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => months[month - 1]);

    // Add X axis
    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    // Add Y axis
    svg.append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    // Create cells
    svg.selectAll(".cell")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.variance))
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => d.temperature)
      .on("mouseover", (d, i) => {
        const monthName = months[d.month - 1];
        const variance = d.variance > 0 ? `+${d.variance.toFixed(1)}` : d.variance.toFixed(1);

        tooltip
          .attr("data-year", d.year)
          .html(`
            <div>${monthName} ${d.year}</div>
            <div>${d.temperature.toFixed(1)}℃</div>
            <div>${variance}℃ from base</div>
          `)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .classed("show", true);
      })
      .on("mouseout", () => {
        tooltip.classed("show", false);
      });

    // Legend
    const legendWidth = 400;
    const legendHeight = 20;
    const legendScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.variance))
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .tickFormat(d => `${d > 0 ? '+' : ''}${d.toFixed(1)}`)
      .ticks(10);

    const legend = d3.select("#legend")
      .append("svg")
      .attr("width", legendWidth + 60)
      .attr("height", legendHeight + 40)
      .append("g")
      .attr("transform", "translate(30,20)");

    // Create legend gradient
    const defs = legend.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    colorScale.range().forEach((color, i) => {
      linearGradient.append("stop")
        .attr("offset", `${i / (colorScale.range().length - 1) * 100}%`)
        .attr("stop-color", color);
    });

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    legend.append("g")
      .attr("transform", `translate(0,${legendHeight})`)
      .call(legendAxis);

    // Axis labels
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 30)
      .style("text-anchor", "middle")
      .text("Year");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .style("text-anchor", "middle")
      .text("Month");
  })
  .catch(error => {
    console.error("Error loading data:", error);
  });
