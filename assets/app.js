(function() {
  const bibliographyDashboard = (function() {
    const DATA =
      "https://bevviemarsh.github.io/el_bibliography_dashboard/data/bibliography.json";
    const PROPERTY_CITY = "city";
    const PROPERTY_GENRE = "genre";
    const PROPERTY_PUBLISHER = "publisher";
    const PROPERTY_YEAR = "year";
    const PROPERTY_OTHERS = "others";
    const PROPERTY_VALUE = "value";

    const chartsVisualElements = {
      colors: {
        circularBarColor: "#054661",
        clickedCircularBarColor: "#0988be",
        lollipopStrokeColor: "black",
        lollipopLineColor: "#efeef1",
        lollipopCircleColor: "#054661",
        lollipopClickedCircleColor: "#0988be",
        lollipopAxesColor: "#a7b4fb",
        pieLinesColor: "#a7b4fb",
        pieColor: "#054661",
        pieClickedColor: "#0988be",
        piePolylineColors: "#efeef1",
        lineChartLineColor: "#efeef1",
        lineChartCircleColor: "#054661",
        lineChartAxesColor: "#a7b4fb",
        lineChartClickedCircleColor: "#0988be"
      },

      strokeWidth: 1,

      labelsParams: {
        fontFamily: "Muli",
        fontWeight: "normal",
        fontSize: "13px",
        labelColor: "#1af48b",
        opacityValue: "0",
        textAnchorPosition: "start",
        letterSpacing: "1",
        axesFontSize: "12px",
        axesLetterSpacing: "0.5"
      },

      visible: "1",
      hidden: "0",
      noneFill: "none",
      cursorPointer: "pointer"
    };

    const chartParams = {
      container: field => document.getElementById(field),

      chartFields: {
        lollipop: "lollipop",
        circular: "circular",
        pie: "pie",
        line: "line"
      },

      labelTypes: {
        lollipopClass: ".labelsLollipop",
        circularClass: ".labelsCircular",
        pieClass: ".labelsPieChart",
        lineClass: ".labelsLineGraph"
      },

      clickParams: {
        clickedlollipop: true,
        clickedcircular: true,
        clickedpie: true,
        clickedline: true
      },

      radius: 5.5,
      clickedCircleRadius: 7,
      pieRadius: (graphWidthValue, graphHeightValue) =>
        Math.min(graphWidthValue, graphHeightValue / 2),
      pieInnerValue: 30,

      margin: 10,
      graphMargin: { top: 20, left: 20, right: 100, bottom: 100 },

      translate: (firstMarginValue, secondMarginValue) =>
        `translate(${firstMarginValue}, ${secondMarginValue})`,

      durationTime: 2000,
      delayTime: 1000,
      labelDurationTime: 200,

      circularBarInnerRadius: 15,
      circularBarOuterRadius: (graphWidthValue, graphHeightValue) =>
        Math.min(graphWidthValue, graphHeightValue / 2),

      tickSizeValue: "10"
    };

    const { graphMargin } = chartParams;

    const chartDeviations = {
      lollipopDeviations: {
        chartPositionDeviation: {
          horizontalParam: graphMargin.left * 2,
          verticalParam: graphMargin.top * 1.5
        },
        yPositionDeviation: -0.7,
        labelsDeviation: 3.5
      },
      circularBarPlotDeviations: {
        chartPositionDeviation: {
          horizontalParam: graphMargin.right * 3,
          verticalParam: graphMargin.bottom * 1.7
        },
        labelPositionDeviation: 5
      },
      pieChartDeviations: {
        chartPositionDeviation: {
          horizontalParam: graphMargin.right * 3,
          verticalParam: graphMargin.bottom * 1.5
        },
        labelsAndPolylinesDeviation: {
          outerArcParams: {
            innerRadius: 1.5,
            outerRadius: 1.1
          },
          midAngleParam: 1.3
        }
      },
      lineChartDeviations: {
        lineChartHorizontalParam: graphMargin.top * 3,
        lineChartDataYearDeviationForXAxes: 10
      }
    };

    const getSvgAndGraphParams = chartField => {
      const { margin, container } = chartParams;

      const mainContainer = chartField => container(chartField);

      const basicWidth = mainContainer(chartField).offsetWidth;
      const calculatedSvgWidth = basicWidth - margin;
      const calculatedGraphWidth =
        calculatedSvgWidth - graphMargin.left - graphMargin.right;

      const basicHeight = mainContainer(chartField).offsetHeight;
      const calculatedSvgHeight = basicHeight - margin;
      const calculatedGraphHeight =
        calculatedSvgHeight - graphMargin.top - graphMargin.bottom;

      return {
        mainContainer,
        basicWidth,
        calculatedSvgWidth,
        calculatedGraphWidth,
        basicHeight,
        calculatedSvgHeight,
        calculatedGraphHeight
      };
    };

    const getMainChartStructure = (chartField, chartPosition) => {
      const {
        mainContainer,
        basicWidth,
        basicHeight,
        calculatedSvgWidth,
        calculatedSvgHeight
      } = getSvgAndGraphParams(chartField);

      const svgSelection = d3.select(mainContainer(chartField)).append("svg");

      const mainSvg = svgSelection
        .attr("width", basicWidth)
        .attr("height", basicHeight)
        .append("g");

      const mainChart = mainSvg
        .attr("width", calculatedSvgWidth)
        .attr("height", calculatedSvgHeight)
        .attr("transform", chartPosition);

      return mainChart;
    };

    // create main graphs for dahsboard
    const { chartFields } = chartParams;
    const { circular, lollipop, pie, line } = chartFields;

    const circularPosition = chartParams.translate(
      chartDeviations.circularBarPlotDeviations.chartPositionDeviation
        .horizontalParam,
      chartDeviations.circularBarPlotDeviations.chartPositionDeviation
        .verticalParam
    );
    const lollipopPosition = chartParams.translate(
      chartDeviations.lollipopDeviations.chartPositionDeviation.horizontalParam,
      chartDeviations.lollipopDeviations.chartPositionDeviation.verticalParam
    );

    const circularGraph = getMainChartStructure(circular, circularPosition);
    const lollipopGraph = getMainChartStructure(lollipop, lollipopPosition);

    // data operations
    const getPreparedData = data => {
      //   data helpers
      const getItemByProperty = (item, property) => item[property];

      const filterDataHigherThenOne = (item, property) => item[property] > 1;
      const filterDataLowerThenOne = (item, property) => item[property] <= 1;

      const sortDataByProperty = (firstItem, secondItem, property) =>
        firstItem[property] - secondItem[property];

      const getDataByProperty = (arr, filterItem, getItem, propertyName) =>
        arr.reduce((acc, el) => {
          if (!filterItem(el, propertyName)) return acc;
          return [...acc, getItem(el, propertyName)];
        }, []);

      const getAdditionalData = (arr, getItem, propertyName) =>
        arr.find(item => getItem(item, propertyName))[propertyName];

      // modified data
      const additionalData = getAdditionalData(
        data,
        getItemByProperty,
        PROPERTY_OTHERS
      );

      const dataCities = getDataByProperty(
        data,
        getItemByProperty,
        getItemByProperty,
        PROPERTY_CITY
      ).concat(
        getDataByProperty(
          additionalData,
          getItemByProperty,
          getItemByProperty,
          PROPERTY_CITY
        )
      );

      const dataGenres = getDataByProperty(
        data,
        getItemByProperty,
        getItemByProperty,
        PROPERTY_GENRE
      ).concat(
        getDataByProperty(
          additionalData,
          getItemByProperty,
          getItemByProperty,
          PROPERTY_GENRE
        )
      );

      // count and sort data
      const getCountedAndSortedData = (dataToCount, propertyName) => {
        const countedMainData = dataToCount.reduce(
          (allProperties, property) => {
            property in allProperties
              ? allProperties[property]++
              : (allProperties[property] = 1);

            return allProperties;
          },
          {}
        );

        const mainData = Object.keys(countedMainData).map(key => ({
          [propertyName]: String(key),
          value: countedMainData[key]
        }));

        return mainData;
      };

      const sortedDataForCircular = getCountedAndSortedData(
        dataCities,
        PROPERTY_CITY
      ).sort((a, b) => sortDataByProperty(b, a, PROPERTY_VALUE));

      const sortedDataForLollipop = getCountedAndSortedData(
        dataGenres,
        PROPERTY_GENRE
      ).sort((a, b) => sortDataByProperty(b, a, PROPERTY_VALUE));

      getCalculatedLollipopData(sortedDataForLollipop);
    };

    const getCalculatedLollipopData = sortedMainData => {
      const lollipopData = sortedMainData.map((d, i) => ({
        id: i,
        genre: d.genre,
        value: d.value,
        lineColor: chartsVisualElements.colors.lollipopLineColor,
        x1: d.value,
        x2: 0,
        y1: d.genre,
        y2: d.genre,
        cx: d.value,
        cy: d.genre,
        r: chartParams.radius,
        circleColor: chartsVisualElements.colors.lollipopCircleColor
      }));

      update(lollipopData);
      getCalculatedLollipopAxes(lollipopData);
    };

    const getCalculatedLollipopAxes = lollipopData => {
      const { tickSizeValue } = chartParams;
      const { labelsParams } = chartsVisualElements;
      const { fontFamily, axesFontSize, axesLetterSpacing } = labelsParams;
      const {
        calculatedGraphWidth,
        calculatedGraphHeight
      } = getSvgAndGraphParams(chartParams.chartFields.lollipop);

      const lollipopAxesAttributes = selection => {
        selection
          .style("font-family", fontFamily)
          .style("font-size", axesFontSize)
          .style("letter-spacing", axesLetterSpacing);
      };

      const x = d3
        .scaleLinear()
        .domain([0, Math.max(...lollipopData.map(d => d.value))])
        .range([graphMargin.right, calculatedGraphWidth - graphMargin.left]);
      const bottomAxis = d3.axisBottom(x).tickSize(tickSizeValue);
      lollipopGraph
        .append("g")
        .attr("transform", chartParams.translate(0, calculatedGraphHeight))
        .style("color", chartsVisualElements.colors.lollipopAxesColor)
        .call(bottomAxis)
        .call(lollipopAxesAttributes);

      const y = d3
        .scaleBand()
        .domain([...lollipopData.map(d => d.genre)])
        .range([graphMargin.left, calculatedGraphHeight]);
      const leftAxis = d3.axisLeft(y).tickSize(tickSizeValue);
      lollipopGraph
        .append("g")
        .attr("transform", chartParams.translate(graphMargin.right, 0))
        .style("color", chartsVisualElements.colors.lollipopAxesColor)
        .call(leftAxis)
        .call(lollipopAxesAttributes);

      return { x, y };
    };

    const getCalculatedLollipopElementsPositions = () => {
      const { margin } = chartParams;
      const { strokeWidth } = chartsVisualElements;

      const getCalculatedLollipopXPosition = (x, value) => x(value) + margin;
      const getCalculatedLollipopYPosition = (y, value) =>
        y(value) +
        margin +
        strokeWidth * chartDeviations.lollipopDeviations.yPositionDeviation;

      return { getCalculatedLollipopXPosition, getCalculatedLollipopYPosition };
    };

    const renderView = (
      lollipopData,
      getCalculatedLollipopXPosition,
      x,
      getCalculatedLollipopYPosition,
      y
    ) => {
      const { strokeWidth, labelsParams, cursorPointer } = chartsVisualElements;
      const {
        fontFamily,
        fontWeight,
        fontSize,
        labelColor,
        opacityValue,
        letterSpacing
      } = labelsParams;
      const { chartFields, labelTypes, durationTime } = chartParams;
      const { circular, lollipop, pie, line } = chartFields;
      const { lollipopClass } = labelTypes;

      const lollipopLlines = lollipopGraph
        .append("g")
        .selectAll("line")
        .data(lollipopData, d => d.id);

      const lolliPopCircles = lollipopGraph
        .append("g")
        .selectAll("circle")
        .data(lollipopData, d => d.id);

      const lolliPopLabels = lollipopGraph
        .append("g")
        .selectAll("text")
        .data(lollipopData, d => d.id);

      lollipopLlines
        .enter()
        .append("line")
        .attr("x1", x(0))
        .attr("x2", d => x(d.x2))
        .attr("y1", d => getCalculatedLollipopYPosition(y, d.y1))
        .attr("y2", d => getCalculatedLollipopYPosition(y, d.y2))
        .attr("stroke", d => d.lineColor)
        .attr("stroke-width", strokeWidth)
        .transition()
        .duration(durationTime)
        .attr("x1", d => x(d.x1));

      lolliPopCircles
        .enter()
        .append("circle")
        .attr("cx", x(0))
        .attr("cy", d => getCalculatedLollipopYPosition(y, d.cy))
        .attr("r", d => d.r)
        .attr("fill", d => d.circleColor)
        .attr("cursor", cursorPointer)
        .transition()
        .duration(durationTime)
        .attr("cx", d => x(d.cx));

      lolliPopLabels
        .enter()
        .append("text")
        .attr("class", lollipopClass.substr(1))
        .text(d => d.value)
        .attr("x", d => getCalculatedLollipopXPosition(x, d.cx))
        .attr(
          "y",
          d =>
            getCalculatedLollipopYPosition(y, d.cy) +
            chartDeviations.lollipopDeviations.labelsDeviation
        )
        .style("font-family", fontFamily)
        .style("font-size", fontSize)
        .style("font-weight", fontWeight)
        .style("fill", labelColor)
        .style("opacity", opacityValue)
        .style("letter-spacing", letterSpacing);

      lollipopLlines.exit().remove();
      lolliPopCircles.exit().remove();
      lolliPopLabels.exit().remove();
    };

    const handleEvents = (selection, type, clickedType) => {
      const { colors, visible, hidden } = chartsVisualElements;
      const { lollipopCircleColor, lollipopClickedCircleColor } = colors;
      const { labelDurationTime } = chartParams;

      const isClicked = (param1, param2) => (clickedType ? param1 : param2);

      const handleDisplayLabels = (d, i, n) => {
        d3.selectAll(n)
          .transition()
          .duration(labelDurationTime)
          .attr(
            "fill",
            isClicked(lollipopClickedCircleColor, lollipopCircleColor)
          );

        d3.selectAll(type)
          .transition()
          .duration(labelDurationTime)
          .style("opacity", isClicked(visible, hidden));
      };

      lollipopGraph.selectAll(selection).on("click", (d, i, n) => {
        handleDisplayLabels(d, i, n);
        clickedType = !clickedType;
      });
    };

    function update(lollipopData) {
      const { chartFields, labelTypes, clickParams } = chartParams;
      const { lollipop } = chartFields;
      const {
        clickedcircular,
        clickedlollipop,
        clickedpie,
        clickedline
      } = clickParams;
      const { lollipopClass } = labelTypes;

      const { x, y } = getCalculatedLollipopAxes(lollipopData);
      const {
        getCalculatedLollipopXPosition,
        getCalculatedLollipopYPosition
      } = getCalculatedLollipopElementsPositions();

      renderView(
        lollipopData,
        getCalculatedLollipopXPosition,
        x,
        getCalculatedLollipopYPosition,
        y
      );

      handleEvents("circle", lollipopClass, clickedlollipop);
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
  bibliographyDashboard.getData();
})();
