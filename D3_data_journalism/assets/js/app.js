var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenYAxis = "healthcareLow";

function yScale(Data, chosenYAxis) {
    
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chosenYAxis]) * 0.8,
        d3.max(Data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]); 
  
    return yLinearScale;
  
  }

function renderAxes(newYScale, yAxis) {
var leftAxis = d3.axisLeft(newYScale);
  
yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  
return yAxis;
}
  
function renderCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  function updateToolTip(chosenYAxis, circlesGroup) {

    var label;
  
    if (chosenYAxis === "healthcareLow") {
      label = "Low amount of Healthcare:";
    }
    else {
      label = "High amount of Healthcare:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([90, -40])
      .html(function(d) {
        console.log('updateToolTip');
        console.log('chosenYAxis: ', chosenYAxis);
        console.log('D:', d);
        return (`${d.state}<br>${label} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  
  d3.csv("data.csv").then(function(Data, err) {
    if (err) throw err;
    // parse data
    Data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
    });
    
    // xLinearScale function above csv import *** which one needs domain and range attributions ***
    var yLinearScale = yScale(Data, chosenYAxis);
  
    // Create y scale function
    var xLinearScale = d3.scaleLinear()
      .domain([0, d3.max(Data, d => d.poverty)])
      .range([0, width]); 
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(0, 0)`)
      .call(leftAxis);
  
    // append y axis 
    chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(Data)
      .enter()
      .append("circle")
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".5");

      var textGroup = chartGroup.selectAll('.stateText')
      .data(Data)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d.poverty))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '15px')
      .text(function(d){return d.abbr});





      
  
    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var healthcareHighLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "healthcareHigh") // value to grab for event listener
      .classed("active", true)
      .text("High Amount of Healthcare");
  
    var healthcareLowLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "healthcareLow") // value to grab for event listener
      .classed("inactive", true)
      .text("Low Amount of Healthcare");
  
    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "3em") 
      .classed("axis-text", true)
      .text("Poverty Level");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenXAxis with value
          chosenYAxis = value;
  
          console.log(chosenYAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(Data, chosenYAxis);
  
          // updates x axis with transition
          yAxis = renderAxes(yLinearScale, yAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "healthcareLow") {
            healthcareHighLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLowLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareHighLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLowLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
  });