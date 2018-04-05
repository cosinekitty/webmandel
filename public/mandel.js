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
            context.fillRect(hor, ver, 1, msg.height - ver);
            ver = 0;
        }
    }

    function RestartEngine(job) {
        var context = graph.getContext('2d');
        if (engine) {
            engine.terminate();
        }
        engine = new Worker('engine.js');
        engine.onmessage = function(e) {
            var msg = e.data;
            switch (msg.kind) {
                case 'run':
                    DrawRun(context, msg);
                    break;

                case 'debug':
                    console.log(msg.text);
                    break;
            }
        }
        engine.postMessage(job);
    }

    function UpdateDisplay() {
        // Put graphics updates here
        RestartEngine({
            x1: -2.0,
            y1: -2.0,
            x2: +2.0,
            y2: +2.0,
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
