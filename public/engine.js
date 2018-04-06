/* engine.js -- Mandelbrot calculation worker */

function Mandel(cr, ci, limit) {
    var zr, zi, temp, r;

    if (Math.abs(ci) < 0.649520) {
        if (cr > -0.75) {
            // See if we are in the main cardioid
            zr = cr - 0.25;
            r = Math.sqrt(zr*zr + ci*ci);
            if ((r > 0.0) && (r < 0.5 * (1.0 - zr/r))) {
                return limit;
            }
         } else {
            // See if we are in the circle to the left of the cardioid
            zr = cr + 1.0;
            if (zr*zr + ci*ci < 0.0625) {
                return limit;
            }

            // See if we are in the smaller circler to left of ibid
            zr = cr + 1.309;
            if (zr*zr + ci*ci < 3.475e-3) {
                return limit;
            }
        }
    } else if (ci > 0.649519) {
        // See if we are in one of the "apex" circles
        zr = cr + 0.125;
        zi = ci - 0.743973;
        if (zr*zr + zi*zi < 8e-3) {
            return limit;
        }
    } else if (ci < -0.649519) {
        zr = cr + 0.125;
        zi = ci + 0.743973;
        if (zr*zr + zi*zi < 8e-3) {
            return limit;
        }
    }

    zr = cr;
    zi = ci;
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
    var nprev;
    var count = 0;
    var n, x, y, hor, ver;
    var job = e.data;
    var dx = (job.x2 - job.x1) / (job.width - 1);
    var dy = (job.y2 - job.y1) / (job.height - 1);

    var reply = {
        patch: [],          // [n1, count1, n2, count2, ...]
        top: job.top,
        left: job.left,
        limit: job.limit,
        width: job.width,
        height: job.height
    };

    for (hor=0, x=job.x1; hor < job.width; ++hor, x += dx) {
        for (ver=0, y=job.y1; ver < job.height; ++ver, y += dy) {
            n = Mandel(x, y, job.limit);
            if (count===0 || n===nprev) {
                ++count;
            } else {
                reply.patch.push(nprev);
                reply.patch.push(count);
                count = 1;
            }
            nprev = n;
        }
    }

    if (count > 0) {
        reply.patch.push(nprev);
        reply.patch.push(count);
    }

    postMessage(reply);
}