// Chart dimensions and margins
const margin = { top: 60, right: 40, bottom: 80, left: 80 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

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

// Fetch data and create chart
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then(data => {
    const dataset = data.data;

    // Parse dates and GDP values
    dataset.forEach(d => {
      d[0] = new Date(d[0]);
      d[1] = +d[1];
    });

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(dataset, d => d[0]))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d[1])])
      .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y"));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `$${d3.format('.2s')(d)} Billion`);

    // Add X axis
    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    // Add Y axis
    svg.append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    // Create bars
    svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]))
      .attr("width", width / dataset.length)
      .attr("height", d => height - yScale(d[1]))
      .attr("data-date", d => d[0].toISOString().split('T')[0])
      .attr("data-gdp", d => d[1])
      .on("mouseover", (d, i) => {
        const date = d[0];
        const gdp = d[1];
        const formattedDate = d3.timeFormat("%B %Y")(date);
        const formattedGDP = d3.format(',')(gdp);

        tooltip
          .attr("data-date", date.toISOString().split('T')[0])
          .html(`${formattedDate}<br>$${formattedGDP} Billion`)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .classed("show", true);
      })
      .on("mouseout", () => {
        tooltip.classed("show", false);
      });

    // Axis labels
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .text("Year");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .style("text-anchor", "middle")
      .text("Gross Domestic Product");
  })
  .catch(error => {
    console.error("Error loading data:", error);
  });
