(function() {
  const lollipopChart = (function() {
    const DATA =
      "https://bevviemarsh.github.io/el_bibliography_dashboard/data/bibliography.json";
    const PROPERTYNAME = "genre";
    const OTHERS = "others";
    const VALUE = "value";
    const SELECTION = "circle";
    const TYPE = ".labelsLollipop";
    const LABELSPARAMS = {
      fontFamily: "Muli",
      fontWeight: "bold",
      fontSize: "14px",
      color: "#2D1F1D",
      opacity: "0"
    };
    const STROKEWIDTH = 1;

    const container = document.getElementById("lollipop");
    const svg = d3.select(container).append("svg");

    const margin = 10;
    const svgWidth = container.offsetWidth - margin;
    const svgHeight = container.offsetHeight - margin;
    svg.attr("width", svgWidth).attr("height", svgHeight);

    const lineColor = "#7A6564";
    const radius = 7;
    const circleColor = "#C3501F";

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

      const mainData = getMainData(data, getItemByProperty).concat(
        additionalData
      );

      const countedMainData = mainData.reduce((allProperties, property) => {
        property in allProperties
          ? allProperties[property]++
          : (allProperties[property] = 1);

        return allProperties;
      }, {});

      const sortedMainData = Object.keys(countedMainData)
        .map(key => ({
          [PROPERTYNAME]: String(key),
          value: countedMainData[key]
        }))
        .sort((a, b) => sortDataByProperty(a, b, VALUE));

      getCalculatedLollipopData(sortedMainData);
    }

    function getCalculatedLollipopData(sortedMainData) {
      const lollipopData = sortedMainData.map((d, i) => ({
        id: i,
        genre: d.genre,
        value: d.value,
        color: lineColor,
        x1: d.value,
        x2: 0,
        y1: d.genre,
        y2: d.genre,
        cx: d.value,
        cy: d.genre,
        r: radius,
        circleColor
      }));

      update(lollipopData);
      getCalculatedAxes(lollipopData);
    }

    function getCalculatedAxes(lollipopData) {
      const x = d3
        .scaleLinear()
        .domain([0, Math.max(...lollipopData.map(d => d.value))])
        .range([graphMargin.right, graphWidth - graphMargin.left]);
      const bottomAxis = d3.axisBottom(x);
      graph
        .append("g")
        .attr("transform", "translate(0," + graphHeight + ")")
        .style("color", "#7A6564")
        .call(bottomAxis);

      const y = d3
        .scaleBand()
        .domain([...lollipopData.map(d => d.genre)])
        .range([graphMargin.left, graphHeight]);
      const leftAxis = d3.axisLeft(y);
      graph
        .append("g")
        .attr("transform", "translate(" + graphMargin.right + " 0)")
        .style("color", "#7A6564")
        .call(leftAxis);

      return { x, y };
    }

    function getCalculatedLollipopElementsPositions() {
      const getCalculatedXPosition = (x, value) => x(value) + graphMargin.left;
      const getCalculatedYPosition = (y, value) =>
        y(value) + margin + STROKEWIDTH * 1.5;

      return { getCalculatedXPosition, getCalculatedYPosition };
    }

    function renderView(
      lollipopData,
      getCalculatedXPosition,
      x,
      getCalculatedYPosition,
      y
    ) {
      const lines = graph
        .append("g")
        .selectAll("line")
        .data(lollipopData, d => d.id);

      const circles = graph
        .append("g")
        .selectAll("circle")
        .data(lollipopData, d => d.id);

      const labels = graph
        .append("g")
        .selectAll("text")
        .data(lollipopData, d => d.id);

      lines
        .enter()
        .append("line")
        .attr("x1", x(0))
        .attr("x2", d => x(d.x2))
        .attr("y1", d => getCalculatedYPosition(y, d.y1))
        .attr("y2", d => getCalculatedYPosition(y, d.y2))
        .attr("stroke", d => d.color)
        .attr("stroke-width", STROKEWIDTH)
        .transition()
        .duration(2000)
        .attr("x1", d => x(d.x1));

      circles
        .enter()
        .append("circle")
        .attr("cx", x(0))
        .attr("cy", d => getCalculatedYPosition(y, d.cy))
        .attr("r", d => d.r)
        .attr("fill", d => d.circleColor)
        .attr("cursor", "pointer")
        .transition()
        .duration(2000)
        .attr("cx", d => x(d.cx));

      labels
        .enter()
        .append("text")
        .attr("class", TYPE.substr(1))
        .text(d => `${d.genre}: ${d.value}`)
        .attr("x", d => getCalculatedXPosition(x, d.cx))
        .attr("y", d => getCalculatedYPosition(y, d.cy))
        .style("font-family", LABELSPARAMS.fontFamily)
        .style("font-size", LABELSPARAMS.fontSize)
        .style("font-weight", LABELSPARAMS.fontWeight)
        .style("fill", LABELSPARAMS.color)
        .style("opacity", LABELSPARAMS.opacity);

      lines.exit().remove();
      circles.exit().remove();
      labels.exit().remove();
    }

    function handleEvents(selection, type) {
      const isClicked = (param1, param2) => (clicked ? param1 : param2);

      const handleDisplayLabels = (d, i, n) => {
        d3.selectAll(n)
          .transition()
          .duration(200)
          .attr("fill", isClicked("#8C7776", circleColor));

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

    function update(lollipopData) {
      const { x, y } = getCalculatedAxes(lollipopData);
      const {
        getCalculatedXPosition,
        getCalculatedYPosition
      } = getCalculatedLollipopElementsPositions();

      renderView(
        lollipopData,
        getCalculatedXPosition,
        x,
        getCalculatedYPosition,
        y
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
  lollipopChart.getData();
})();
