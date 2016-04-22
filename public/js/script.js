$.ajax({
    url: 'https://api.mlab.com/api/1/databases/gecko-cage/collections/temperature-humidity?apiKey=zLDXog8p4mCWRAmvKO-qD-cSHasw-2IL',
    type: 'GET'
}).done(function(data){
    //"data" will be JSON. Do what you want with it. 
    main(data);
});


function main (data) {
		console.log(data);

	// force data into javascript date object
	data.forEach(function (datum) {
		datum.right.humidity = parseInt(datum.right.humidity);
		datum.left.humidity = parseInt(datum.left.humidity);
		datum.right.temperature = parseInt(datum.right.temperature);
		datum.left.temperature = parseInt(datum.left.temperature);
		datum.datetime = new Date(datum.datetime.$date);
	});

	data.sort(function(a, b) {
	  if (a.datetime < b.datetime) {
	    return -1;
	  }
	  if (a.datetime > b.datetime) {
	    return 1;
	  }
	  // a must be equal to b
	  return 0;
	})

	console.log(data);

	createHumidityGraph();
	createTemperatureGraph();

	function createHumidityGraph() {




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

		// create backdrop
		var rect = svg.append("rect")
		.attr("width", m.graph.width).attr("height", m.graph.height)
		.attr("x", m.graph.x).attr("y", m.graph.y)
		.attr("fill", "white")
		.attr("stroke", "black")
		;

		var group = svg.append("g");

		// create axes
		
		var minHArray = data.map(function (d) {
			var leftH, rightH;
			leftH = (d.left.humidity);
			rightH = (d.right.humidity);
			if (leftH > rightH) {
				return rightH
			} else {
				return leftH;
			}

		});

		var maxHArray = data.map(function (d) {
			var leftH, rightH;
			leftH = (d.left.humidity);
			rightH = (d.right.humidity);
			if (leftH > rightH) {
				return leftH;
			} else {
				return rightH;
			}

		});

		// y
		var minHumidity = (d3.min(minHArray));

		var maxHumidity = d3.max(maxHArray);
		console.log(maxHumidity);
		var yHumidity = d3.scale.linear().domain([minHumidity - 10, maxHumidity + 10]).range([m.graph.height + m.marginHeight, ((m.graph.y))])

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
	        .tickFormat(function (d) {
	        	return d + " %";
	        })
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

		// create line for left side
		var line = d3.svg.line()
	    .x(function(d) { return x(d.datetime); })
	    .y(function(d) { return yHumidity((d.left.humidity)); })
	    .interpolate("basis");

		group.append("path")
		    .datum(data)
		    .attr("class", "line")
		    .attr("d", line);

		// create line for right side
		var lineRight = d3.svg.line()
	    .x(function(d) { return x(d.datetime); })
	    .y(function(d) { return yHumidity((d.right.humidity)); })
	    .interpolate("basis");

		group.append("path")
		    .datum(data)
		    .attr("class", "right-line")
		    .attr("d", lineRight);

		// create legend
		var legendG = svg.append("g")
		.attr("transform", "translate(" + (m.graph.x + 10) + " " + (m.graph.y + 10) + ")")
		;
		var legendRect = legendG.append("rect")
		.attr("width", m.marginWidth).attr("height", m.marginHeight)
		// .attr("stroke", "black")
		.attr("fill", "transparent")
		;

		var lCirc = legendG.append("circle")
		.attr("r", "5")
		.attr("cx", m.marginWidth * 0.1)
		.attr("cy", m.marginHeight * 0.25)
		.attr("fill", "blue")

		var rCirc = legendG.append("circle")
		.attr("r", "5")
		.attr("cx", m.marginWidth * 0.1)
		.attr("cy", m.marginHeight * 0.75)
		.attr("fill", "red")

		var lText = legendG.append("text")
		.attr("x", m.marginWidth * 0.2)
		.attr("y", m.marginHeight * 0.325)
		.text("Left Side")

		var rText = legendG.append("text")
		.attr("x", m.marginWidth * 0.2)
		.attr("y", m.marginHeight * 0.825)
		.text("Right Side")
	}

	function createTemperatureGraph() {

		var base = d3.select("#main2");
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

		// create backdrop
		var rect = svg.append("rect")
		.attr("width", m.graph.width).attr("height", m.graph.height)
		.attr("x", m.graph.x).attr("y", m.graph.y)
		.attr("fill", "white")
		.attr("stroke", "black")
		;

		var group = svg.append("g");

		// create axes

		// y
		var minTemperature = (d3.min(data.filter(function(d) {
			return (d.left.temperature);
		})).left.temperature);

		var maxTemperature = (d3.max(data.filter(function(d) {
			return (d.left.temperature);
		})).left.temperature);
		var yTemperature = d3.scale.linear().domain([minTemperature - 10, maxTemperature + 10]).range([m.graph.height + m.marginHeight, ((m.graph.y))])

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
	        .tickFormat(function (d) {
	        	return d + " C";
	        })
	        .scale(yTemperature);
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

		// create line for left side
		var line = d3.svg.line()
	    .x(function(d) { return x(d.datetime); })
	    .y(function(d) { return yTemperature((d.left.temperature)); })
	    .interpolate("basis");

		group.append("path")
		    .datum(data)
		    .attr("class", "line")
		    .attr("d", line);

		// create line for right side
		var lineRight = d3.svg.line()
	    .x(function(d) { return x(d.datetime); })
	    .y(function(d) { return yTemperature((d.right.temperature)); })
	    .interpolate("basis");

		group.append("path")
		    .datum(data)
		    .attr("class", "right-line")
		    .attr("d", lineRight);

		// create legend
		var legendG = svg.append("g")
		.attr("transform", "translate(" + (m.graph.x + 10) + " " + (m.graph.y + 10) + ")")
		;
		var legendRect = legendG.append("rect")
		.attr("width", m.marginWidth).attr("height", m.marginHeight)
		// .attr("stroke", "black")
		.attr("fill", "transparent")
		;

		var lCirc = legendG.append("circle")
		.attr("r", "5")
		.attr("cx", m.marginWidth * 0.1)
		.attr("cy", m.marginHeight * 0.25)
		.attr("fill", "blue")

		var rCirc = legendG.append("circle")
		.attr("r", "5")
		.attr("cx", m.marginWidth * 0.1)
		.attr("cy", m.marginHeight * 0.75)
		.attr("fill", "red")

		var lText = legendG.append("text")
		.attr("x", m.marginWidth * 0.2)
		.attr("y", m.marginHeight * 0.325)
		.text("Left Side")

		var rText = legendG.append("text")
		.attr("x", m.marginWidth * 0.2)
		.attr("y", m.marginHeight * 0.825)
		.text("Right Side")
	}

}