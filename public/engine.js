/* engine.js -- Mandelbrot calculation worker */

function Mandel(cr, ci, limit) {
    var zr=cr, zi=ci, temp;
    var n;
    for (n=0; (n < limit) && (zr*zr + zi*zi <= 4.0); ++n) {
        // z <-- z^2 + c
        // (a+bi)^2 = (a^2 - b^2) + i*(2*a*b)
        temp = (zr*zr - zi*zi) + cr;
        zi = (2*zr*zi) + ci;
        zr = temp;
    }
    return n;
}

onmessage = function(e) {
    /*
        {
            x1: -2.0,
            y1: -2.0,
            x2: +2.0,
            y2: +2.0,
            width: graph.width,
            height: graph.height,
            limit: 100
        }
    */
    var job = e.data;
    postMessage({kind:'debug', text:'Entered onmessage'});

    var x, y, dx, dy, hor, ver;
    dx = (job.x2 - job.x1) / (job.width - 1);
    dy = (job.y2 - job.y1) / (job.height - 1);
    for (hor=0, x=job.x1; hor < job.width; ++hor, x += dx) {
        for (ver=0, y=job.y1; ver < job.height; ++ver, y += dy) {
            postMessage({
                kind: 'dot',
                hor: hor,
                ver: ver,
                limit: job.limit,
                n: Mandel(x, y, job.limit)
            });
        }
    }
}