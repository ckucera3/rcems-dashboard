console.log("script.js");

$.ajax({
    url: '/api/temperature-humidity/', //the URL to your node.js server that has data
    dataType: 'json'
}).done(function(data){
    //"data" will be JSON. Do what you want with it. 
    main(data);
});

function main (data) {

	// force data into javascript date object
	data.forEach(function (datum) {
		datum.datetime = new Date(datum.datetime);
	});

	console.log(data);

	var base = d3.select("#main");
	var svg = base.append("svg")
	.attr("width", parseInt(base.style("width")))
	.attr("height", parseInt(base.style("height")))
	;

	// set up measurements
	var m = {};
	m.svg = {
		width: svg.attr("width"),
		height: svg.attr("height")
	}
	m.margin = 0.2;
	m.marginWidth = (m.margin/2) * m.svg.width;
	m.marginHeight = (m.margin/2) * m.svg.height;
	m.graph = {
		width: m.svg.width * (1 - m.margin),
		height: m.svg.height * (1 - m.margin),
	}
	m.graph.x = m.svg.width * (m.margin / 2);
	m.graph.y = m.svg.height * (m.margin / 2);

	console.log(m);

	// create backdrop
	var rect = svg.append("rect")
	.attr("width", m.graph.width).attr("height", m.graph.height)
	.attr("x", m.graph.x).attr("y", m.graph.y)
	.attr("fill", "transparent")
	.attr("stroke", "black")
	;

	var group = svg.append("g")
	// .attr("transform", "scale(" + m.graph.width + " " + m.graph.height + ")")
	// .attr("transform", "translate(" + m.graph.x + " " + m.graph.y + ")")
	// .attr("width", m.graph.width).attr("height", m.graph.height)
	// .attr("x", m.graph.x).attr("y", m.graph.y)
		;

	// create axes
	
	// y
	var yHumidity = d3.scale.linear().domain([0, 100]).range([m.graph.height + m.marginHeight, ((m.graph.y))])

	// x
	var minDate = d3.min(data.filter(function(d) {
		return d.datetime;
	})).datetime;
	var maxDate = d3.max(data.filter(function(d) {
		return d.datetime;
	})).datetime;
	var x = d3.time.scale().domain([minDate, maxDate])
	.range([m.graph.x, m.graph.x + m.graph.width]);
	x.domain(d3.extent(data, function(d) {
		return d.datetime;
	}))
	
	// y axis
    var yAxis = d3.svg.axis()
        .orient("left")
        .scale(yHumidity);
    var yAxisG = group.append("g").attr("class", "yaxis")
    .attr("transform", "translate(" + m.graph.x + " " + 0 + ")")
    // .attr("transform", "scale(" + m.graph.x + " " + m.marginWidth + ")")
    .call(yAxis)
	// x axis
    var xAxis = d3.svg.axis()
        .orient("bottom")
        .scale(x);
    var xAxisG = group.append("g").attr("class", "xaxis")
    .attr("transform", "translate(0 " + (m.graph.height + m.marginHeight) + ")")
    .call(xAxis)

    //text
    group.selectAll(".xaxis text")  // select all the text elements for the xaxis
          .attr("transform", function(d) {
              return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
    });

	// create line
	var line = d3.svg.line()
    .x(function(d) { return x(d.datetime); })
    .y(function(d) { return yHumidity(parseInt(d.left.humidity)); });

	  group.append("path")
	      .datum(data)
	      .attr("class", "line")
	      .attr("d", line);


}