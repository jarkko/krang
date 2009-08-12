
/**
 *  class Chart.Bar < Chart.Area
 *  
 *  A class for drawing bar charts.
**/
Chart.Bar = Class.create(Chart.Area, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);
    this.canvas = canvas;
    this.R = Raphael(this.canvas, this.options.width, this.options.height);
  },

  /**
   *  Chart.Bar#draw() -> undefined
   *  
   *  Draws the chart.
  **/
  draw: function() {
    this.clear();
    
    if (this._datasets.length === 0) {
      throw new Krang.Error("No datasets!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter;
    
    // If `maxY` is `auto`, look at the dataset(s) to determine a 
    // reasonable maximum for the chart.
    var max;    
    if (opt.grid.maxY === 'auto') {
      if (opt.stack) {
        // Max value is additive, since the bars stack.
        max = Math.sum.apply(Math, this._datasets.invoke('maxValue'));
      } else {
        // Max value is singular, since the bars are arranged in a row.
        max = Math.max.apply(Math, this._datasets.invoke('maxValue'));
      }
    } else {
      // If the user hard-codes a maximum.
      max = opt.grid.maxY;
    }
    
    var numDataPoints = this._datasets.first().dataLength();
    
    // Width of each set of bars (all the bars that represent one label
    // on the X axis).
    var xScale = (opt.width - (g.left + g.right)) / 
     (numDataPoints);
     
    // Vertical scale of chart.
    var yRange = opt.height - (g.top + g.bottom);    
    var yScale = yRange / max;
    
    var og = opt.grid;
    
    this._drawGrid();    
    var grid = this._getGridSpec();
        
    // So now we know how to get a Y coordinate from a raw dataset value. 
    var $valueToY = function(value) {
      return value * (grid.height / max);
    };
    
    // And how to get the dataset value of an arbitrary Y coordinate.
    var $yToValue = function(y) {
      return y / (grid.height / max);
    };
    
    // Keep track of cumulative totals for each X step. We'll need that
    // for a stacked bar chart.
    var $barTotals = [];
    
    var $color = opt.bar.color;
    if (opt.bar.color instanceof Krang.Colorset) {
      opt.bar.color.setLength(this._datasets.length);
    }
    
    // Responsible for plotting an individual dataset.
    var plotDataset = function(dataset, index) {
      var data  = dataset.toArray();
      var color = $color.toString();
      
      var datum, barBox;
      for (var i = 0, l = data.length; i < l; i++) {
        datum = data[i];
                
        // Figure out where this bar will exist on screen.
        barBox = {
          height: $valueToY(datum.value),
          width:  opt.stack ? 
           (grid.xStepPixels - opt.bar.gutter) : 
           ((grid.xStepPixels - opt.bar.gutter) / this._datasets.length)
        };
                
        barBox.x = Math.round((opt.bar.gutter / 2) +
         (grid.xStepPixels * i));
         
        if (!opt.stack) barBox.x += (barBox.width * index);
        
        // Because the bars may stack in the case of multiple datasets, we
        // have to keep track of the total height of each bar.
        $barTotals[i] = $barTotals[i] || 0;
        barBox.y = opt.stack ? $barTotals[i] : 0;
        $barTotals[i] += barBox.height;
        
        var attrs = {
          fill:    color,
          opacity: opt.bar.opacity,
          stroke: 'none'
        };
        
        // Handle a border, if there is one.
        if (opt.bar.border.width > 0) {
          var borderColor = opt.bar.border.color;
          
          // Border color can be dynamically calculated to correspond
          // with the colors generated by a colorset.
          borderColor = (borderColor === 'auto') ?
            Krang.Color.fromString(color).darkerBy(0.05).toHexString() :
            Krang.Colorset.interpret(borderColor);
            
          Object.extend(attrs, {
            'stroke':       borderColor,
            'stroke-width': opt.bar.border.width
          });
        }
        
        var colorObj = Krang.Color.fromString(color);        
        var gradient = Object.clone(opt.bar.gradient);
        gradient.dots = opt.bar.gradient.dots(colorObj);
                
        // Convert chart coordinates to drawing coordinates.
        var barDrawBox = this._chartingBoxToDrawingBox(barBox);
        
        // Draw the bar.
        R.rect(
          barDrawBox.x, barDrawBox.y, barDrawBox.width, barDrawBox.height
        ).attr(attrs).attr({ gradient: gradient });

        var obl = opt.bar.label;
        
        // Figure out how tall the box will be based on the font size.
        var barLabelBoxHeight = window.parseInt(obl.font.size, 10);        
        var barLabelPadding = 1; // FIXME

        if (obl.enabled) {
          var positions = {
            above:  (barDrawBox.y) - barLabelBoxHeight - barLabelPadding,
            below:  (barDrawBox.y + barDrawBox.height) +
             barLabelBoxHeight + barLabelPadding,
            top:    (barDrawBox.y) + barLabelBoxHeight + barLabelPadding,
            bottom: (barDrawBox.y + barDrawBox.height) +
             barLabelBoxHeight + barLabelPadding
          };
          
          // To get the dimensions of the box in which the bar value text
          // will be positioned, we clone the dimensions of the bar's box
          // and change values as necessary.
          var barLabelBox = Object.clone(barDrawBox);
          barLabelBox.y = positions[obl.position] || positions.above;
          barLabelBox.y -= barLabelPadding;
          barLabelBox.height = 'auto';

          new Krang.Text(obl.filter(datum.value), {
            box: barLabelBox,         
            align: 'center',
            font: {
              family: obl.font.family,
              size:   obl.font.size,
              color:  obl.color
            }
          }).draw(R);
        }
        
        // Only draw X-axis labels for the first set.
        if (index === 0) {
          xAxisLabelBox        = Object.clone(barDrawBox);
          xAxisLabelBox.y      = g.top + grid.height + 5;
          xAxisLabelBox.height = 'auto';
          xAxisLabelBox.width  = grid.xStepPixels - opt.bar.gutter;
          
          // Run the label through the filter.
          var label = opt.grid.labelX(datum.label);    
          
          new Krang.Text(label, {
            box: xAxisLabelBox,            
            align: 'center',            
            font: {
              family: opt.text.font.family,
              size:   opt.text.font.size,
              color:  opt.text.color
            }            
          }).draw(R);
        }
      }
    }; // function plotDataset(dataset, index)
    
    this._drawYAxisLabels(max);
    
    this._datasets.each(plotDataset, this);    
    this._frame.toFront();
  } // #draw
}); // Chart.Bar


