
const svgWidth = 960;
const svgHeight = 500;


const margin = {
    top: 30,
    right: 20,
    bottom: 20,
    left: 40
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

function xScaler(data, xChoice) {
    return d3.scaleLinear()
            .domain(d3.extent(data, d => d[xChoice]))
            .range([0, width])
}
function yScaler(data, yChoice) {
    return d3.scaleLinear()
            .domain([0, d3.max(data, d => d[yChoice])])
            .range([0, height].reverse())
}

function toolTipUpdate(circles, xChoice, yChoice) {
    const toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([50, -50])
        .html(d => {
            return (`${d[xChoice]} : ${d[yChoice]}`)
        });

    circles.call(toolTip);
    circles
        .on("mouseover", d => toolTip.show(d))
        .on("mouseout", (d, i) => {
            toolTip.hide(d)
        })
    return circles;

}

function xUpdate(scalex, xaxis) {
    const bottom = d3.axisBottom(scalex);

    xaxis.transition()
        .duration(1000)
        .call(bottom);
    return xaxis;
}

function yUpdate(scaley, yaxis) {
    const left = d3.axisLeft(scaley);

    yaxis.transition()
        .duration(1000)
        .call(left);
    return yaxis;
}

function updateCircles(circles, scalex, scaley, xChoice, yChoice) {
    circles.transition()
        .duration(1000)
        .attr("cx", d => scalex(d[xChoice]))
        .attr("cy", d => scaley(d[yChoice]))

    return circles;
}


d3.csv("assets/data/data.csv", d3.autoType).then((data, err) => {
    if (err) throw err;

    let xChoice = "poverty";
    let yChoice = "obesity";

    let xScale = xScaler(data, xChoice);
    let yScale = yScaler(data, yChoice);

    
    // console.log(data)
    // console.log(d3.extent(data.map(d => d["poverty"])))
    // console.log(data.map(d => xScale("poverty")(d["poverty"])));

    const svg = d3.select("#scatter").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    let axisX = svg.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height-margin.bottom})`)
        .call(d3.axisBottom(xScale));

    let axisY = svg.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))
        .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text("obesity"));
        


    

    let circles = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[xChoice]))
        .attr("cy", d => yScale(d[yChoice]))
        .attr("r", 8)
        .attr("fill", "black");
        
        
    circles = toolTipUpdate(circles, xChoice, yChoice);

    

    const selectX = d3.select("#scatter")
        .append("select")
        .on("change", d => {
            xChoice = d3.select(this).property("value");
            yChoice = selectY.property("value");
            console.log("x: "+xChoice + "y: "+yChoice)
            let scalex = xScaler(data, xChoice);
            let scaley = yScaler(data, yChoice);
            console.log(data[xChoice])
            axisX = xUpdate(scalex, axisX);
            axisY = yUpdate(scaley, axisY);

            circles = updateCircles(circles, scalex, scaley, xChoice, yChoice);
            circles = toolTipUpdate(circles, xChoice, yChoice)

        })
        .selectAll("option")
        .data(Object.keys(data[0]))
        .enter()
        .append("option")
            .text(d => d)
            .attr("value", d => d)
            .property("selected", d => d === xChoice);

    const selectY = d3.select("#scatter").append("select")
            .on("change", d => {
            xChoice = selectX.property("value");
            yChoice = d3.select(this).property("value");

            let scalex = xScaler(data, xChoice);
            let scaley = yScaler(data, yChoice);

            axisX = xUpdate(scalex, axisX);
            axisY = yUpdate(scaley, axisY);

            circles = updateCircles(circles, scalex, scaley, xChoice, yChoice);
            circles = toolTipUpdate(circles, xChoice, yChoice)
            })
            .selectAll("option")
            .data(Object.keys(data[0]))
            .enter()
            .append("option")
                .text(d => d)
                .attr("value", d => d)
                .property("selected", d => d === yChoice);
                
    

    
    

    


})