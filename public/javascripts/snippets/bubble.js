/*!
 * Bubble chart snippets
 */

 function bubble (data, options) {
  'use strict';

  // Chart dimensions
  var chart = d3.select('#' + (options.id || 'chart'));
  var unit = (parseInt(chart.style('width')) || 300) / 100;
  var margin = {top: 3 * unit, right: 3 * unit, bottom: 10 * unit, left: 12 * unit};
  var width = Math.max(100 * unit, 300) - margin.right - margin.left;
  var height = Math.max(0.666667 * width || 200, 200) - margin.top - margin.bottom;

  // Coordinates and scales
  var xs = data.map(function (d) { return d[0]; });
  var ys = data.map(function (d) { return d[1]; });
  var rs = data.map(function (d) { return d[2]; });
  var xmin = d3.min(xs);
  var xmax = d3.max(xs);
  var ymin = d3.min(ys);
  var ymax = d3.max(ys);
  var rmin = d3.min(rs);
  var rmax = d3.max(rs);
  var x = d3.scale.linear().domain([xmin - 0.5, xmax + 0.5]).range([0, width]);
  var y = d3.scale.linear().domain([ymin * 0.9, ymax * 1.1]).range([height, 0]);

  // Create the SVG container and set the origin
  var svg = chart.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Set axes
  var n = Math.max(Math.min(Math.round(width / 100), 12), 6);
  var gx = d3.svg.axis().orient('bottom').scale(x).ticks(n);
  var gy = d3.svg.axis().orient('left').scale(y).ticks(6);
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(gx.outerTickSize(0).tickPadding(4).tickFormat(d3.format('d')));
  svg.append('g')
    .attr('class', 'axis')
    .call(gy.outerTickSize(0).tickPadding(4).tickFormat(d3.format('d')));

  // Set labels
  var labels = options.labels;
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height)
    .attr('dy', '3em')
    .text(labels.x.text);
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('y', 0)
    .attr('dy', '-3em')
    .attr('transform', 'rotate(-90)')
    .text(labels.y.text);

  // Add grid lines
  var grids = options.grids;
  if (grids.x.display) {
    svg.append('g')
       .attr('class', 'grid')
       .attr('stroke-dasharray', '6, 4')
       .attr('transform', 'translate(0,' + height + ')')
       .call(gx.tickSize(-height, 0, 0).tickFormat(''));
  }
  if (grids.y.display) {
    svg.append('g')
       .attr('class', 'grid')
       .attr('stroke-dasharray', '6, 4')
       .call(gy.tickSize(-width, 0, 0).tickFormat(''));
  }

  // Add dots
  var dots = options.dots;
  var dot = svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', function (d) {
        return x(d[0]);
      }).attr('cy', function (d) {
        return y(d[1]);
      }).attr('r', function (d) {
        var factor = height / 18;
        return factor * (d[2] - rmin) / ((rmax - rmin) || 1) + 4;
      }).style('fill', function (d) {
        var hue = 160 * (1 - d[1] / ymax) + 20;
        var saturation = 0.8 * (d[1] - ymin) / ((ymax - ymin) || 1) + 0.2;
        var lightness = 0.6 - 0.4 * (d[0] - xmin) / ((xmax - xmin) || 1);
        return d3.hsl(hue, saturation, lightness);
      }).sort(function (a, b) {
        // Defines a sort order so that the smallest dots are drawn on top
        return b[2] - a[2];
      }).on('click', function (d) {
        if (typeof dots.onlick === 'function') {
          dots.onlick(d);
        }
      }).on('mouseover', function (d) {
        tooltip.transition().duration(200).style('opacity', 0.8);
        tooltip.html(options.tooltip.html(d))
           .style('left', (d3.event.pageX + 20) + 'px')
           .style('top', (d3.event.pageY - 45) + 'px');
      }).on('mousemove', function (d) {
        var offset = parseInt(tooltip.style('width')) * 0.5
        tooltip.style('left', (d3.event.pageX - offset) + 'px')
           .style('top', (d3.event.pageY - 45) + 'px');
      }).on('mouseout', function (d) {
        tooltip.transition().duration(500).style('opacity', 0);
      });

  var tooltip = chart.append('div')
      .attr('id', (options.tooltip.id || 'tooltip'))
      .style('opacity', 0);
};
