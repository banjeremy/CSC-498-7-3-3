import 'babel-polyfill'
import * as d3 from 'd3'
import './index.css'

import * as d3Annotation from 'd3-svg-annotation'

const margin = 25
const width = 600 // window.innerWidth
const height = 600 // window.innerHeight

let force

const categories = ['confirmed', 'controversial', 'retracted']

const tooltip = d3
  .select('body')
  .append('div')
  .style('position', 'absolute')
  .style('z-index', '10')
  .style('visibility', 'hidden')

const formatter = (x) => x && x.toLocaleString('en-US')

const tooltipContent = (d) => {
  return `
  <div class="tooltip">
    <h1 class="name">${d.id}</h1>
    <ul class="attributes">
      <li class="attribute"><strong>Distance</strong> ${formatter(d.distance_from_sun)} ly</li>
      <li class="attribute"><strong>Radius</strong> ${d.radius} R<sub>Jup</<sub></li>
      <li class="attribute"><strong>Discovery Year</strong> ${d.discovery_year}</li>

      ${
        d.planetary_mass
          ? `<li class="attribute"><strong>Mass</strong> ${d.planetary_mass} M<sub>Jup</sub></li>`
          : ''
      }
    </ul>
  </div>
  `
}

const annotations = {
  scene1: [
    {
      note: {
        label: 'Earth is here',
        bgPadding: 20,
        title: 'Spacial view',
      },
      x: width / 2 + margin,
      y: width / 2 + margin,
      className: 'show-bg',
      dy: 200,
      dx: 300,
    },
  ],
  scene2: [
    {
      note: {
        label: 'Large number of distant planets discovered',
        bgPadding: 20,
        title: '2014',
      },
      x: 480,
      y: 200,
      className: 'show-bg',
      dy: 80,
      dx: -600,
    },
  ],
  scene3: [
    {
      note: {
        label: 'A small number of exoplantets were retracted',
        bgPadding: 20,
        title: 'Not planets',
      },
      x: 565,
      y: 330,
      className: 'show-bg',
      dy: 100,
      dx: 200,
    },
  ],
}

function drawAnnotation(scene) {
  if (!(scene in annotations)) return
  const makeAnnotations = d3Annotation
    .annotation()
    .notePadding(15)
    .type(d3Annotation.annotationLabel)
    .annotations(annotations[scene])

  d3.select('svg')
    .append('g')
    .attr('class', 'annotation-group')
    .call(makeAnnotations)
}

function drawScene1(svg, data) {
  if (!svg || !data) return

  svg
    .append('circle')
    .classed('sun', true)
    .attr('r', 8)
    .attr('cx', width / 2 + margin)
    .attr('cy', height / 2 + margin)
    .attr('fill', 'yellow')

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  // circle size maps to planet size
  const sizeScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.radius)])
    .range([2, 6])

  // angle is right_ascension converted to degrees
  // distance from center maps to distance from the sun
  const distanceScale = d3
    .scaleLog()
    .domain([1, d3.max(data, (d) => d.distance_from_sun)])
    .range([0, width / 2])

  const x = (d) =>
    -Math.cos((d.angle * Math.PI) / 180) * distanceScale(d.distance_from_sun) + width / 2

  const y = (d) =>
    Math.sin((d.angle * Math.PI) / 180) * distanceScale(d.distance_from_sun) + height / 2

  const container = d3.select('g.container')
  const planets = container.selectAll('circle').data(data)

  planets
    .enter()
    .append('circle')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .merge(planets)
    .on('mouseover', () => tooltip.style('visibility', 'visible'))
    .on('mousemove', (d) =>
      tooltip
        .style('top', `${event.pageY - 10}px`)
        .style('left', `${event.pageX + 10}px`)
        .html(tooltipContent(d)),
    )
    .on('mouseout', () => tooltip.style('visibility', 'hidden'))
    .transition()
    .attr('cx', (d) => x(d))
    .attr('cy', (d) => y(d))
    .attr('angle', (d) => d.angle)
    .attr('r', (d) => sizeScale(d.radius))
    .attr('fill', (d) => colorScale(d.category))

  planets.exit().remove()

  drawAnnotation('scene1')
}

function drawScene2(svg, data) {
  if (!svg || !data) return

  let years = []
  for (let i = 2000; i <= 2018; i++) {
    years.push(String(i))
  }

  const xScale = d3
    .scaleBand()
    .domain(years)
    .rangeRound([0, width])
    .padding(0)

  const yScale = d3
    .scaleLog()
    .domain([8, d3.max(data, (d) => d.distance_from_sun)])
    .range([height, 0])

  const xAxis = d3.axisBottom().scale(xScale)
  const yAxis = d3.axisLeft(yScale).ticks(10, '.2s')

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${margin + 10},${margin})`)
    .call(yAxis)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(${margin},${height + margin})`)
    .call(xAxis)

  // svg
  //   .append('text')
  //   .attr('transform', `translate(100,100)`)
  //   .style('text-anchor', 'middle')
  //   .text('Date')

  const container = svg.select('g.container')
  const planets = container.selectAll('circle').data(data)

  planets
    .transition()
    .attr('cx', (d) => xScale(d.discovery_year) + xScale.bandwidth() / 2)
    .attr('cy', (d) => yScale(d.distance_from_sun))

  drawAnnotation('scene2')
}