Object.extend(Chart.Bar, {  
  DEFAULT_OPTIONS: {
    width:  800,
    height: 300,
    bar: {
      /*  
       *  Color of the bar. Can be a string or a `Colorset`; if the latter,
       *  a new color will be retrieved from the set for each dataset in the
       *  chart.
       */ 
      color: new Krang.Colorset({
        vary: 'l',
        hue: 0.25,
        saturation: 0.6
      }),

      /*
       *  Border of the bar. If `color` is set to `auto`, the border will be a
       *  slightly-darker shade of the bar's fill color.
       */ 
      border: {
        width: 0,
        color: 'auto'
      },
      
      /*
       *  How much space to leave on either side of a bar (or bar group).
       */ 
      gutter: 5,
      opacity: 1.0,
      
      /*
       *  If enabled, will place a text label on a bar that shows the bar's
       *  value. The `position` can be one of `above`, `below`, `top`, or 
       *  `bottom`. The `filter` callback can alter the value for display.
       */       
      label: {
        enabled:    false,
        position:   'above',
        font: {
          family: 'Lucida Grande',
          size:   '12px'
        },
        color:      "#000",
        filter:     Prototype.K
      },
      
      /*
       *  A gradient to apply to the bar.
       */       
      gradient: {
        type: 'linear',
        dots: function(colorObj) {
          return [
            { color: colorObj.lighterBy(0.05).toHexString() },
            { color: colorObj.darkerBy(0.05).toHexString()  }
          ];
        },
        vector: [0, 0, '100%', 0]
      }
    },
    
    /* 
     *  How much space to leave around the chart itself. There are non-zero
     *  defaults here to leave room for axis labels.
     */ 
    gutter: {
      top:    20,
      bottom: 30,
      left:   100,
      right:  30
    },
    
    /* The chart's grid. */
    grid: {               
      color: '#eee',      /* Color of the gridlines. */
      
      horizontal: {
        enabled: true,    /* Whether to draw horizontal gridlines. */
        lines: 10
      },
      
      vertical: {
        enabled: false,   /* Whether to draw vertical gridlines. */
        lines: 0
      },
      
      /* Callbacks that format the labels for display. */
      labelX: Prototype.K,  
      labelY: function(value) {
        return value.toFixed(1);
      }, 
      
      /* 
       * If set to 'auto', will determine a good max value based on the 
       * scale of the chart. Otherwise one can specify a max value to use.
       */ 
      maxY: 'auto'
    },
    
    /* Border around the chart itself. */    
    border: {           
      color: '#bbb',
      width: 1
    },
    
    text: {
      font: {
        family: 'Lucida Grande',
        size:   '12px'
      },
      color:      "#000"
    },
    
    stack: false
  }
});