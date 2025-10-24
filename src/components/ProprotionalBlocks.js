import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

const ProportionalBlocks = ({
    categories,
    totalCounts,
    onDataPointClick,
    isLoading,
    containerWidth = 50
}) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);

    const chartData = useMemo(() => {
        if (!categories || Object.keys(categories).length === 0) {
            return null;
        }

       const items = Object.entries(categories)
        .map(([key, categoryData], idx) => ({
            name: key.replace(/_/g, ' '),
            value: categoryData.count || 0,
            key: key,
            rawData: categoryData,
            index: idx 
        }))
        .filter(item => item.value > 0);


        return {
            name: "root",
            children: items
        };
    }, [categories]);

    const getColorForValue = (value, maxValue, minValue) => {
        const normalized = (value - minValue) / (maxValue - minValue || 1);

        if (normalized > 0.8) {
            const intensity = 0.8 + (normalized - 0.8) * 0.2;
            return `rgb(${Math.round(220 * intensity)}, ${Math.round(80 * intensity)}, ${Math.round(80 * intensity)})`; 
        } else if (normalized > 0.6) {
            const intensity = 0.7 + (normalized - 0.6) * 0.5;
            return `rgb(${Math.round(160 * intensity)}, ${Math.round(120 * intensity)}, ${Math.round(220 * intensity)})`;
        } else if (normalized > 0.4) {
            const intensity = 0.6 + (normalized - 0.4) * 0.7;
            return `rgb(${Math.round(100 * intensity)}, ${Math.round(160 * intensity)}, ${Math.round(255 * intensity)})`;
        } else if (normalized > 0.2) {
            const intensity = 0.5 + (normalized - 0.2) * 0.8;
            return `rgb(${Math.round(80 * intensity)}, ${Math.round(200 * intensity)}, ${Math.round(180 * intensity)})`;
        } else {
            const intensity = 0.4 + normalized * 0.6;
            return `rgb(${Math.round(180 * intensity)}, ${Math.round(220 * intensity)}, ${Math.round(240 * intensity)})`;
        }
    };


    // Calculate responsive dimensions based on container width
    const baseWidth = Math.max(320, (window.innerWidth * containerWidth / 100) - 120);
    const width = baseWidth;
    // Maintain aspect ratio and ensure good height regardless of width
    const aspectRatio = 0.75; // height/width ratio
    const minHeight = 450;
    const maxHeight = Math.max(minHeight, window.innerHeight * 0.8);
    const calculatedHeight = Math.max(minHeight, baseWidth * aspectRatio);
    const height = Math.min(calculatedHeight, maxHeight);


    useEffect(() => {
        if (!chartData || !svgRef.current) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("font", "14px sans-serif");

        const tooltip = d3.select(tooltipRef.current);

        const values = chartData.children.map(d => d.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);

        const root = d3.hierarchy(chartData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        d3.treemap()
            .size([width, height])
            .padding(2)
            .round(true)(root);

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        const g = svg.append("g");

        const cell = g.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        cell.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => getColorForValue(d.value, maxValue, minValue))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.85);
                
                tooltip
                    .style("opacity", 1)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .html(`
                        <div style="font-weight: bold; margin-bottom: 4px; text-transform: capitalize;">
                            ${d.data.name}
                        </div>
                        <div>Count: ${d.value.toLocaleString()}</div>
                        <div>Percentage: ${((d.value / root.value) * 100).toFixed(2)}%</div>
                    `);
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1);
                
                tooltip.style("opacity", 0);
            })
             .on("click", function(event, d) {
                if (onDataPointClick) {
                    onDataPointClick(null, null, {
                        dataPointIndex: d.data.index,
                        selectedCategory: d.data.key,
                        categoryData: d.data.rawData
                    });
                }
            });

        cell.append("clipPath")
            .attr("id", (d, i) => `clip-${i}`)
            .append("rect")
            .attr("width", d => d.x1 - d.x0 - 4)
            .attr("height", d => d.y1 - d.y0 - 4);

        const text = cell.append("text")
            .attr("clip-path", (d, i) => `url(#clip-${i})`)
            .style("user-select", "none")
            .style("pointer-events", "none");

        const maxArea = d3.max(root.leaves(), d => (d.x1 - d.x0) * (d.y1 - d.y0));
        const minArea = d3.min(root.leaves(), d => (d.x1 - d.x0) * (d.y1 - d.y0));
        
        // Improved font scaling - smaller and more proportional
        const fontScale = d3.scaleLinear()
            .domain([minArea, maxArea])
            .range([8, 18])
            .clamp(true);
        
        // Better text length calculation
        const lengthScale = d3.scaleLinear()
            .domain([minArea, maxArea])
            .range([8, 60])
            .clamp(true);
        
        // Improved vertical positioning
        const yScale = d3.scaleLinear()
            .domain([minArea, maxArea])
            .range([14, 28])
            .clamp(true);

        text.append("tspan")
            .attr("x", 6)
            .attr("y", d => {
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                return yScale(area);
            })
            .attr("fill", "white")
            .attr("font-weight", "600")
            .style("text-shadow", "0 1px 4px rgba(0,0,0,0.7)")
            .style("font-size", d => {
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                const fontSize = fontScale(area);
                return `${fontSize}px`;
            })
            .text(d => {
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                const width = d.x1 - d.x0;
                const height = d.y1 - d.y0;
                
                // Only show text if block is large enough
                if (width < 40 || height < 25) return "";
                
                const maxLength = Math.floor(lengthScale(area));
                const name = d.data.name;
                
                // Better text truncation
                if (name.length > maxLength) {
                    return maxLength > 3 ? name.substring(0, maxLength - 3) + "..." : "";
                }
                return name;
            })
            .style("text-transform", "capitalize")
            .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");

        text.append("tspan")
            .attr("x", 6)
            .attr("y", d => {
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                const fontSize = fontScale(area);
                return yScale(area) + fontSize + 6;
            })
            .attr("fill", "rgba(255, 255, 255, 0.9)")
            .attr("font-weight", "500")
            .style("text-shadow", "0 1px 3px rgba(0,0,0,0.6)")
            .style("font-size", d => {
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                const fontSize = fontScale(area) * 0.75;
                return `${Math.max(fontSize, 8)}px`;
            })
            .text(d => {
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                const width = d.x1 - d.x0;
                const height = d.y1 - d.y0;
                
                // Only show percentage if block is large enough and significant
                if (width < 60 || height < 40 || area < maxArea * 0.03) return "";
                
                const percentage = ((d.value / root.value) * 100).toFixed(1);
                return `${percentage}%`;
            })
            .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");


    }, [chartData, onDataPointClick, containerWidth, width, height]);

    if (!categories || Object.keys(categories).length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3>No Categories Found</h3>
            </div>
        );
    }

    if (!chartData) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3>No data available</h3>
            </div>
        );
    }

    return (
        <div >
            <div>
                Zoom in for better view. Click on blocks to filter data.
            </div>
            <div>
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 10
                }}>
                    <div style={{
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                </div>
            )}


            <div style={{ 
                width: '100%',
                height: 'auto',
                margin: '0 auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <svg 
                    ref={svgRef}
                    style={{ 
                        width: '100%', 
                        height: 'auto',
                        display: 'block'
                    }}
                />
            </div>

        
            <div
                ref={tooltipRef}
                style={{
                    position: 'absolute',
                    opacity: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    fontSize: '13px',
                    zIndex: 1000,
                    transition: 'opacity 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
            />

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
        </div>
      
      
    );
};

export default ProportionalBlocks;