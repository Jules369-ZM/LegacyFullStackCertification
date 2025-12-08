// Chart dimensions
const width = 1200;
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

// Color scale
const colorScale = d3.scaleThreshold()
  .domain([3, 12, 21, 30, 39, 48, 57, 66])
  .range(d3.schemeBlues[9]);

// Projection
const projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

// Path generator
const path = d3.geoPath()
  .projection(projection);

// Load data
Promise.all([
  d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/counties.json"),
  d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/education.json")
]).then(([us, education]) => {
  const counties = topojson.feature(us, us.objects.counties).features;

  // Create education data map
  const educationData = {};
  education.forEach(county => {
    educationData[county.fips] = county;
  });

  // Draw counties
  svg.selectAll(".county")
    .data(counties)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", d => {
      const countyData = educationData[d.id];
      return countyData ? colorScale(countyData.bachelorsOrHigher) : "#ccc";
    })
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const countyData = educationData[d.id];
      return countyData ? countyData.bachelorsOrHigher : 0;
    })
    .on("mouseover", (d, i) => {
      const countyData = educationData[d.id];

      if (countyData) {
        tooltip
          .html(`
            <div>${countyData.area_name}, ${countyData.state}</div>
            <div>${countyData.bachelorsOrHigher}%</div>
          `)
          .attr("data-education", countyData.bachelorsOrHigher)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .classed("show", true);
      }
    })
    .on("mouseout", () => {
      tooltip.classed("show", false);
    });

  // Create legend
  const legendWidth = 300;
  const legendHeight = 20;
  const legendScale = d3.scaleLinear()
    .domain([0, 75])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickValues(colorScale.domain())
    .tickFormat(d => d + "%");

  const legend = d3.select("#legend")
    .append("svg")
    .attr("width", legendWidth + 60)
    .attr("height", legendHeight + 40)
    .append("g")
    .attr("transform", "translate(30,20)");

  // Create legend gradient
  const defs = legend.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "map-gradient")
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
    .style("fill", "url(#map-gradient)");

  legend.append("g")
    .attr("transform", `translate(0,${legendHeight})`)
    .call(legendAxis);

}).catch(error => {
  console.error("Error loading data:", error);
});
