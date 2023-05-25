const margin = { top: 20, right: 30, bottom: 50, left: 50 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");


d3.csv("line_chart_data.csv").then(function(data) {
  
  const parseYear = d3.timeParse("%Y");
  data.forEach(function(d) {
    d.Year = parseYear(d.Year); 
    d.Amount = +d.Amount; 
  });

  
  const xScale = d3.scaleTime().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  
  xScale.domain(d3.extent(data, function(d) { return d.Year; }));
  yScale.domain([15000, d3.max(data, function(d) { return d.Amount; })]);

  
  const line = d3.line()
    .x(function(d) { return xScale(d.Year); })
    .y(function(d) { return yScale(d.Amount); });

  const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");

  
  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  
  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.Year).left;
    const x0 = xScale.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.Year > d1.Year - x0 ? d1 : d0;
    const xPos = xScale(d.Year);
    const yPos = yScale(d.Amount);

    
    circle.attr("cx", xPos)
      .attr("cy", yPos);

    
    circle.transition()
      .duration(50)
      .attr("r", 5);

    
    tooltip
      .style("display", "block")
      .style("left", `${xPos + 100}px`)
      .style("top", `${yPos + 50}px`)
      .html(`<strong>Date:</strong> ${d.Year.toLocaleDateString()}<br><strong>Population:</strong> ${d.Amount !== undefined ? d.Amount : 'N/A'}`)
  });

  listeningRect.on("mouseleave", function () {
    circle.transition()
      .duration(50)
      .attr("r", 0);

    tooltip.style("display", "none");
  });

  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

  
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

  
  svg.append("g")
    .call(d3.axisLeft(yScale));

  
  svg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .style("text-anchor", "middle")
    .text("Year");

  svg.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Amount");
});
