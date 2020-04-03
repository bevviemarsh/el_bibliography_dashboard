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

    // create objects to store all necessary data for building graphs;
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

      circularBarInnerRadius: 15,
      circularBarOuterRadius: (graphWidthValue, graphHeightValue) =>
        Math.min(graphWidthValue, graphHeightValue / 2),
      radius: 5.5,
      clickedCircleRadius: 7,
      pieRadius: (graphWidthValue, graphHeightValue) =>
        Math.min(graphWidthValue, graphHeightValue / 2),
      pieInnerValue: 30,

      margin: 10,
      graphMargin: { top: 20, left: 20, right: 100, bottom: 100 },

      tickSizeValue: "10",

      translate: (firstMarginValue, secondMarginValue) =>
        `translate(${firstMarginValue}, ${secondMarginValue})`,

      durationTime: 2000,
      delayTime: 1000,
      labelDurationTime: 200
    };

    const chartsManager = {
      getFormattedYear: d => Number(d.year.slice(5)),
      getElementsHigherThanOne: arr =>
        arr.filter(item => filterDataHigherThenOne(item, PROPERTY_VALUE)),
      getAndCountElementsLowerThenOne: arr =>
        getDataByProperty(
          arr,
          filterDataLowerThenOne,
          getItemByProperty,
          PROPERTY_VALUE
        ).reduce((acc, currVal) => acc + currVal)
    };

    // get graphMargin value to set all deviations related to the positioning;
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
        lineChartVerticalParam: graphMargin.left * 3,
        lineChartHorizontalParam: graphMargin.top * 3,
        lineChartDataYearDeviationForXAxes: 10
      }
    };

    // operations connected with svg element and charts params;
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

    // create main charts for dahsboard
    const { chartFields, translate } = chartParams;
    const { circular, lollipop, pie, line } = chartFields;
    const {
      circularBarPlotDeviations,
      lollipopDeviations,
      pieChartDeviations,
      lineChartDeviations
    } = chartDeviations;

    const circularPosition = translate(
      circularBarPlotDeviations.chartPositionDeviation.horizontalParam,
      circularBarPlotDeviations.chartPositionDeviation.verticalParam
    );
    const lollipopPosition = translate(
      lollipopDeviations.chartPositionDeviation.horizontalParam,
      lollipopDeviations.chartPositionDeviation.verticalParam
    );
    const piePosition = translate(
      pieChartDeviations.chartPositionDeviation.horizontalParam,
      pieChartDeviations.chartPositionDeviation.verticalParam
    );
    const lineChartPosition = translate(
      lineChartDeviations.lineChartVerticalParam,
      lineChartDeviations.lineChartHorizontalParam
    );

    const circularGraph = getMainChartStructure(circular, circularPosition);
    const lollipopGraph = getMainChartStructure(lollipop, lollipopPosition);
    const pieGraph = getMainChartStructure(pie, piePosition);
    const lineGraph = getMainChartStructure(line, lineChartPosition);

    // data operations
    const createDataHelpers = () => {
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

      return {
        getItemByProperty,
        filterDataHigherThenOne,
        filterDataLowerThenOne,
        sortDataByProperty,
        getDataByProperty,
        getAdditionalData
      };
    };

    const getPreparedData = data => {
      const {
        getItemByProperty,
        sortDataByProperty,
        getDataByProperty,
        getAdditionalData
      } = createDataHelpers();

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

      const dataPublishers = getDataByProperty(
        data,
        getItemByProperty,
        getItemByProperty,
        PROPERTY_PUBLISHER
      ).concat(
        getDataByProperty(
          additionalData,
          getItemByProperty,
          getItemByProperty,
          PROPERTY_PUBLISHER
        )
      );

      const getCountedDataYears = (data, propertyName) => {
        const allPeriods = [];

        const mainData = data;
        const additionalData = getAdditionalData(
          data,
          getItemByProperty,
          PROPERTY_OTHERS
        );

        const mainYears = getDataByProperty(
          mainData,
          getItemByProperty,
          getItemByProperty,
          PROPERTY_YEAR
        );
        const additionalYears = getDataByProperty(
          additionalData,
          getItemByProperty,
          getItemByProperty,
          PROPERTY_YEAR
        );

        const allYears = mainYears.concat(additionalYears);
        const minYear = Math.floor(Math.min(...allYears) / 10) * 10;
        const maxYear = Math.round(Math.max(...allYears) / 10) * 10;

        const getPeriods = (data, firstYear, secondYear) => {
          const addFilteredPeriod = item => {
            if (
              getItemByProperty(item, propertyName) > firstYear &&
              getItemByProperty(item, propertyName) <= secondYear
            ) {
              allPeriods.push(`${firstYear}-${secondYear}`);
            }
          };

          data.forEach(item => addFilteredPeriod(item));
          getAdditionalData(
            data,
            getItemByProperty,
            PROPERTY_OTHERS
          ).forEach(item => addFilteredPeriod(item));

          if (firstYear === maxYear) return;
          firstYear += 10;
          return getPeriods(data, firstYear, secondYear + 10);
        };
        getPeriods(data, minYear, minYear + 10);

        return allPeriods;
      };

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

      const sortedDataForPieChart = getCountedAndSortedData(
        dataPublishers,
        PROPERTY_PUBLISHER
      );

      const sortedDataForLineGraph = getCountedAndSortedData(
        getCountedDataYears(data, PROPERTY_YEAR),
        PROPERTY_YEAR
      );

      getCalulatedData(
        sortedDataForCircular,
        sortedDataForLollipop,
        sortedDataForPieChart,
        sortedDataForLineGraph
      );
    };

    const getCalulatedData = (
      sortedDataForCircular,
      sortedDataForLollipop,
      sortedDataForPieChart,
      sortedDataForLineGraph
    ) => {
      const circularBarPlotData = sortedDataForCircular.map((d, i) => ({
        id: i,
        city: d.city,
        value: d.value,
        barColor: chartsVisualElements.colors.circularBarColor
      }));

      const lollipopData = sortedDataForLollipop.map((d, i) => ({
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

      const preparedDataForPieChart = () => {
        const {
          getItemByProperty,
          filterDataHigherThenOne,
          filterDataLowerThenOne,
          getDataByProperty
        } = createDataHelpers();

        const getElementsHigherThanOne = arr =>
          arr.filter(item => filterDataHigherThenOne(item, PROPERTY_VALUE));
        const getAndCountElementsLowerThenOne = arr =>
          getDataByProperty(
            arr,
            filterDataLowerThenOne,
            getItemByProperty,
            PROPERTY_VALUE
          ).reduce((acc, currVal) => acc + currVal);

        const mainData = getElementsHigherThanOne(sortedDataForPieChart);
        const countedOthers = getAndCountElementsLowerThenOne(
          sortedDataForPieChart
        );

        const others = [countedOthers].map(d => ({
          publisher: "Other publishers",
          value: d
        }));

        return mainData.concat(others);
      };

      const pieChartData = preparedDataForPieChart().map((d, i) => ({
        id: i,
        publisher: d.publisher,
        value: d.value
      }));

      const lineChartData = sortedDataForLineGraph.map((d, i) => ({
        id: i,
        year: chartsManager.getFormattedYear(d),
        value: d.value,
        r: chartParams.radius,
        cx: chartsManager.getFormattedYear(d),
        cy: d.value,
        text: d.value
      }));

      update(circularBarPlotData, lollipopData, pieChartData, lineChartData);
      getCalculatedCircularBarsData(circularBarPlotData);
      getCalculatedLollipopAxes(lollipopData);
      getPieChartParams(pieChartData);
    };

    // calculation of scales, axes, labels and other necessary elements for charts
    const getCalculatedCircularBarsData = circularBarPlotData => {
      const {
        chartFields,
        circularBarInnerRadius,
        circularBarOuterRadius
      } = chartParams;
      const {
        calculatedGraphWidth,
        calculatedGraphHeight
      } = getSvgAndGraphParams(chartFields.circular);

      const circularX = d3
        .scaleBand()
        .range([0, 2 * Math.PI])
        .domain(circularBarPlotData.map(d => d.city));
      const circularY = d3
        .scaleRadial()
        .range([
          circularBarInnerRadius,
          circularBarOuterRadius(calculatedGraphWidth, calculatedGraphHeight)
        ])
        .domain([0, Math.max(...circularBarPlotData.map(d => d.value))]);

      const barsData = d3
        .arc()
        .innerRadius(circularBarInnerRadius)
        .outerRadius(d => circularY(d.value))
        .startAngle(d => circularX(d.city))
        .endAngle(d => circularX(d.city) + circularX.bandwidth());

      return { circularX, circularY, barsData };
    };

    const getCalculatedCircularBarplotLabels = () => {
      const getCircularLabelsPositions = (x, y, value1, value2) => `rotate(
          ${((x(value1) + x.bandwidth() / 2) * 180) / Math.PI -
            90}) translate(${y(value2) + 5},0)`;

      return getCircularLabelsPositions;
    };

    const getCalculatedLollipopAxes = lollipopData => {
      const { chartFields, tickSizeValue } = chartParams;
      const { labelsParams } = chartsVisualElements;
      const { fontFamily, axesFontSize, axesLetterSpacing } = labelsParams;
      const {
        calculatedGraphWidth,
        calculatedGraphHeight
      } = getSvgAndGraphParams(chartFields.lollipop);

      const lollipopAxesAttributes = selection =>
        selection
          .style("font-family", fontFamily)
          .style("font-size", axesFontSize)
          .style("letter-spacing", axesLetterSpacing);

      const lollipopX = d3
        .scaleLinear()
        .domain([0, Math.max(...lollipopData.map(d => d.value))])
        .range([graphMargin.right, calculatedGraphWidth - graphMargin.left]);
      const bottomAxis = d3.axisBottom(lollipopX).tickSize(tickSizeValue);
      lollipopGraph
        .append("g")
        .attr("transform", chartParams.translate(0, calculatedGraphHeight))
        .style("color", chartsVisualElements.colors.lollipopAxesColor)
        .call(bottomAxis)
        .call(lollipopAxesAttributes);

      const lollipopY = d3
        .scaleBand()
        .domain([...lollipopData.map(d => d.genre)])
        .range([graphMargin.left, calculatedGraphHeight]);
      const leftAxis = d3.axisLeft(lollipopY).tickSize(tickSizeValue);
      lollipopGraph
        .append("g")
        .attr("transform", chartParams.translate(graphMargin.right, 0))
        .style("color", chartsVisualElements.colors.lollipopAxesColor)
        .call(leftAxis)
        .call(lollipopAxesAttributes);

      return { lollipopX, lollipopY };
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

    const getPieChartParams = pieChartData => {
      const {
        calculatedGraphWidth,
        calculatedGraphHeight
      } = getSvgAndGraphParams(chartParams.chartFields.pie);

      const getPie = d3.pie().value(d => d.value);
      const pie = getPie(pieChartData);

      const arcGenerator = d3
        .arc()
        .innerRadius(0)
        .outerRadius(
          chartParams.pieRadius(calculatedGraphWidth, calculatedGraphHeight)
        );

      return { pie, arcGenerator };
    };

    const getCalculatedPieChartLabels = arcGenerator => {
      const {
        calculatedGraphWidth,
        calculatedGraphHeight
      } = getSvgAndGraphParams(chartParams.chartFields.pie);

      const outerArc = d3
        .arc()
        .innerRadius(
          chartParams.pieRadius(calculatedGraphWidth, calculatedGraphHeight) *
            chartDeviations.pieChartDeviations.labelsAndPolylinesDeviation
              .outerArcParams.innerRadius
        )
        .outerRadius(
          chartParams.pieRadius(calculatedGraphWidth, calculatedGraphHeight) *
            chartDeviations.pieChartDeviations.labelsAndPolylinesDeviation
              .outerArcParams.outerRadius
        );

      const midangle = d => d.startAngle + (d.endAngle - d.startAngle) / 2;

      const getTranslatedPieLabels = d => {
        const pos = outerArc.centroid(d);
        pos[0] =
          chartParams.pieRadius(calculatedGraphWidth, calculatedGraphHeight) *
          chartDeviations.pieChartDeviations.labelsAndPolylinesDeviation
            .midAngleParam *
          (midangle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      };

      const getPositionatedPieLabels = d =>
        midangle(d) < Math.PI ? "start" : "end";

      const getPositionatedPiePolylines = d => {
        const posA = arcGenerator.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        posC[0] =
          chartParams.pieRadius(calculatedGraphWidth, calculatedGraphHeight) *
          1.3 *
          (midangle(d) < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      };

      return {
        getTranslatedPieLabels,
        getPositionatedPieLabels,
        getPositionatedPiePolylines
      };
    };

    const getCalculatedLineChartAxes = lineChartData => {
      const {
        calculatedGraphWidth,
        calculatedGraphHeight
      } = getSvgAndGraphParams(chartParams.chartFields.line);
      const { labelsParams } = chartsVisualElements;
      const { fontFamily, axesFontSize, axesLetterSpacing } = labelsParams;

      const lineChartAxesAttributes = selection =>
        selection
          .style("font-family", fontFamily)
          .style("font-size", axesFontSize)
          .style("letter-spacing", axesLetterSpacing);

      const lineX = d3
        .scaleLinear()
        .domain([
          Math.min(...lineChartData.map(d => d.year)) -
            chartDeviations.lineChartDeviations
              .lineChartDataYearDeviationForXAxes,
          Math.max(...lineChartData.map(d => d.year))
        ])
        .range([0, calculatedGraphWidth]);
      const bottomAxis = d3
        .axisBottom(lineX)
        .ticks(6)
        .tickFormat(d3.format("d"));
      lineGraph
        .append("g")
        .attr("transform", chartParams.translate(0, calculatedGraphHeight))
        .style("color", chartsVisualElements.colors.lineChartAxesColor)
        .call(bottomAxis)
        .call(lineChartAxesAttributes);

      const lineY = d3
        .scaleLinear()
        .domain([Math.max(...lineChartData.map(d => d.value)), 0])
        .range([graphMargin.left, calculatedGraphHeight]);
      const leftAxis = d3.axisLeft(lineY);
      lineGraph
        .append("g")
        .style("color", chartsVisualElements.colors.lineChartAxesColor)
        .call(leftAxis)
        .call(lineChartAxesAttributes);

      return { lineX, lineY };
    };

    const getLine = (xAxis, yAxis) =>
      d3
        .line()
        .x(d => xAxis(d.year))
        .y(d => yAxis(d.value));

    const getCalculatedLineChartElementsPositions = () => {
      const getCalculatedLineYPosition = (y, value) =>
        y(value) - graphMargin.left;

      return { getCalculatedLineYPosition };
    };

    // animations and user events
    const handlePathAnimation = (d, i, n) => {
      const { delayTime, durationTime } = chartParams;

      let totalLength = n[i].getTotalLength();
      d3.select(n[i])
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .delay(delayTime)
        .duration(durationTime)
        .attr("stroke-dashoffset", 0);
    };

    const handleArcAnimation = (d, arcGenerator) => {
      const i = d3.interpolate(d.endAngle, d.startAngle);

      const getPieAnimated = t => {
        d.startAngle = i(t);
        return arcGenerator(d);
      };

      return getPieAnimated;
    };

    const handleEvents = (
      graphType,
      selection,
      type,
      clickedType,
      clickedColor,
      color
    ) => {
      const { visible, hidden } = chartsVisualElements;
      const { labelDurationTime } = chartParams;

      const isClicked = (param1, param2) => (clickedType ? param1 : param2);

      const handleDisplayLabels = (d, i, n) => {
        d3.selectAll(n)
          .transition()
          .duration(labelDurationTime)
          .attr("fill", isClicked(clickedColor, color));

        d3.selectAll(type)
          .transition()
          .duration(labelDurationTime)
          .style("opacity", isClicked(visible, hidden));
      };

      graphType.selectAll(selection).on("click", (d, i, n) => {
        handleDisplayLabels(d, i, n);
        clickedType = !clickedType;
      });
    };

    // grouped attributes for labels
    const getLabelVisualAttributes = selection => {
      const { labelsParams } = chartsVisualElements;
      const {
        fontFamily,
        fontWeight,
        fontSize,
        labelColor,
        opacityValue,
        letterSpacing
      } = labelsParams;

      return selection
        .style("font-family", fontFamily)
        .style("font-size", fontSize)
        .style("font-weight", fontWeight)
        .style("fill", labelColor)
        .style("opacity", opacityValue)
        .style("letter-spacing", letterSpacing);
    };

    const renderView = (
      lollipopData,
      getCalculatedLollipopXPosition,
      lollipopX,
      getCalculatedLollipopYPosition,
      lollipopY,
      circularBarPlotData,
      circularX,
      circularY,
      barsData,
      getCircularLabelsPositions,
      pie,
      arcGenerator,
      getTranslatedPieLabels,
      getPositionatedPieLabels,
      getPositionatedPiePolylines,
      lineChartData,
      lineX,
      lineY,
      calculatedLine,
      getCalculatedLineYPosition
    ) => {
      const {
        colors,
        strokeWidth,
        labelsParams,
        noneFill,
        cursorPointer
      } = chartsVisualElements;
      const { pieLinesColor, piePolylineColors } = colors;
      const { opacityValue, textAnchorPosition } = labelsParams;
      const { labelTypes, durationTime } = chartParams;
      const { circularClass, lollipopClass, pieClass, lineClass } = labelTypes;

      const circularBars = circularGraph
        .append("g")
        .selectAll("path")
        .data(circularBarPlotData, d => d.id);
      const circularLabels = circularGraph
        .append("g")
        .selectAll("text")
        .data(circularBarPlotData, d => d.id);

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

      const piePath = pieGraph
        .append("g")
        .selectAll("path")
        .data(pie, d => d.data.id);
      const pieLabels = pieGraph
        .append("g")
        .selectAll("text")
        .data(pie, d => d.data.id);
      const piePolylines = pieGraph
        .append("g")
        .selectAll("polyline")
        .data(pie, d => d.data.id);

      const lineChartLabels = lineGraph
        .append("g")
        .selectAll("text")
        .data(lineChartData, d => d.id);

      const lineChartLine = lineGraph
        .append("g")
        .selectAll("path")
        .data(lineChartData, d => d.id);

      const lineChartCircles = lineGraph
        .append("g")
        .selectAll("circle")
        .data(lineChartData, d => d.id);

      circularBars
        .enter()
        .append("path")
        .attr("fill", d => d.barColor)
        .attr("d", barsData)
        .attr("cursor", cursorPointer);

      circularLabels
        .enter()
        .append("text")
        .attr("class", circularClass.substr(1))
        .text(d => `${d.city}: ${d.value}`)
        .attr("text-anchor", textAnchorPosition)
        .attr("transform", d =>
          getCircularLabelsPositions(circularX, circularY, d.city, d.value)
        )
        .call(getLabelVisualAttributes);

      lollipopLlines
        .enter()
        .append("line")
        .attr("x1", lollipopX(0))
        .attr("x2", d => lollipopX(d.x2))
        .attr("y1", d => getCalculatedLollipopYPosition(lollipopY, d.y1))
        .attr("y2", d => getCalculatedLollipopYPosition(lollipopY, d.y2))
        .attr("stroke", d => d.lineColor)
        .attr("stroke-width", strokeWidth)
        .transition()
        .duration(durationTime)
        .attr("x1", d => lollipopX(d.x1));

      lolliPopCircles
        .enter()
        .append("circle")
        .attr("cx", lollipopX(0))
        .attr("cy", d => getCalculatedLollipopYPosition(lollipopY, d.cy))
        .attr("r", d => d.r)
        .attr("fill", d => d.circleColor)
        .attr("cursor", cursorPointer)
        .transition()
        .duration(durationTime)
        .attr("cx", d => lollipopX(d.cx));

      lolliPopLabels
        .enter()
        .append("text")
        .attr("class", lollipopClass.substr(1))
        .text(d => d.value)
        .attr("x", d => getCalculatedLollipopXPosition(lollipopX, d.cx))
        .attr(
          "y",
          d =>
            getCalculatedLollipopYPosition(lollipopY, d.cy) +
            chartDeviations.lollipopDeviations.labelsDeviation
        )
        .call(getLabelVisualAttributes);

      piePath
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", chartsVisualElements.colors.pieColor)
        .attr("stroke", pieLinesColor)
        .attr("stroke-width", strokeWidth)
        .attr("cursor", cursorPointer)
        .transition()
        .duration(durationTime)
        .attrTween("d", d => handleArcAnimation(d, arcGenerator));

      pieLabels
        .enter()
        .append("text")
        .attr("class", pieClass.substr(1))
        .text(d => d.data.publisher)
        .attr("transform", d => getTranslatedPieLabels(d))
        .style("text-anchor", d => getPositionatedPieLabels(d))
        .call(getLabelVisualAttributes);

      piePolylines
        .enter()
        .append("polyline")
        .attr("class", pieClass.substr(1))
        .attr("fill", noneFill)
        .attr("stroke", piePolylineColors)
        .attr("stroke-width", strokeWidth)
        .attr("points", d => getPositionatedPiePolylines(d))
        .style("opacity", opacityValue);

      lineChartLabels
        .enter()
        .append("text")
        .attr("class", lineClass.substr(1))
        .text(d => d.text)
        .attr("x", d => lineX(d.cx))
        .attr("y", d => getCalculatedLineYPosition(lineY, d.cy))
        .call(getLabelVisualAttributes);

      lineChartLine
        .enter()
        .append("path")
        .attr("d", calculatedLine(lineChartData))
        .attr("stroke", chartsVisualElements.colors.lineChartLineColor)
        .attr("stroke-width", strokeWidth)
        .attr("fill", noneFill)
        .each((d, i, n) => handlePathAnimation(d, i, n));

      lineChartCircles
        .enter()
        .append("circle")
        .attr("r", d => d.r)
        .attr("cx", d => lineX(d.year))
        .attr("cy", d => lineY(d.value))
        .attr("fill", chartsVisualElements.colors.lineChartCircleColor)
        .attr("cursor", cursorPointer)
        .style("opacity", opacityValue)
        .transition()
        .duration(durationTime)
        .style("opacity", 1);

      circularBars.exit().remove();
      circularLabels.exit().remove();
      lollipopLlines.exit().remove();
      lolliPopCircles.exit().remove();
      lolliPopLabels.exit().remove();
      piePath.exit().remove();
      pieLabels.exit().remove();
      piePolylines.exit().remove();
      lineChartLabels.exit().remove();
      lineChartLine.exit().remove();
      lineChartCircles.exit().remove();
    };

    const update = (
      circularBarPlotData,
      lollipopData,
      pieChartData,
      lineChartData
    ) => {
      const { labelTypes, clickParams } = chartParams;
      const {
        clickedcircular,
        clickedlollipop,
        clickedpie,
        clickedline
      } = clickParams;
      const { circularClass, lollipopClass, pieClass, lineClass } = labelTypes;
      const { colors } = chartsVisualElements;
      const {
        circularBarColor,
        clickedCircularBarColor,
        lollipopCircleColor,
        lollipopClickedCircleColor,
        pieColor,
        pieClickedColor,
        lineChartCircleColor,
        lineChartClickedCircleColor
      } = colors;

      const { circularX, circularY, barsData } = getCalculatedCircularBarsData(
        circularBarPlotData
      );
      const getCircularLabelsPositions = getCalculatedCircularBarplotLabels();

      const { lollipopX, lollipopY } = getCalculatedLollipopAxes(lollipopData);
      const {
        getCalculatedLollipopXPosition,
        getCalculatedLollipopYPosition
      } = getCalculatedLollipopElementsPositions();

      const { pie, arcGenerator } = getPieChartParams(pieChartData);
      const {
        getTranslatedPieLabels,
        getPositionatedPieLabels,
        getPositionatedPiePolylines
      } = getCalculatedPieChartLabels(arcGenerator);

      const { lineX, lineY } = getCalculatedLineChartAxes(lineChartData);
      const calculatedLine = getLine(lineX, lineY);
      const {
        getCalculatedLineYPosition
      } = getCalculatedLineChartElementsPositions();

      renderView(
        lollipopData,
        getCalculatedLollipopXPosition,
        lollipopX,
        getCalculatedLollipopYPosition,
        lollipopY,
        circularBarPlotData,
        circularX,
        circularY,
        barsData,
        getCircularLabelsPositions,
        pie,
        arcGenerator,
        getTranslatedPieLabels,
        getPositionatedPieLabels,
        getPositionatedPiePolylines,
        lineChartData,
        lineX,
        lineY,
        calculatedLine,
        getCalculatedLineYPosition
      );

      handleEvents(
        circularGraph,
        "path",
        circularClass,
        clickedcircular,
        clickedCircularBarColor,
        circularBarColor
      );
      handleEvents(
        lollipopGraph,
        "circle",
        lollipopClass,
        clickedlollipop,
        lollipopClickedCircleColor,
        lollipopCircleColor
      );
      handleEvents(
        pieGraph,
        "path",
        pieClass,
        clickedpie,
        pieClickedColor,
        pieColor
      );
      handleEvents(
        lineGraph,
        "circle",
        lineClass,
        clickedline,
        lineChartClickedCircleColor,
        lineChartCircleColor
      );
    };

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
