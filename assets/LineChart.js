(function() {
  const lineChart = (function() {
    const DATA = "../data/bibliography.json";
    const PROPERTYNAME = "year";
    const OTHERS = "others";
    const SELECTION = "circle";
    const TYPE = ".labelsLineGraph";
    const STROKEWIDTH = 1;
    const LABELSPARAMS = {
      fontFamily: "Muli",
      fontWeight: "bold",
      fontSize: "13px",
      color: "#1a1b25",
      opacity: "0"
    };

    const container = document.getElementById("line");
    const svg = d3.select(container).append("svg");

    const lineColor = "#756939";
    const radius = 5;
    const circleColor = "#8B3B18";

    const margin = 10;
    const svgWidth = container.offsetWidth - margin;
    const svgHeight = container.offsetHeight - margin;
    svg.attr("width", svgWidth).attr("height", svgHeight);

    const graphMargin = { top: 20, left: 20, right: 100, bottom: 100 };
    const graphWidth = svgWidth - graphMargin.left - graphMargin.right;
    const graphHeight = svgHeight - graphMargin.top - graphMargin.bottom;
    const graph = svg
      .append("g")
      .attr("width", graphWidth)
      .attr("height", graphHeight)
      .attr(
        "transform",
        `translate(${graphMargin.left}, ${graphMargin.top * 4})`
      );

    let clicked = true;

    function getPreparedData(data) {
      const getItemByProperty = (item, property) => item[property];
      const allPeriods = [];
      let minYear;
      let maxYear;

      const getPeriodRange = data => {
        const getYear = datum =>
          datum
            .filter(item => getItemByProperty(item, PROPERTYNAME))
            .map(item => getItemByProperty(item, PROPERTYNAME));

        const mainData = data;
        const additionalData = data.find(item =>
          getItemByProperty(item, OTHERS)
        ).others;

        const mainYears = getYear(mainData);
        const additionalYears = getYear(additionalData);

        const allYears = mainYears.concat(additionalYears);
        minYear = Math.floor(Math.min(...allYears) / 10) * 10;
        maxYear = Math.round(Math.max(...allYears) / 10) * 10;
      };
      getPeriodRange(data);

      const getPeriods = (data, year1, year2) => {
        const addFilteredPeriod = item => {
          if (
            getItemByProperty(item, PROPERTYNAME) > year1 &&
            getItemByProperty(item, PROPERTYNAME) <= year2
          ) {
            allPeriods.push(`${year1}-${year2}`);
          }
        };

        data.filter(item => addFilteredPeriod(item));
        data
          .find(item => getItemByProperty(item, OTHERS))
          .others.filter(item => addFilteredPeriod(item));

        if (year1 === maxYear) return;
        year1 += 10;
        return getPeriods(data, year1, year2 + 10);
      };
      getPeriods(data, minYear, minYear + 10);

      const countedPeriods = allPeriods.reduce((allProperties, property) => {
        property in allProperties
          ? allProperties[property]++
          : (allProperties[property] = 1);

        return allProperties;
      }, {});

      const periods = Object.keys(countedPeriods).map(key => ({
        [PROPERTYNAME]: String(key),
        value: countedPeriods[key]
      }));

      getCalculatedLineChartData(periods);
    }

    function getCalculatedLineChartData(periods) {
      const getFormattedYear = d => Number(d.year.slice(5));

      const lineChartData = periods.map((d, i) => ({
        id: i,
        year: getFormattedYear(d),
        value: d.value,
        r: radius,
        cx: getFormattedYear(d),
        cy: d.value,
        text: `${d.year}: ${d.value}`
      }));

      update(lineChartData);
    }

    function getCalculatedAxes(lineChartData) {
      const xAxis = d3
        .scaleLinear()
        .domain([
          Math.min(...lineChartData.map(d => Number(d.text.slice(0, 4)))),
          Math.max(...lineChartData.map(d => d.year))
        ])
        .range([0, graphWidth]);
      const bottomAxis = d3
        .axisBottom(xAxis)
        .ticks(6)
        .tickFormat(d3.format("d"));
      graph
        .append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        .style("color", "#444545")
        .call(bottomAxis);

      const yAxis = d3
        .scaleLinear()
        .domain([Math.max(...lineChartData.map(d => d.value)), 0])
        .range([graphMargin.left, graphHeight]);
      const leftAxis = d3.axisLeft(yAxis);
      graph
        .append("g")
        .style("color", "#444545")
        .call(leftAxis);

      return { xAxis, yAxis };
    }

    function getPreparedLine(xAxis, yAxis) {
      const getLine = d3
        .line()
        .x(d => xAxis(d.year))
        .y(d => yAxis(d.value));

      return getLine;
    }

    function getCalculatedLineChartElementsPositions() {
      const getCalculatedYPosition = (y, value) => y(value) - graphMargin.left;

      return { getCalculatedYPosition };
    }

    function handlePathAnimation(d, i, n) {
      let totalLength = n[i].getTotalLength();
      d3.select(n[i])
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .delay(1000)
        .duration(2000)
        .attr("stroke-dashoffset", 0);
    }

    function renderView(
      lineChartData,
      getLine,
      xAxis,
      yAxis,
      getCalculatedYPosition
    ) {
      const labels = graph
        .append("g")
        .selectAll("text")
        .data(lineChartData, d => d.id);

      const line = graph
        .append("g")
        .selectAll("path")
        .data(lineChartData, d => d.id);

      const circles = graph
        .append("g")
        .selectAll("circle")
        .data(lineChartData, d => d.id);

      labels
        .enter()
        .append("text")
        .attr("class", TYPE.substr(1))
        .text(d => d.text)
        .attr("x", d => xAxis(d.cx))
        .attr("y", d => getCalculatedYPosition(yAxis, d.cy))
        .style("font-family", LABELSPARAMS.fontFamily)
        .style("font-size", LABELSPARAMS.fontSize)
        .style("font-weight", LABELSPARAMS.fontWeight)
        .style("fill", LABELSPARAMS.color)
        .style("opacity", LABELSPARAMS.opacity);

      line
        .enter()
        .append("path")
        .attr("d", getLine(lineChartData))
        .attr("stroke", lineColor)
        .attr("stroke-width", STROKEWIDTH)
        .attr("fill", "none")
        .each((d, i, n) => handlePathAnimation(d, i, n));

      circles
        .enter()
        .append("circle")
        .attr("r", d => d.r)
        .attr("cx", d => xAxis(d.year))
        .attr("cy", d => yAxis(d.value))
        .attr("fill", circleColor)
        .attr("cursor", "pointer")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

      labels.exit().remove();
      line.exit().remove();
      circles.exit().remove();
    }

    function handleEvents(selection, type) {
      const isClicked = (param1, param2) => (clicked ? param1 : param2);

      const handleDisplayLabels = (d, i, n) => {
        d3.selectAll(n)
          .transition()
          .duration(200)
          .attr("fill", isClicked("#E2AE63", circleColor));

        d3.selectAll(type)
          .transition()
          .duration(200)
          .style("opacity", isClicked("1", "0"));
      };

      graph.selectAll(selection).on("click", (d, i, n) => {
        handleDisplayLabels(d, i, n);
        clicked = !clicked;
      });
    }

    function update(lineChartData) {
      const { xAxis, yAxis } = getCalculatedAxes(lineChartData);
      const getLine = getPreparedLine(xAxis, yAxis);
      const {
        getCalculatedYPosition
      } = getCalculatedLineChartElementsPositions();

      renderView(lineChartData, getLine, xAxis, yAxis, getCalculatedYPosition);

      handleEvents(SELECTION, TYPE);
    }

    const getData = async () => {
      try {
        const data = await d3.json(DATA);
        return data;
      } catch (err) {
        return console.log(`Smth went rlly wrong: ${err}`);
      }
    };

    getData().then(data => {
      getPreparedData(data);
    });

    return { getData };
  })();
  lineChart.getData();
})();
