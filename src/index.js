import 'babel-polyfill'
import * as d3 from 'd3'
import './index.css'

const margin = 25
const width = 600 // window.innerWidth
const height = 600 // window.innerHeight

function draw(svg, data) {
  if (!data) return

  // TODO: for debugging purposes. please remove
  window.data = data
  window.d3 = d3

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
    .range([1, 5])

  // angle is right_ascension converted to degrees
  // distance from center maps to distance from the sun
  const distanceScale = d3
    .scaleLog()
    .domain([1, d3.max(data, (d) => d.distance_from_sun)])
    .range([0, width / 2])

  const x = (d) =>
    Math.cos((d.angle * Math.PI) / 180) * distanceScale(d.distance_from_sun) + width / 2

  const y = (d) =>
    Math.sin((d.angle * Math.PI) / 180) * distanceScale(d.distance_from_sun) + height / 2

  const planets = svg
    .append('g')
    .attr('transform', `translate(${margin}, ${margin})`)
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .transition()
    .attr('cx', (d) => x(d))
    .attr('cy', (d) => y(d))
    .attr('angle', (d) => d.angle)
    .attr('r', (d) => sizeScale(d.radius))
    .attr('fill', (d) => colorScale(d.host_star_temperature))
}

function initControls(svg, data) {
  const buttons = d3
    .select('#controls')
    .selectAll('button')
    .data(['scene1', 'scene2', 'scene3'])

  const jostle = () => {}

  buttons
    .enter()
    .append('button')
    .on('click', (d) => jostle())
    .html((d) => d)
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
  data = data.filter((d) => d.distance_from_sun > 0)

  initControls(svg, data)
  draw(svg, data)
}

init()
