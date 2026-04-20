// margins?
var margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#bar_chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("mothitor.csv").then(function(data){

  data.forEach(d => {
    d.species_richness = +d.species_richness;
  });

const grouped = d3.group(data, d => d.deployment_name);

const summary = Array.from(grouped, ([key, values]) => {

  const speciesSet = new Set(
    values.map(d => d.species).filter(s => s && s !== "")
  );

  const richness = speciesSet.size;

  return {
    deployment_name: key,
    richness: richness
  };
});

  const subgroups = ["mean", "median", "total"];
  const groups = summary.map(d => d.deployment_name);

  const x = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding(0.2);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear()
    .domain([0, d3.max(summary, d => Math.max(d.mean, d.median, d.total))])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  const xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding(0.05);

  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8','#4daf4a']);

  svg.append("g")
    .selectAll("g")
    .data(summary)
    .enter()
    .append("g")
      .attr("transform", d => "translate(" + x(d.deployment_name) + ",0)")
    .selectAll("rect")
    .data(d => subgroups.map(key => ({key: key, value: d[key]})))
    .enter()
    .append("rect")
      .attr("x", d => xSubgroup(d.key))
      .attr("y", d => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key));

});
