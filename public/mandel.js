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

    function UpdateDisplay() {
        if (engine) {
            engine.terminate();
        }
        engine = new Worker('engine.js');
        engine.onmessage = function(e) {
            DrawRun(context, e.data);
        }

        var context = graph.getContext('2d');

        SendJob(context, engine, {
            x1: -2.0,
            y1: -1.2,
            x2: +0.5,
            y2: +1.2,
            left: 0,
            top: 0,
            width: graph.width,
            height: graph.height,
            limit: 100
        });
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
