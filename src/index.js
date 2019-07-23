import * as d3 from 'd3'
import './index.css'

const width = 300
const height = 300
const margin = 25

const svg = d3
  .select('svg')
  .attr('width', width + 2 * margin)
  .attr('height', height + 2 * margin)

svg
  .append('g')
  .attr('transform', `translate(${(margin, margin)})`)
  .selectAll('circle')
  .data([10, 20, 30, 40, 50, 100, 150, 200, 300])
  .enter()
  .append('circle')
  .attr('cx', (d) => d)
  .attr('cy', (d) => height + margin - d)
  .attr('r', 2)
