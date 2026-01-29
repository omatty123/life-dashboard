import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import projectData from '../data/projects.js';

export default function MetroMap() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'map-content');

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setTransform(event.transform);
      });

    svg.call(zoom);

    // Initial transform to center the map
    const initialTransform = d3.zoomIdentity
      .translate(width / 2 - 400, height / 2 - 300)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);

    const { lines, stations } = projectData;

    // Draw metro lines
    lines.forEach(line => {
      const lineStations = line.stations.map(id => stations[id]);

      if (lineStations.length > 1) {
        // Create path through stations
        const lineGenerator = d3.line()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveMonotoneX);

        // Draw line background (thicker, for visibility)
        g.append('path')
          .datum(lineStations)
          .attr('d', lineGenerator)
          .attr('fill', 'none')
          .attr('stroke', line.color)
          .attr('stroke-width', 12)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('opacity', 0.3);

        // Draw main line
        g.append('path')
          .datum(lineStations)
          .attr('d', lineGenerator)
          .attr('fill', 'none')
          .attr('stroke', line.color)
          .attr('stroke-width', 6)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
      }

      // Line label at the start
      if (lineStations.length > 0) {
        const firstStation = lineStations[0];
        g.append('text')
          .attr('x', firstStation.x - 60)
          .attr('y', firstStation.y - 30)
          .attr('fill', line.color)
          .attr('font-size', '14px')
          .attr('font-weight', '600')
          .text(line.name);
      }
    });

    // Draw branch lines (parent to children)
    Object.entries(stations).forEach(([id, station]) => {
      if (station.children) {
        station.children.forEach(childId => {
          const child = stations[childId];
          if (child) {
            // Get parent line color
            const parentLine = lines.find(l => l.stations.includes(id));
            const color = parentLine?.color || '#666';

            // Draw branch line
            g.append('line')
              .attr('x1', station.x)
              .attr('y1', station.y)
              .attr('x2', child.x)
              .attr('y2', child.y)
              .attr('stroke', color)
              .attr('stroke-width', 4)
              .attr('stroke-dasharray', '8,4')
              .attr('opacity', 0.6);
          }
        });
      }
    });

    // Draw stations
    Object.entries(stations).forEach(([id, station]) => {
      const isChild = station.parent;
      const isParent = station.children && station.children.length > 0;

      // Find line color for this station
      const stationLine = lines.find(l => l.stations.includes(id));
      const lineColor = stationLine?.color || (isChild ? '#10B981' : '#666');

      // Station group
      const stationGroup = g.append('g')
        .attr('class', 'station')
        .attr('transform', `translate(${station.x}, ${station.y})`)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedStation({ id, ...station, lineColor }))
        .on('mouseenter', function() {
          d3.select(this).select('circle').attr('r', isParent ? 18 : isChild ? 12 : 15);
        })
        .on('mouseleave', function() {
          d3.select(this).select('circle').attr('r', isParent ? 14 : isChild ? 8 : 11);
        });

      // Station circle - outer ring
      stationGroup.append('circle')
        .attr('r', isParent ? 14 : isChild ? 8 : 11)
        .attr('fill', '#09090B')
        .attr('stroke', lineColor)
        .attr('stroke-width', isParent ? 4 : 3)
        .attr('class', 'station-circle');

      // Inner dot for parent stations
      if (isParent) {
        stationGroup.append('circle')
          .attr('r', 5)
          .attr('fill', lineColor);
      }

      // Station label
      const labelY = isChild ? 22 : 28;
      stationGroup.append('text')
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', isChild ? '11px' : '13px')
        .attr('font-weight', '600')
        .text(station.name);

      // Subtitle
      if (station.subtitle) {
        stationGroup.append('text')
          .attr('y', labelY + 14)
          .attr('text-anchor', 'middle')
          .attr('fill', '#888')
          .attr('font-size', '10px')
          .text(station.subtitle);
      }
    });

    // Zoom controls
    window.zoomIn = () => svg.transition().call(zoom.scaleBy, 1.3);
    window.zoomOut = () => svg.transition().call(zoom.scaleBy, 0.7);
    window.zoomReset = () => svg.transition().call(zoom.transform, initialTransform);

  }, []);

  return (
    <div className="relative w-full h-screen bg-[#09090B] overflow-hidden" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={() => window.zoomIn?.()}
          className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-xl font-bold transition-colors"
        >
          +
        </button>
        <button
          onClick={() => window.zoomOut?.()}
          className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-xl font-bold transition-colors"
        >
          −
        </button>
        <button
          onClick={() => window.zoomReset?.()}
          className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-xs font-bold transition-colors"
        >
          ⟲
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-6 left-6 text-zinc-500 text-sm">
        {Math.round(transform.k * 100)}%
      </div>

      {/* Detail Panel */}
      {selectedStation && (
        <div className="absolute top-0 right-0 w-80 h-full bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto">
          <button
            onClick={() => setSelectedStation(null)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white text-2xl"
          >
            ×
          </button>

          <div className="mt-8">
            <div
              className="w-4 h-4 rounded-full mb-4"
              style={{ backgroundColor: selectedStation.lineColor }}
            />
            <h2 className="text-2xl font-bold text-white mb-1">
              {selectedStation.name}
            </h2>
            {selectedStation.subtitle && (
              <p className="text-zinc-400 mb-6">{selectedStation.subtitle}</p>
            )}

            {selectedStation.links && selectedStation.links.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                  Links
                </h3>
                {selectedStation.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
                  >
                    {link.label}
                    <span className="text-zinc-500 ml-2">→</span>
                  </a>
                ))}
              </div>
            )}

            {selectedStation.children && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                  Branch Stations
                </h3>
                {selectedStation.children.map(childId => {
                  const child = projectData.stations[childId];
                  return (
                    <button
                      key={childId}
                      onClick={() => setSelectedStation({ id: childId, ...child, lineColor: selectedStation.lineColor })}
                      className="block w-full text-left px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
                    >
                      {child.name}
                      {child.subtitle && (
                        <span className="text-zinc-500 ml-2">{child.subtitle}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold text-white">Life Map</h1>
        <p className="text-zinc-500 text-sm">Click stations to explore • Scroll to zoom • Drag to pan</p>
      </div>
    </div>
  );
}
