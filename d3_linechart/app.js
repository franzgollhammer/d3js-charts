d3 = require("d3")
_ = require("lodash")
chroma = require("chroma-js")

// Svg size
const width = 1000
const height = 600

// Get svg element
const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)

// Render function
const render = (data) => {

    const chartTitle = "Temperature Vienna"
    const xValue = d => d.date
    const yValue = d => d.temp
    const xAxisLabel = "Time"
    const yAxisLabel = "Temperature"

    const margin = {
        top: 50,
        right: 20,
        bottom: 50,
        left: 100
    }

    const innerHeight = height - margin.top - margin.bottom
    const innerWidth = width - margin.left - margin.right

    // Color
    red = "#eb6a5b"
    green = "#b6e86f"
    blue = "#52b6ca"
    colors = chroma.scale([blue, green, red])
    const colorDomain = d3.extent(data, yValue)
    const colorScale = d3.scaleLinear().domain(colorDomain)
    console.log(colors(colorScale(data[25].temp)))

    // Scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth])
        .nice() // Domain ends at tick

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([innerHeight, 0])
        .nice()

    // Axis
    const xAxisTickFormat = number => d3.format(".3s")(number).replace("G", "B") // format ticks
    const xAxis = d3.axisBottom(xScale).tickFormat(formatWeek = d3.timeFormat("%b %d"))
        .tickSize(-innerHeight)
        .tickPadding(10)
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10)

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const yAxisG = g.append("g").call(yAxis)
    
    yAxisG
        .selectAll(".domain") // remove unnecessary lines
        .remove()

    yAxisG.append("text")
        .attr("y", -40)
        .attr("x", -innerHeight / 2)
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("font-size", "20")
        .text(yAxisLabel)

    const xAxisG = g.append("g").call(xAxis)
        .attr("transform", `translate(0, ${innerHeight})`)
        
    xAxisG.selectAll(".domain")
        .remove()

    xAxisG.append("text")
        .attr("y", 40)
        .attr("x", innerWidth / 2)
        .text(xAxisLabel)
        .attr("fill", "black")
        .attr("font-size", "20px")

    const lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))
        .curve(d3.curveBasis)
    
    g.append("path")
        .data(data)
        .attr("d", lineGenerator(data))
        .attr("stroke", blue)
        .attr("fill", "none")
        .attr("stroke-width", "4")
    
    // Draw circles to svg
    // g.selectAll("circle").data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xScale(xValue(d)))
    //     .attr("cy", d => yScale(yValue(d)))
    //     .attr("r", 4)
    //     .attr("fill", d => colorScale(xValue(d)))

    // Chart title
    g.append("text")
        .text(chartTitle)
        .attr("font-size", "30px")
        .attr("text-align", "center")
        .attr("x", innerWidth / 2 - margin.left)
        .attr("y", -10)
        .attr("font-family", "arial")

}

// Fetch data from API and clean it up
const getData = async () => {
    let temp_ds = []
    const data = await fetch("./history_export_2020-01-08T09_33_41.csv")
    const temp_raw = await data.text()
    const rows = temp_raw.split(/\n/).slice(12)
        .forEach(r => {
            let row = r.split(/;/)
            let dateString = row.slice(0, 3).join("-")
            let timeString = row.slice(3, 5).join(":")
            let timeStamp = dateString + "T" + timeString + ":00Z"
            let date = new Date(timeStamp)
            let temp = +row[5]
            temp_ds.push({
                date,
                temp
            })
        })
    render(temp_ds.slice(0,-1))
}

getData()


