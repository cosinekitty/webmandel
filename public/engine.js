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
    var n, x, y, hor, ver;
    var job = e.data;
    var dx = (job.x2 - job.x1) / (job.width - 1);
    var dy = (job.y2 - job.y1) / (job.height - 1);
    var reply = null;
    for (hor=0, x=job.x1; hor < job.width; ++hor, x += dx) {
        for (ver=0, y=job.y1; ver < job.height; ++ver, y += dy) {
            n = Mandel(x, y, job.limit);
            if (reply) {
                if (n === reply.n) {
                    ++reply.count;
                } else {
                    postMessage(reply);
                    reply = null;
                }
            }

            if (!reply) {
                reply = {
                    kind: 'run',
                    n: n,
                    count: 1,
                    hor: hor,
                    ver: ver,
                    limit: job.limit,
                    width: job.width,
                    height: job.height
                };
            }
        }
    }

    if (reply) {
        postMessage(reply);
    }
}