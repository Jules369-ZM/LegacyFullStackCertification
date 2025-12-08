// Chart dimensions and margins
const margin = { top: 100, right: 40, bottom: 80, left: 80 };
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

// Parse time function
const parseTime = d3.timeParse("%M:%S");

// Fetch data and create chart
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then(data => {
    const dataset = data;

    // Parse times and add seconds
    dataset.forEach(d => {
      d.Time = parseTime(d.Time);
      d.Seconds = d.Time.getMinutes() * 60 + d.Time.getSeconds();
    });

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, d => d.Year))
      .range([0, width]);

    const yScale = d3.scaleTime()
      .domain(d3.extent(dataset, d => d.Time))
      .range([0, height]);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.timeFormat("%M:%S"));

    // Add X axis
    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    // Add Y axis
    svg.append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    // Create dots
    svg.selectAll(".dot")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.Year))
      .attr("cy", d => yScale(d.Time))
      .attr("r", 6)
      .attr("fill", d => d.Doping ? "#ff6b6b" : "#4ecdc4")
      .attr("data-xvalue", d => d.Year)
      .attr("data-yvalue", d => d.Time.toISOString())
      .on("mouseover", (d, i) => {
        const time = d3.timeFormat("%M:%S")(d.Time);

        tooltip
          .attr("data-year", d.Year)
          .html(`
            <div>${d.Name}: ${d.Nationality}</div>
            <div>Year: ${d.Year}, Time: ${time}</div>
            ${d.Doping ? `<div style="color: #ff6b6b;">${d.Doping}</div>` : ''}
          `)
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
      .text("Time in Minutes");
  })
  .catch(error => {
    console.error("Error loading data:", error);
  });
