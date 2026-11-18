// Plotly with only the traces this app draws (full bundle is ~4.7 MB, this is a fraction).
// Add a trace here when a component starts using a new `type:`.
import Plotly from "plotly.js/lib/core"
import scatter from "plotly.js/lib/scatter"
import heatmap from "plotly.js/lib/heatmap"
import scatter3d from "plotly.js/lib/scatter3d"
import surface from "plotly.js/lib/surface"
import mesh3d from "plotly.js/lib/mesh3d"

Plotly.register([scatter, heatmap, scatter3d, surface, mesh3d])

export default Plotly
