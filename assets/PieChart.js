(function() {
  const pieChart = (function() {
    const DATA = "../data/bibliography.json";
    const PROPERTYNAME = "publisher";
    const OTHERS = "others";
    const VALUE = "value";
    const SELECTION = "path";
    const TYPE = ".labelsPieChart";
    const LABELSPARAMS = {
      fontFamily: "Muli",
      fontWeight: "bold",
      fontSize: "13px",
      color: "#282829",
      opacity: "0"
    };
    const STROKEWIDTH = 1;

    const lineColor = "#1F1E1C";

    const container = document.getElementById("pie");
    const svg = d3.select(container).append("svg");

    const margin = 10;
    const svgWidth = container.offsetWidth - margin;
    const svgHeight = container.offsetHeight - margin;
    svg.attr("width", svgWidth).attr("height", svgHeight);

    const graphMargin = { top: 20, left: 20, right: 100, bottom: 100 };
    const graphWidth = svgWidth - graphMargin.left - graphMargin.right;
    const graphHeight = svgHeight - graphMargin.top - graphMargin.bottom;
    const radius = Math.min(graphWidth, graphHeight / 2);
    const graph = svg
      .append("g")
      .attr("width", graphWidth)
      .attr("height", graphHeight)
      .attr(
        "transform",
        `translate(${graphMargin.right * 3.5}, ${graphMargin.bottom * 1.5})`
      );

    let clicked = true;

    function getPreparedData(data) {
      const getItemByProperty = (item, property) => item[property];
      const sortDataByProperty = (a, b, property) => b[property] - a[property];

      const getMainData = (arr, getItem) =>
        arr.reduce((acc, el) => {
          if (!getItem(el, PROPERTYNAME)) return acc;

          return [...acc, getItem(el, PROPERTYNAME)];
        }, []);

      const additionalData = data
        .find(item => getItemByProperty(item, OTHERS))
        .others.filter(item => getItemByProperty(item, PROPERTYNAME))
        .map(item => getItemByProperty(item, PROPERTYNAME));

      const mainData = getMainData(data, getItemByProperty)
        .concat(additionalData)
        .reduce((allProperties, property) => {
          property in allProperties
            ? allProperties[property]++
            : (allProperties[property] = 1);

          return allProperties;
        }, {});

      const sortedMainData = Object.keys(mainData)
        .map(key => ({
          [PROPERTYNAME]: String(key),
          value: mainData[key]
        }))
        .sort((a, b) => sortDataByProperty(a, b, VALUE));

      getCalculatedPieChartData(sortedMainData);
    }

    function getCalculatedPieChartData(sortedMainData) {
      const mainData = sortedMainData.filter(item => item.value > 1);

      const countedOthers = sortedMainData
        .filter(item => item.value <= 1)
        .map(item => item.value)
        .reduce((acc, currVal) => acc + currVal);

      const others = [countedOthers].map((d, i) => ({
        publisher: "Other publishers",
        value: d
      }));

      const pieChartPreparedData = mainData.concat(others);

      const pieChartData = pieChartPreparedData.map((d, i) => ({
        id: i,
        publisher: d.publisher,
        value: d.value
      }));

      update(pieChartData);
    }

    function getPieChartParams(pieChartData) {
      const colors = d3
        .scaleOrdinal()
        .range(["#1A335C", "#C5743C", "#BD6454", "#1E1E1E", "#878787"]);

      const getPie = d3.pie().value(d => d.value);
      const pie = getPie(pieChartData);

      const arcGenerator = d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius);

      return { pie, arcGenerator, colors };
    }

    function getCalculatedPieChartLabels(arcGenerator) {
      const outerArc = d3
        .arc()
        .innerRadius(radius * 1.5)
        .outerRadius(radius * 1.1);

      const midangle = d => d.startAngle + (d.endAngle - d.startAngle) / 2;

      const getTranslatedLabels = d => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 1.3 * (midangle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      };

      const getPositionatedLabels = d =>
        midangle(d) < Math.PI ? "start" : "end";

      const getPositionatedPolylines = d => {
        const posA = arcGenerator.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * 1.3 * (midangle < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      };

      return {
        getTranslatedLabels,
        getPositionatedLabels,
        getPositionatedPolylines
      };
    }

    function renderView(
      pie,
      arcGenerator,
      colors,
      getTranslatedLabels,
      getPositionatedLabels,
      getPositionatedPolylines
    ) {
      const paths = graph
        .append("g")
        .selectAll(SELECTION)
        .data(pie, d => d.data.id);

      const labels = graph
        .append("g")
        .selectAll("text")
        .data(pie, d => d.data.id);

      const lines = graph
        .append("g")
        .selectAll("polyline")
        .data(pie, d => d.data.id);

      paths
        .enter()
        .append(SELECTION)
        .attr("d", arcGenerator)
        .attr("fill", d => colors(d.value))
        .attr("stroke", "black")
        .attr("stroke-width", STROKEWIDTH)
        .attr("cursor", "pointer");

      labels
        .enter()
        .append("text")
        .attr("class", TYPE.substr(1))
        .attr("dy", ".35em")
        .text(d => d.data.publisher)
        .attr("transform", d => getTranslatedLabels(d))
        .style("text-anchor", d => getPositionatedLabels(d))
        .style("font-family", LABELSPARAMS.fontFamily)
        .style("font-weight", LABELSPARAMS.fontWeight)
        .style("font-size", LABELSPARAMS.fontSize)
        .style("fill", LABELSPARAMS.color)
        .style("opacity", LABELSPARAMS.opacity);

      lines
        .enter()
        .append("polyline")
        .attr("stroke", "black")
        .attr("class", TYPE.substr(1))
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", STROKEWIDTH)
        .attr("points", d => getPositionatedPolylines(d))
        .style("opacity", LABELSPARAMS.opacity);

      paths.exit().remove();
      labels.exit().remove();
      lines.exit().remove();
    }

    function handleEvents(selection, type) {
      const isClicked = (param1, param2) => (clicked ? param1 : param2);

      const handleDisplayLabels = (d, i, n) => {
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

    function update(pieChartData) {
      const { pie, arcGenerator, colors } = getPieChartParams(pieChartData);

      const {
        getTranslatedLabels,
        getPositionatedLabels,
        getPositionatedPolylines
      } = getCalculatedPieChartLabels(arcGenerator);

      renderView(
        pie,
        arcGenerator,
        colors,
        getTranslatedLabels,
        getPositionatedLabels,
        getPositionatedPolylines
      );

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
  pieChart.getData();
})();
