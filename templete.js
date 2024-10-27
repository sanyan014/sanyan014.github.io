// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top: 30, bottom: 30, left: 50, right: 30};

    // Create the SVG container

    const scatterplotSvg = d3.select("#scatterplot")
      .attr("width", width)
      .attr("height", height)
      .style('background', '#e9f7f2');

    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5

    const xScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 5, d3.max(data, d => d.PetalLength) + 5])
        .range([margin.left, width - margin.right]);

    const yScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 5, d3.max(data, d => d.PetalWidth) + 5])
        .range([height - margin.bottom, margin.top]);

    const colorScaleScatter = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales
    scatterplotSvg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScaleScatter));

    scatterplotSvg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScaleScatter));

    // Add circles for each data point
    scatterplotSvg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScaleScatter(d.PetalLength))
        .attr("cy", d => yScaleScatter(d.PetalWidth))
        .attr("r", 3)
        .attr("fill", (d) => colorScaleScatter(d.Species));

    // x label
    scatterplotSvg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height - margin.bottom + 20) // Adjust position as needed
        .text("Petal Length");

    // y label
    scatterplotSvg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)") // Rotate for y label
        .attr("y", margin.left - 40) // Adjust position as needed
        .attr("x", -height / 2)
        .text("Petal Width");

    // legend
    const legend = scatterplotSvg.selectAll(".legend")
        .data(colorScaleScatter.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - margin.right - 100}, ${margin.top + i * 20})`);

    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .style("fill", colorScaleScatter);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text(d => d)
        .style("font-size", "13px")
        .attr("alignment-baseline", "middle");
});


// boxplot

// Load the Iris dataset
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top: 30, bottom: 50, left: 50, right: 30};

    // Create the SVG container
    const boxplotSvg = d3.select("#boxplot")
        .attr("width", width)
        .attr("height", height)
        .style('background', '#e9f7f2');

    // Set up scales for x and y axes
    const xScaleBox = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Species))])  //getting the unique species. not sure if this is the correct way but I couldn't find any other way.
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const yScaleBox = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength) + 1])
        .range([height - margin.bottom, margin.top]);

    const colorScaleBox = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add x and y axes
    boxplotSvg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScaleBox));

    boxplotSvg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScaleBox));

    // Add axis labels
    boxplotSvg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .text("Species");

    boxplotSvg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .text("Petal Length");

    // Rollup and calculate statistics
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const min = Math.max(d3.min(values), q1 - 1.5 * (q3 - q1));
        const max = Math.min(d3.max(values), q3 + 1.5 * (q3 - q1));
        return {min, q1, median, q3, max};
    };

    // grouping data by species and then applying the rollupFunction to them
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // getting each species' x position and box width on the x-axis.
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScaleBox(species);
        const boxWidth = xScaleBox.bandwidth();

        // Draw vertical lines - min to max
        boxplotSvg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScaleBox(quartiles.min))
            .attr("y2", yScaleBox(quartiles.max))
            .attr("stroke", "black");

        // Draw box
        boxplotSvg.append("rect")
            .attr("x", x)
            .attr("y", yScaleBox(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScaleBox(quartiles.q1) - yScaleBox(quartiles.q3))
            .attr("fill", colorScaleBox(species))
            .attr("opacity", 0.5);

        // Draw median line
        boxplotSvg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScaleBox(quartiles.median))
            .attr("y2", yScaleBox(quartiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});
