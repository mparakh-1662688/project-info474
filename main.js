"use strict";
(function(){
    let data = "";
    let svgContainer = "";
    let div = "";

    const measurements = {
        width: 1000,
        height: 500,
        marginAll: 50
    }



    window.onload = function() {
        svgContainer = d3.select('body').append("svg")
            .attr('width', measurements.width)
            .attr('height', measurements.height);
        d3.csv("data/HDI.csv")
            .then((csvData) => data = csvData)
            .then(() => makeScatterPlot());
    }


    function makeScatterPlot() {
        console.log(data);
        let Country = data.map((row) => ((row["Gender Development Index value"])))
        console.log(Country);

        let temp = ["(all)"]
        Country = temp.concat(Country.filter( onlyUnique )); 
        let Countrylen = Country.length;
        let countryR = [];
        countryR.push(temp);
        for (let i = 30; i < Country.length; i+=50) {
            countryR.push( "[" + i + "-" + (i + 50) + "]");
            console.log(3,countryR)
        }
        const eachYear = function(d) {
            return d
        };

        div = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

        d3.select("#selectButton")
            .selectAll('myOptions')
            .data(countryR)
            .enter()
            .append('option')
            .attr('value',eachYear)
            .text(eachYear)

        d3.select("#selectButton").on("change", function(d) {
            let selectedOption = d3.select(this).property("value")
            update(selectedOption, data)
        })

        let Sp_def = data.map((row) => parseInt(row["Life expectancy"]))
        let Total = data.map((row) =>  parseFloat(row["Total Population (millions) 2015"]))

        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }
        
            
        const limits = findMinMax(Sp_def, Total)              

        let scaleX = d3.scaleLinear()
            .domain([10, 100])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])

        let scaleY = d3.scaleLinear()
            .range([measurements.height, 0])
            .domain([-40, 300]); 
        drawAxes(scaleX, scaleY)
        update("(all)", data);
        function update(selectedGroup, data) {
            let dataFilter;
            // selectedGroup = selectedGroup.slice(0[,2]);
            console.log(1,selectedGroup)
            let a, b;
            if ("[30-80]" === selectedGroup) { a = 30, b = 80};
            if ("[80-130]" === selectedGroup) { a = 80, b = 130};
            // if ("[100-150]" === selectedGroup) { a = 100, b = 150};
            a = a * 0.01;
            b =  b * 0.01;
            if (selectedGroup === "(all)") {
                dataFilter = data;
            } else {
                dataFilter = data.filter(function(d)
                {return (d["Gender Development Index value"] > (a + "") && d["Gender Development Index value"] < (b + ""))});
            }
            console.log(1,a)
            Sp_def = dataFilter.map((row) => parseInt(row["Life expectancy"]))
            Total = dataFilter.map((row) =>  parseFloat(row["Total Population (millions) 2015"]))
            plotData(scaleX, scaleY, dataFilter)
        }

        
        makeLabels();
    }

    function findMinMax(fertility_rate, life_expectancy) {
        return {
            greMin: d3.min(fertility_rate),
            greMax: d3.max(fertility_rate),
            admitMin: d3.min(life_expectancy),
            admitMax: d3.max(life_expectancy)
        }
    }

    function drawAxes(scaleX, scaleY) {
        let xAxis = d3.axisBottom()
            .scale(scaleX)
            .tickValues(d3.range(10, 250, 10))

        let yAxis = d3.axisLeft()
            .scale(scaleY)
            .tickValues(d3.range(0, 850, 50))
            
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    function plotData(scaleX, scaleY, dataFilter) {
        const xMap = function(d) { return scaleX(+d["Life expectancy"]) }
        const yMap = function(d) { return scaleY(+d["Total Population (millions) 2015"]) }
        console.log(xMap)
        // const currColor = function(d) { let a = d["Type 1"];
        //                         let res = colors[a];
        //                         return res; }

        d3.selectAll("svg").selectAll("circle").remove()
        const circles = svgContainer.selectAll(".dot")
            .data(dataFilter)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 5)
                .attr('fill', "#4E79A7"                
                )
                .on("mouseover", (d) => {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d["Country"] + "<br/>" + 
                        "GDI:- "+d["Gender Development Index value"] + "<br/>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    })
                    .on("mouseout", (d) => {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    });

    }

    function makeLabels() {
        d3.selectAll("svg").selectAll("text.label").remove();
        svgContainer.append('text')
          .attr('x', 450)
          .attr('y', 490)
          .style('font-size', '14pt')
          .text('Life expectancy')
          .attr('class', "label");
    
        svgContainer.append('text')
          .attr('x', 450)
          .attr('y', 20)
          .style('font-size', '14pt')
          .text('Total Population vs Life expectancy')
          .attr('class', "label");

        svgContainer.append('text')
          .attr('transform', 'translate(15, 300)rotate(-90)')
          .style('font-size', '14pt')
          .text('Total Population (millions) 2015')
          .attr('class', "label");
      }






})()