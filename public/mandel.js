'use strict';
window.onload = function() {
    var engine;
    var graph = document.getElementById('MandelCanvas');
    var PixelsBelowGraph = 0;       // we may display coordinates or some such below the graph later

    function RestartEngine(job) {
        var context = graph.getContext('2d');
        if (engine) {
            engine.terminate();
        }
        engine = new Worker('engine.js');
        engine.onmessage = function(e) {
            var msg = e.data;
            switch (msg.kind) {
                case 'dot':
                    context.fillStyle = (msg.n < msg.limit) ? 'rgb(0,0,0)' : 'rgb(100,100,100)';
                    context.fillRect(msg.hor, msg.ver, 1, 1);
                    break;

                case 'debug':
                    console.log(msg.text);
                    break;
            }
        }
        engine.postMessage(job);
        console.log('Started job');
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
