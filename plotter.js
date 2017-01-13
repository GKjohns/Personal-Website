// ------------
// plotting app
// ------------

var dataset = [];

var dataMaxY = 50,
    dataMaxX = 50;

var width = 500,
    height = 350,
    xPadding = 30,
    yPadding = 30,
    xLow = xPadding,
    xHigh = (width - xPadding),
    yLow = (height - yPadding),
    yHigh = yPadding;

var pointRad = 8,
  regrLine;

// create the svg
var svg = d3.selectAll(".chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
// add border
svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width)
        .style("stroke", "#AAA")
        .style("fill", "none")
        .style("stroke-width", 1);

var xScale = d3.scaleLinear()
               .domain([0, dataMaxX])
               .range([xLow, xHigh]);

var yScale = d3.scaleLinear()
               .domain([0, dataMaxY])
               .range([yLow, yHigh]);   // reversed

// output coordinates of clicks
svg.on('click', function() {
  var x = +xScale.invert(d3.mouse(this)[0]).toFixed(2),
    y = +yScale.invert(d3.mouse(this)[1]).toFixed(2);

  console.log(d3.mouse(this));

  // do nothing if the points are in the padding
  if (x < 0 || y < 0) {
    return;
  }
  console.log(d3.event.clientX);
  console.log(d3.event.clientY);
  // add a new data point
  svg.append("circle")
     .attr("cx", xScale(x))
     .attr("cy", yScale(y))
     .attr("r", 0)
     .attr("fill", "#596386")
     .attr("stroke", "white")
     .transition()
     .duration(300)
     .attr("r", pointRad + 2)
     .transition()
     .duration(200)
     .attr("r", pointRad);

  // add the new datapoint to the dataset
  dataset.push([x, y])

  // draw the regression line (2 points)
  if (dataset.length == 2) {
    regrLine = svg.append("line")
                  .attr("x1", function() {
                    return xScale(0);
                  })
                  .attr("y1", function() {
                    return yScale((getRegressionParams(dataset)[0]));
                  })
                  .attr("x2", function() {
                    return xScale(0);
                  })
                  .attr("y2", function() {
                    return yScale((getRegressionParams(dataset)[0]));
                  })
    // animate drawing the line
    regrLine.transition()
            .duration(500)
            .attr("x2", function() {
              return xScale(dataMaxX);
            })
            .attr("y2", function() {
              var params = getRegressionParams(dataset);
              return yScale((params[0] + params[1] * dataMaxX));
            })
            .attr("stroke-width", 5)
            .attr("stroke", "#993333")
            .attr("stroke-linecap", "round");
  }
  // update regression line (more than 2 points)
  if (dataset.length > 2) {
    regrLine.transition()
            .attr("x1", function() {
              return xScale(0);
            })
            .attr("y1", function() {
              return yScale((getRegressionParams(dataset)[0]));
            })
            .attr("x2", function() {
              return xScale(dataMaxX);
            })
            .attr("y2", function() {
              var params = getRegressionParams(dataset);
              return yScale((params[0] + params[1] * dataMaxX));
            })
            .attr("stroke-width", 5)
            .attr("stroke", "#993333")
            .attr("stroke-linecap", "round");
  }
});

// add clear button
d3.select(".clear_button")
  .append("input")
  .attr("type", "button")
  .attr("value", "clear")
  .attr("align", "center")
  .on("click", function(e) {
    d3.event.preventDefault();
    d3.selectAll("circle")
      .transition()
      .duration(200)
      .attr("r", pointRad + 2)
      .transition()
      .duration(300)
      .attr("r", 0)
      .remove();
    regrLine.transition()
            .delay(200)
            .duration(300)
            .attr("stroke-width", 0)
            .remove();
    dataset = [];
  });

function getRegressionParams(data) {
  // calculate average x and y
  var sumX = 0,
      sumY = 0
      sxx = 0,
      sxy = 0,
      n = data.length;
  for (var i = 0; i < data.length; i++) {
    sumX += data[i][0];
    sumY += data[i][1];
  }
  var xBar = sumX / n;
  var yBar = sumY / n;

  // get terms for beta1
  for (var i = 0; i < data.length; i++) {
    sxx += Math.pow((data[i][0] - xBar), 2)
    sxy += (data[i][0] - xBar) * (data[i][1] - yBar);
  }

  beta1 = sxy / sxx;
  beta0 = yBar - (beta1 * xBar);

  return [beta0, beta1];
}