function drawScene3(svg, data) {
  if (!svg || !data) return

  const container = svg.select('g.container')
  const planets = container.selectAll('circle')

  let nodes = []
  planets.each(function(d) {
    const el = d3.select(this)
    nodes.push({
      ...d,
      category: d.category,
      x: parseFloat(el.attr('cx')),
      y: parseFloat(el.attr('cy')),
    })
  })

  const clusters = {
    confirmed: {
      x: 300,
      y: 300,
    },
    controversial: {
      x: 200,
      y: 300,
    },
    retracted: {
      x: 400,
      y: 300,
    },
  }

  function forceCluster(alpha) {
    for (let i = 0, n = nodes.length, node, cluster, k = alpha * 1; i < n; ++i) {
      node = nodes[i]
      cluster = clusters[node.category]
      node.vx -= (node.x - cluster.x) * k
      node.vy -= (node.y - cluster.y) * k
    }
  }

  force = d3
    .forceSimulation()
    .nodes(nodes)
    .force('cluster', forceCluster)
    .force('gravity', d3.forceManyBody(1))
    .velocityDecay(0.7)
    .on('tick', () =>
      planets
        .data(nodes)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y),
    )

  force.restart()
  drawAnnotation('scene3')
}

function clearScene(svg, data) {
  svg.selectAll('g.axis').remove()
  d3.selectAll('g.annotation-group').remove()
  if (force) force.stop()
  d3.selectAll('circle.sun').remove()
}

function drawScene(svg, data, scene) {
  clearScene(svg)
  switch (scene) {
    case 'scene1':
      return drawScene1(svg, data)
    case 'scene2':
      return drawScene2(svg, data)
    case 'scene3':
      return drawScene3(svg, data)
    default:
      return drawScene1(svg, data)
  }
}

function initLegend(svg) {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  const legend = svg
    .append('g')
    .classed('legend', true)
    .attr('transform', `translate(${width - margin}, ${0})`)

  legend
    .selectAll('rect')
    .data(categories)
    .enter()
    .append('rect')
    .attr('x', 100)
    .attr('y', (d, i) => 92 + i * 25)
    .attr('width', 14)
    .attr('height', 14)
    .attr('rx', '0.4rem')
    .style('fill', (d) => colorScale(d))

  legend
    .selectAll('text')
    .data(categories)
    .enter()
    .append('text')
    .attr('x', 120)
    .attr('y', (d, i) => 100 + i * 25)
    // .style('fill', (d) => colorScale(d))
    .text((d) => d)
    .attr('text-anchor', 'left')
    .style('alignment-baseline', 'middle')
}

function initControls(svg, data) {
  const controls = d3.select('#controls')
  const buttons = controls.selectAll('button').data(['scene1', 'scene2', 'scene3'])

  buttons
    .enter()
    .append('button')
    .merge(buttons)
    .on('click', function handleClick(scene) {
      controls.selectAll('button').classed('active', false)
      d3.select(this).classed('active', true)
      drawScene(svg, data, scene)
    })
    .html((scene) => scene)

  d3.select('button:first-child').classed('active', true)
}

function loadDataset() {
  return d3.csv('data/exoplanets.csv', (row) => {
    const [hours, minutes, seconds] = row.right_ascension.split(' ').map(parseFloat)
    const angle = (hours + minutes / 60 + seconds / 3600 || 0) * 15

    return {
      ...row,
      radius: +row.radius,
      host_star_temperature: +row.host_star_temperature,
      distance_from_sun: +row.distance_from_sun * 3.262, // parsecs -> light years
      category: categories.find((c) => row.lists.toLowerCase().includes(c)),
      angle,
    }
  })
}

async function init() {
  const svg = d3
    .select('svg')
    .attr('width', width + 2 * margin)
    .attr('height', height + 2 * margin)

  const container = svg
    .append('g')
    .classed('container', true)
    .attr('transform', `translate(${margin},${margin})`)

  let data = await loadDataset()
  data = data.filter(
    (d) => d.distance_from_sun > 0 && d.discovery_year && d.discovery_year >= '2000',
  )

  // TODO: for debugging purposes. please remove
  window.data = data
  window.d3 = d3

  initControls(svg, data)
  initLegend(svg, [])
  drawScene(svg, data)
}

init()
