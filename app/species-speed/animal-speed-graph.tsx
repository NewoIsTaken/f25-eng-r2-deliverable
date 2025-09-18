/* eslint-disable */
"use client";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

// TODO: Write this interface
interface AnimalDatum {
  name: string;
  diet: string;
  speed: number;
}

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);
  const [counter, setCounter] = useState(0);

  // TODO: Load CSV data
  useEffect(() => {
    d3.csv("/sample_animals.csv").then((rawData) => {
      // Transform the raw data to fit the AnimalDatum interface
      const formattedData = rawData.map((animal) => ({
        name: animal.Animal || "",
        diet: animal.Diet || "",
        speed: parseFloat(animal["Average Speed (km/h)"] || ""),
      }));
      setAnimalData(formattedData);
    });
  }, []);

  function handleClick() {
    setCounter(counter + 1);
    console.log(animalData);
  }

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 80, left: 100 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = d3
      .select(graphRef.current!)
      .append<SVGSVGElement>("svg")
      .attr("width", width + 50)
      .attr("height", height + 100)
      .attr("overflow", "visible")
      .attr("style", "margin-left: 10px;");

    // TODO: Implement the rest of the graph
    // HINT: Look up the documentation at these links
    // https://github.com/d3/d3-scale#band-scales
    // https://github.com/d3/d3-scale#linear-scales
    // https://github.com/d3/d3-scale#ordinal-scales
    // https://github.com/d3/d3-axis

    var x = d3
      .scaleBand()
      .range([0, width])
      .domain(
        animalData.map(function (d) {
          return d.name;
        }),
      )
      .padding(0.2);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 120]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Bars
    svg
      .selectAll("mybar")
      .data(animalData)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d.name) || "";
      })
      .attr("y", function (d) {
        return y(d.speed);
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(d.speed);
      })
      .attr("fill", function (d) {
        if (d.diet === "Carnivore") return "red";
        if (d.diet === "Herbivore") return "green";
        if (d.diet === "Omnivore") return "brown";
        return "#a51c30"; // Default color if diet is unknown
      });

    svg
      .append("text")
      .attr("transform", "translate(" + width / 2 + " ," + (height + margin.bottom + 10) + ")")
      .style("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .text("Animal Names");

    // Add Y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -(height / 2))
      .style("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .text("Average Speed (km/h)");

    svg.append("circle").attr("cx", width - 160).attr("cy", 10).attr("r", 6).style("fill", "red");
    svg.append("circle").attr("cx", width - 160).attr("cy", 40).attr("r", 6).style("fill", "green");
        svg.append("circle").attr("cx", width - 160).attr("cy", 70).attr("r", 6).style("fill", "brown");

    svg
      .append("text")
      .attr("x", width - 150)
      .attr("y", 15)
      .text("Carnivore")
      .style("font-size", "15px")
      .style("fill", "hsl(var(--foreground))")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", width - 150)
      .attr("y", 45)
      .text("Herbivore")
      .style("font-size", "15px")
      .style("fill", "hsl(var(--foreground))")
      .attr("alignment-baseline", "middle");
      svg
      .append("text")
      .attr("x", width - 150)
      .attr("y", 75)
      .text("Omnivore")
      .style("font-size", "15px")
      .style("fill", "hsl(var(--foreground))")
      .attr("alignment-baseline", "middle");
  }, [animalData]);

  // TODO: Return the graph
  return <div ref={graphRef}></div>;
}
