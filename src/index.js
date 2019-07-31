import 'babel-polyfill'
import * as d3 from 'd3'
import './index.css'

const margin = 25
const width = 600 // window.innerWidth
const height = 600 // window.innerHeight

const tooltip = d3
  .select('body')
  .append('div')
  .style('position', 'absolute')
  .style('z-index', '10')
  .style('visibility', 'hidden')

const tooltipContent = (d) => {
  return `
  <div class="tooltip">
    <h1 class="name">${d.id}</h1>
    <ul class="attributes">
      <li class="attribute"><strong>Distance</strong> ${d.distance_from_sun} pc</li>
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

function drawScene1(svg, data) {
  if (!svg || !data) return

  // color maps to temperature
  const colorScale = d3
    .scaleSequential(d3.interpolateRdYlBu)
    .domain([
      d3.min(data, (d) => d.host_star_temperature),
      d3.max(data, (d) => d.host_star_temperature),
    ])

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

  const planets = svg.selectAll('circle').data(data)

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
    .attr('fill', (d) => colorScale(d.host_star_temperature))

  planets.exit().remove()
}

function drawScene2(svg, data) {
  if (!svg || !data) return

  const years = [
    '2000',
    '2001',
    '2002',
    '2003',
    '2004',
    '2005',
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
  ]

  const xScale = d3
    .scaleBand()
    .domain(years)
    .rangeRound([0, width])
    .padding(0)

  const yScale = d3
    .scaleLog()
    .domain([d3.min(data, (d) => d.distance_from_sun), d3.max(data, (d) => d.distance_from_sun)])
    .range([height, 0])

  const xAxis = d3.axisBottom().scale(xScale)
  const yAxis = d3.axisLeft(yScale)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${margin},${margin})`)
    .call(yAxis)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(${margin},${height + margin})`)
    .call(xAxis)

  svg
    .append('text')
    .attr('transform', `translate(100,100)`)
    .style('text-anchor', 'middle')
    .text('Date')

  const planets = svg.selectAll('circle').data(data)

  planets
    .transition()
    .attr('cx', (d) => xScale(d.discovery_year) + margin + xScale.bandwidth() / 2)
    .attr('cy', (d) => yScale(d.distance_from_sun))
}

function drawScene3(svg, data) {
  if (!svg || !data) return
}

function clearScene(svg, data) {
  svg.selectAll('g.axis').remove()
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
      distance_from_sun: +row.distance_from_sun,
      angle,
    }
  })
}

async function init() {
  const svg = d3
    .select('svg')
    .attr('width', width + 2 * margin)
    .attr('height', height + 2 * margin)

  let data = await loadDataset()
  data = data.filter(
    (d) => d.distance_from_sun > 0 && d.discovery_year && d.discovery_year >= '2000',
  )

  // TODO: for debugging purposes. please remove
  window.data = data
  window.d3 = d3

  initControls(svg, data)
  drawScene(svg, data)
}

init()
