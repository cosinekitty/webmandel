'use strict';
window.onload = function() {
    var engine;
    var graph = document.getElementById('MandelCanvas');
    var PixelsBelowGraph = 0;       // we may display coordinates or some such below the graph later

    function Color(n, limit) {
        return (n >= limit) ? 'rgb(0,0,0)' : 'rgb(200,200,200)';
    }

    function DrawRun(context, msg) {
        context.fillStyle = Color(msg.n, msg.limit);

        var ver = msg.ver;
        for (var hor=msg.hor; hor < msg.width; ++hor) {
            context.fillRect(hor + msg.left, ver + msg.top, 1, msg.height - ver);
            ver = 0;
        }
    }

    function SendJob(context, engine, job) {
        // If the job is large enough, split into quadrants recursively.
        var MinSize = 50;
        if (job.width >= MinSize && job.height >= MinSize) {
            var leftWidth = Math.floor(job.width / 2);
            var rightWidth = job.width - leftWidth;
            var topHeight = Math.floor(job.height / 2);
            var bottomHeight = job.height - topHeight;

            // Upper left
            SendJob(context, engine, {
                x1: job.x1,
                y1: job.y1,
                x2: job.x1 + (job.x2 - job.x1)*((leftWidth-1) / (job.width-1)),
                y2: job.y1 + (job.y2 - job.y1)*((topHeight-1) / (job.height-1)),
                left: job.left,
                top: job.top,
                width: leftWidth,
                height: topHeight,
                limit: job.limit
            });

            // Upper right
            SendJob(context, engine, {
                x1: job.x1 + (job.x2 - job.x1)*(leftWidth / (job.width-1)),
                y1: job.y1,
                x2: job.x2,
                y2: job.y1 + (job.y2 - job.y1)*((topHeight-1) / (job.height-1)),
                left: job.left + leftWidth,
                top: job.top,
                width: rightWidth,
                height: topHeight,
                limit: job.limit
            });

            // Lower left
            SendJob(context, engine, {
                x1: job.x1,
                y1: job.y1 + (job.y2 - job.y1)*(topHeight / (job.height-1)),
                x2: job.x1 + (job.x2 - job.x1)*((leftWidth-1) / (job.width-1)),
                y2: job.y2,
                left: job.left,
                top: job.top + topHeight,
                width: leftWidth,
                height: bottomHeight,
                limit: job.limit
            });

            // Lower right
            SendJob(context, engine, {
                x1: job.x1 + (job.x2 - job.x1)*(leftWidth / (job.width-1)),
                y1: job.y1 + (job.y2 - job.y1)*(topHeight / (job.height-1)),
                x2: job.x2,
                y2: job.y2,
                left: job.left + leftWidth,
                top: job.top + topHeight,
                width: rightWidth,
                height: bottomHeight,
                limit: job.limit
            });
        } else {
            engine.postMessage(job);
        }
    }

    function FixAspect(job) {
        // Adjust the math coordinates outward as needed
        // so that the screen aspect ratio matches the math aspect ratio.
        // In other words, a horizontal pixel has the same math value
        // as a vertical pixel, so the fractal looks correct, not stretched.

        var screenAspect = (job.height-1) / (job.width-1);
        var mathAspect = (job.y2 - job.y1) / (job.x2 - job.x1);
        if (screenAspect > mathAspect) {
            // Expand math coordinates vertically to fit the tall screen.
            // We want screenAspect = mathAspect,
            // screenAspect = (job.y2 - job.y1) / (job.x2 - job.x1)
            // (job.y2 - job.y1) = screenAspect * (job.x2 - job.x1)
            // Pick the midpoint and add/subtract half the required distance from there.
            var ymid = (job.y1 + job.y2) / 2;
            var dy = screenAspect * (job.x2 - job.x1) / 2;
            job.y1 = ymid - dy;
            job.y2 = ymid + dy;
        } else if (mathAspect > screenAspect) {
            // Expand math coordinates horizontally to fit the wide screen.
            var xmid = (job.x1 + job.x2) / 2;
            var dx = (job.y2 - job.y1) / (2 * screenAspect);
            job.x1 = xmid - dx;
            job.x2 = xmid + dx;
        }

        return job;
    }

    function UpdateDisplay() {
        if (engine) {
            engine.terminate();
        }
        engine = new Worker('engine.js');
        engine.onmessage = function(e) {
            DrawRun(context, e.data);
        }

        var context = graph.getContext('2d');

        var job = {
            x1: -2.0,
            y1: -1.2,
            x2: +0.5,
            y2: +1.2,
            left: 0,
            top: 0,
            width: graph.width,
            height: graph.height,
            limit: 100
        };

        SendJob(context, engine, FixAspect(job));
    }

    function ResizeGraph() {
        // Calculate "ideal" graph dimensions as a function of the window dimensions.
        var gwidth = window.innerWidth;
        var gheight = window.innerHeight - PixelsBelowGraph;

        // Resize the graph canvas if needed.
        if (graph.width !== gwidth || graph.height !== gheight) {
            graph.width = gwidth;
            graph.height = gheight;
            UpdateDisplay();
        }
    }

    function Init() {
        ResizeGraph();
        window.addEventListener('resize', ResizeGraph);
    }

    Init();
};
