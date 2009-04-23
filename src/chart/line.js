

Chart.Line = Class.create(Chart.Base, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);    
    this.R = Raphael(canvas, this.options.width, this.options.height);
  },
  
  draw: function() {
    if (!this._dataset) {
      throw new Krang.Error("No dataset!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter;
    
    var max = this._dataset.maxValue();
    
    // Horizontal space between each node.
    var xScale = (opt.width - (g.left + g.right)) / (this._dataset.dataLength() - 1);
    // Vertical scale 
    var yScale = (opt.height - (g.bottom + g.top)) / max;
        
    // Create the background grid.
    R.drawGrid(
      g.left,                           /* X                 */
      g.top,                            /* Y                 */
      opt.width  - (g.left + g.right),  /* width             */
      opt.height - (g.top + g.bottom),  /* height            */
      0,                                /* number of columns */
      10,                               /* number of rows    */
      opt.grid.color                    /* color             */
    );
    
    R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({ stroke: opt.border.color });
    
    
    
    var blanket = R.set();
    
    function plotDataset(dataset) {
      console.log(dataset);
      var data = dataset.toArray();
      
      // Create the path objects for the line and the fill.
      console.log(Colorset.interpret(opt.line.color));
      
      var line = R.path({
        'stroke':          Colorset.interpret(opt.line.color),
        'stroke-width':    opt.line.width,
        'stroke-linejoin': 'round'
      });
      
      var fill = R.path({
        fill:    Colorset.interpret(opt.fill.color),
        opacity: opt.fill.opacity,
        stroke:  'none'
      });

      fill.moveTo(g.left, opt.height - g.bottom);
      
      var label, value, x = 0, y, dot, rect;
      
      // Plot the values.
      for (var i = 0, l = data.length; i < l; i++) {
        label = data[i].label, value = data[i].value;


        y = Math.round(opt.height - g.bottom - (yScale * value));
        x = Math.round(g.left + (xScale * i));


        console.log("plotting", value, "at", [x, y]);

        // Draw the line segment.
        if (i == 0) {
          line.moveTo(x, y, 10);
          fill.lineTo(x, y, 10);
        } else {
          line.cplineTo(x, y, opt.line.curve);
          fill.cplineTo(x, y, opt.line.curve);
        }

        // Draw the dot.
        dot = R.circle(x, y, opt.dot.radius).attr({ 
          fill:   opt.dot.color,
          stroke: opt.dot.stroke
        });

        // Create an invisible rectangle that will receive hover events.
        rect = R.rect(
          g.left + (xScale * i),
          0,
          xScale,
          opt.height - g.bottom
        ).attr({
          stroke: 'none',
          fill: '#fff',
          opacity: 0
        });

        blanket.push(rect);      
      }

      // Since the fill path is drawing a shape, not just a line, we need to
      // close the path.
      fill.lineTo(x, opt.height - g.bottom).andClose();
      
    }
    
    if (this._dataset instanceof Dataset.Multiple) {
      this._dataset.each(plotDataset, this);
    } else {
      plotDataset(this._dataset, this);
    }    
    
    blanket.toFront();
  }
});


Object.extend(Chart.Line, {
  DEFAULT_OPTIONS: {
    width:  800,
    height: 250,
    line: {
      color: Colorset.BLUES,
      width: 4,
      curve: 10
    },
    
    fill: {
      color: '#039',
      opacity: 0.3
    },
    
    gutter: {
      top:    20,
      bottom: 20,
      left:   30,
      right:  30
    },
    
    dot: {
      color: '#039',
      stroke: '#fff',
      radius: 4
    },
    
    grid: {
      color: '#ddd'
    },
    
    border: {
      color: '#999'
    }
  }
});