(function() {
  const circularBarPlot = (function() {
    const DATA = "../data/bibliography.json";
    const PROPERTYNAME = "city";
    const OTHERS = "others";
    const VALUE = "value";
    const SELECTION = "path";
    const TYPE = ".labelsCircular";
    const LABELSPARAMS = {
      fontFamily: "Muli",
      fontWeight: "bold",
      fontSize: "13px",
      color: "#030303",
      opacity: "0"
    };

    const container = document.getElementById("circular");
    const svg = d3.select(container).append("svg");

    const margin = 10;
    const svgWidth = container.offsetWidth - margin;
    const svgHeight = container.offsetHeight - margin;
    svg.attr("width", svgWidth).attr("height", svgHeight);

    const barColor = "#424242";

    const graphMargin = { top: 20, left: 20, right: 100, bottom: 100 };
    const graphWidth = svgWidth - graphMargin.left - graphMargin.right;
    const graphHeight = svgHeight - graphMargin.top - graphMargin.bottom;
    const innerRadius = 15;
    const outerRadius = Math.min(graphWidth, graphHeight / 2);
    const graph = svg
      .append("g")
      .attr("width", graphWidth)
      .attr("height", graphHeight)
      .attr(
        "transform",
        `translate(${graphMargin.right * 3.5}, ${graphMargin.bottom * 2})`
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

      getCalculatedCircularBarplotData(sortedMainData);
    }

    function getCalculatedCircularBarplotData(sortedMainData) {
      const circularBarPlotData = sortedMainData.map((d, i) => ({
        id: i,
        city: d.city,
        value: d.value
      }));

      update(circularBarPlotData);
    }

    function getCalculatedScales(circularBarPlotData) {
      const x = d3
        .scaleBand()
        .range([0, 2 * Math.PI])
        .domain(circularBarPlotData.map(d => d.city));
      const y = d3
        .scaleRadial()
        .range([innerRadius, outerRadius])
        .domain([0, Math.max(...circularBarPlotData.map(d => d.value))]);

      const barsData = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(d => y(d.value))
        .startAngle(d => x(d.city))
        .endAngle(d => x(d.city) + x.bandwidth());

      return { x, y, barsData };
    }

    function getCalculatedCircularBarplotLabels() {
      const getLabelsPositions = (x, y, value1, value2) => `rotate(
        ${((x(value1) + x.bandwidth() / 2) * 180) / Math.PI -
          90}) translate(${y(value2) + 5},0)`;

      return getLabelsPositions;
    }

    function renderView(
      circularBarPlotData,
      getLabelsPositions,
      x,
      y,
      barsData
    ) {
      const bars = graph
        .append("g")
        .selectAll("path")
        .data(circularBarPlotData, d => d.id);

      const labels = graph
        .append("g")
        .selectAll("text")
        .data(circularBarPlotData, d => d.id);

      bars
        .enter()
        .append("path")
        .attr("fill", barColor)
        .attr("d", barsData)
        .attr("cursor", "pointer");

      labels
        .enter()
        .append("text")
        .attr("class", TYPE.substr(1))
        .text(d => `${d.city}: ${d.value}`)
        .attr("text-anchor", "start")
        .attr("transform", d => getLabelsPositions(x, y, d.city, d.value))
        .style("font-family", LABELSPARAMS.fontFamily)
        .style("font-weight", LABELSPARAMS.fontWeight)
        .style("font-size", LABELSPARAMS.fontSize)
        .style("fill", LABELSPARAMS.color)
        .style("opacity", LABELSPARAMS.opacity);

      bars.exit().remove();
      labels.exit().remove();
    }

    function handleEvents(selection, type) {
      const isClicked = (param1, param2) => (clicked ? param1 : param2);

      const handleDisplayLabels = (d, i, n) => {
        d3.selectAll(n)
          .transition()
          .duration(200)
          .attr("fill", isClicked("#609FC0", barColor));

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

    function update(circularBarPlotData) {
      const { x, y, barsData } = getCalculatedScales(circularBarPlotData);

      const getLabelsPositions = getCalculatedCircularBarplotLabels();

      renderView(circularBarPlotData, getLabelsPositions, x, y, barsData);

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
  circularBarPlot.getData();
})();
