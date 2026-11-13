// Rogue Zombies in the terminal: how the page is laid out on the screen. As
// in the browser: the 96x32 map (the game's DOM renderer, a <div> per
// thing, here read back into cells), the status under it and two lines of
// log, and dialogs framed in brown over it all.
/* BUILD {"files": []} */

var GAME = {
    id: "rogue-zombies",
    idleMs: 200,
    frameMs: 50,
    usage: "rogue-zombies [--seed N] [--version]\n\n" +
        "Rogue Zombies by Ondrej Zara (7DRL 2024), in the terminal. Move with the\n" +
        "arrows or vim keys (hjkl yubn); . or space waits. Digits use\n" +
        "items, i opens the shop, s starts the invasion, ? helps. Ctrl+C or Ctrl+Q\n" +
        "quits. The whole map shows at 100x40; smaller, it follows you.\n" +
        "ROGUE_ZOMBIES_LOG=debug logs every key to the state folder.\n"
};

GAME.C = { fg: "#c0c0c0", dim: "#888888", kbd: "lime", border: "saddlebrown", gold: "goldenrod" };

// ------------------------------------------------------------ HTML to lines

GAME.BLOCK = { P: 1, DIV: 1, SECTION: 1, H2: 1, UL: 1, OL: 1, LI: 1, DL: 1, DT: 1, DD: 1, TABLE: 1, THEAD: 1, TBODY: 1, TR: 1 };

GAME.style = function (n, st) {
    var s = { fg: st.fg, bg: st.bg, bold: st.bold, ul: st.ul, dim: st.dim };
    var t = n.tagName, cl = n.classList;
    if (t == "STRONG" || t == "B" || t == "DT") s.bold = true;
    if (t == "H2") { s.fg = "#ffffff"; s.bold = true; }
    if (t == "A") s.fg = "#ffffff";
    if (t == "EM") s.fg = st.fg;
    if (cl && cl.contains("hp")) s.fg = "red";
    if (cl && cl.contains("money")) s.fg = "gold";
    if (cl && cl.contains("score")) s.fg = "dodgerblue";
    if (cl && cl.contains("disabled")) { s.dim = true; s.fg = GAME.C.dim; s.bold = false; }
    if (n.style && n.style.color) s.fg = n.style.color;
    return s;
};
GAME.visible = function (n) {
    if (n.nodeType != 1) return true;
    if (n.attributes && "hidden" in n.attributes) return false;
    if (n.tagName == "STYLE" || n.tagName == "SCRIPT") return false;
    if (n.tagName == "DIALOG" && !n.open) return false;
    return true;
};

// inline nodes to segments ({t, s}), with the page's ::before and ::after
GAME.segments = function (nodes, st, out, inStatus) {
    nodes.forEach(function (n) {
        if (n.nodeType == 3) { out.push({ t: n.data, s: st }); return; }
        if (n.nodeType != 1 || !GAME.visible(n)) return;
        if (n.tagName == "BR") { out.push({ br: true }); return; }
        var s = GAME.style(n, st), cl = n.classList;
        if (n.tagName == "KBD") {
            out.push({ t: "[", s: { fg: GAME.C.dim } });
            GAME.segments(n.childNodes, { fg: s.dim ? GAME.C.dim : GAME.C.kbd, bold: !s.dim }, out);
            out.push({ t: "]", s: { fg: GAME.C.dim } });
            return;
        }
        if (cl.contains("count") && inStatus) out.push({ t: "×", s: { fg: GAME.C.dim } });
        GAME.segments(n.childNodes, s, out, inStatus);
        if (cl.contains("count") && !inStatus) out.push({ t: "×", s: { fg: GAME.C.dim } });
        if (cl.contains("money")) out.push({ t: "$", s: s });
    });
    return out;
};

GAME.wrap = function (segs, w, pre) {
    var lines = [[]], col = 0;
    var line = function () { return lines[lines.length - 1]; };
    var push = function (t, s) {
        var l = line(), last = l[l.length - 1];
        if (last && last.fg == s.fg && last.bg == s.bg && last.bold == s.bold) last.t += t;
        else l.push({ t: t, fg: s.fg, bg: s.bg, bold: s.bold });
        col += Array.from(t).length;
    };
    var nl = function () { lines.push([]); col = 0; };
    segs.forEach(function (g) {
        if (g.br) { nl(); return; }
        var text = pre ? g.t : g.t.replace(/\s+/g, " ");
        text.split(pre ? /(\n| )/ : /( )/).forEach(function (word) {
            if (!word) return;
            if (word == "\n") { nl(); return; }
            if (word == " ") { if (pre || (col && col < w)) push(" ", g.s); return; }
            var len = Array.from(word).length;
            if (col && col + len > w) {
                var l = line(), r = l[l.length - 1];
                if (r && r.t.endsWith(" ")) r.t = r.t.replace(/ +$/, "");
                nl();
            }
            push(word, g.s);
        });
    });
    if (!pre) lines.forEach(function (l) {
        if (l.length && l[0].t.startsWith(" ")) l[0].t = l[0].t.slice(1);
        var r = l[l.length - 1];
        if (r) r.t = r.t.replace(/ +$/, "");
    });
    while (lines.length && !lines[lines.length - 1].length) lines.pop();
    return lines;
};
GAME.len = function (l) { var n = 0; l.forEach(function (r) { n += Array.from(r.t).length; }); return n; };
GAME.pad = function (n) { return { t: " ".repeat(Math.max(0, n)), fg: null }; };

// blocks one under the other; p, h2, ul, dl and table with a blank line
// after them (margin-bottom: 1.3em)
GAME.render = function (el, w, st) {
    var out = [], inl = [];
    var gap = function () { if (out.length && out[out.length - 1].length) out.push([]); };
    var flush = function () {
        if (!inl.length) return;
        var segs = GAME.segments(inl, st, []);
        inl = [];
        if (!segs.some(function (g) { return g.br || g.t.trim(); })) return;
        GAME.wrap(segs, w, false).forEach(function (l) { out.push(l); });
    };
    el.childNodes.forEach(function (n) {
        if (n.nodeType == 1 && !GAME.visible(n)) return;
        if (n.nodeType != 1 || !GAME.BLOCK[n.tagName]) { inl.push(n); return; }
        flush();
        var s = GAME.style(n, st), t = n.tagName, ls = [];
        if (t == "TABLE") ls = GAME.table(n, w, s);
        else if (t == "H2") {
            var text = GAME.wrap(GAME.segments(n.childNodes, s, []), w - 10, false)[0] || [];
            var l = [{ t: "--== ", fg: GAME.C.gold }].concat(text, [{ t: " ==--", fg: GAME.C.gold }]);
            ls = [[GAME.pad(((w - GAME.len(l)) / 2) | 0)].concat(l)];
        } else if (t == "UL" || t == "OL") {
            n.children.filter(GAME.visible).forEach(function (li) {
                GAME.render(li, w - 4, s).forEach(function (l, j) { ls.push([GAME.pad(j ? 4 : 2), { t: j ? "" : "• ", fg: st.fg }].concat(l)); });
            });
        } else if (t == "DD") ls = GAME.render(n, w - 4, s).map(function (l) { return [GAME.pad(4)].concat(l); });
        else if (n.classList.contains("zombie")) { var z = n.textContent; ls = [[], [GAME.pad(((w - 2) / 2) | 0), { t: z, fg: null }], []]; }
        else ls = GAME.render(n, w, s);
        ls.forEach(function (l) { out.push(l); });
        if (t == "P" || t == "H2" || t == "UL" || t == "TABLE" || t == "DD") gap();
    });
    flush();
    while (out.length && !out[out.length - 1].length) out.pop();
    return out;
};

// th left, td with 2ch to its right, the last column right-aligned; when
// it is too wide, the widest column that may wrap (not the 2nd or 3rd,
// white-space: nowrap) wraps, as the browser does
GAME.table = function (t, w, st) {
    var rows = t.rows.filter(GAME.visible);
    var segs = rows.map(function (r) {
        var rs = GAME.style(r, st);
        return r.children.filter(function (c) { return c.tagName == "TD" || c.tagName == "TH"; }).map(function (c) {
            return GAME.segments(c.childNodes, GAME.style(c, rs), []);
        });
    });
    var widths = [];
    segs.forEach(function (r) { r.forEach(function (c, i) { widths[i] = Math.max(widths[i] || 0, GAME.len(GAME.wrap(c, 1000, false)[0] || [])); }); });
    var total = 0;
    widths.forEach(function (x, i) { total += x + (i < widths.length - 1 ? 2 : 0); });
    if (total > w) {
        var cand = -1;
        widths.forEach(function (x, i) { if (i != 1 && i != 2 && i != widths.length - 1 && (cand < 0 || x > widths[cand])) cand = i; });
        if (cand >= 0) widths[cand] = Math.max(8, widths[cand] - (total - w));
    }
    var out = [];
    segs.forEach(function (r) {
        var cellLines = r.map(function (c, i) { return GAME.wrap(c, widths[i], false); });
        var h = 1;
        cellLines.forEach(function (ls) { h = Math.max(h, ls.length); });
        for (var j = 0; j < h; j++) {
            var line = [];
            cellLines.forEach(function (ls, i) {
                var c = ls[j] || [], last = i == cellLines.length - 1, fill = widths[i] - GAME.len(c);
                if (last) { line.push(GAME.pad(fill)); line = line.concat(c); }
                else { line = line.concat(c); line.push(GAME.pad(fill + 2)); }
            });
            out.push(line);
        }
    });
    return out;
};

GAME.drawLine = function (l, x, y, w, fg) {
    var cx = x;
    l.forEach(function (r) {
        Array.from(r.t).forEach(function (ch) {
            if (cx < x + w) TERM.put(cx, y, ch, r.fg || fg, r.bg || null, false, r.bold);
            cx++;
        });
    });
};

// ------------------------------------------------------------ the screen

// the DOM renderer's cells: each <div> sits at --x, --y with a z-index;
// the topmost in a cell shows its character (the ones under it are drawn
// "transparent" by the game), the topmost background wins
GAME.cells = function (node) {
    var grid = new Map();
    node.childNodes.forEach(function (d) {
        if (d.nodeType != 1) return;
        var x = +d.style.getPropertyValue("--x"), y = +d.style.getPropertyValue("--y"), z = +d.style.zIndex || 0;
        var k = x + "," + y, c = grid.get(k);
        if (!c) { c = { x: x, y: y, ch: " ", fg: null, bg: null, z: -1, bz: -1 }; grid.set(k, c); }
        var fg = d.style.color;
        if (z >= c.z && fg && fg != "transparent") { c.ch = d.textContent || " "; c.fg = fg; c.z = z; }
        if (d.style.backgroundColor && z >= c.bz) { c.bg = d.style.backgroundColor; c.bz = z; }
    });
    return grid;
};
GAME.view = { x: 0, y: 0 };

GAME.layout = function () {
    var W = TERM.w, H = TERM.h, C = GAME.C;
    var main = document.querySelector("main");
    var map = main && DOM.query(main, ".renderer", true);
    var status = document.getElementById("status"), log = document.getElementById("log");
    var MW = 96, MH = 32;
    var mw = Math.min(W, MW);
    var sx = Math.max(0, ((W - MW) / 2) | 0);

    // the status and the log under the map, as wide as the map
    var statusLines = [], logLines = [];
    if (status && status.parentNode == main) statusLines = GAME.statusLines(status, mw);
    if (log && log.parentNode == main) {
        logLines = GAME.wrap(GAME.segments(log.childNodes, { fg: C.fg }, []), mw, false).slice(0, 2);
        while (logLines.length < 2) logLines.push([]);
    }
    var below = statusLines.length + logLines.length;
    if (map) {
        var mh = Math.min(MH, H - below);
        var total = mh + below, y0 = Math.max(0, ((H - total) / 2) | 0);
        var grid = GAME.cells(map), v = GAME.view;
        // follow the player (the @) when the map does not fit
        var me = null;
        grid.forEach(function (c) { if (c.ch == "@") me = c; });
        if (me) {
            v.x = Math.max(0, Math.min(MW - mw, me.x - (mw >> 1)));
            v.y = Math.max(0, Math.min(MH - mh, me.y - (mh >> 1)));
        }
        grid.forEach(function (c) {
            var x = c.x - v.x, y = c.y - v.y;
            if (x < 0 || y < 0 || x >= mw || y >= mh) return;
            TERM.put(sx + x, y0 + y, c.ch, c.fg || "gray", c.bg || null, false, true);
        });
        statusLines.forEach(function (l, j) { GAME.drawLine(l, sx, y0 + mh + j, mw, C.fg); });
        logLines.forEach(function (l, j) { GAME.drawLine(l, sx, y0 + mh + statusLines.length + j, mw, C.fg); });
    }

    // a dialog over it all
    var dlg = DOM.query(document.body, "dialog", false).filter(function (d) { return d.open; }).pop();
    if (dlg) GAME.dialog(dlg);
};

// the item list flows over lines; under it the left and right ends of the
// flex row (health, money, score, rounds; start, items, help)
GAME.statusLines = function (status, w) {
    var lines = [[]], col = 0;
    status.childNodes.forEach(function (n) {
        if (n.nodeType != 1 || !GAME.visible(n) || n.classList.contains("flex")) return;
        var l = GAME.wrap(GAME.segments([n], { fg: GAME.C.fg }, [], true), 1000, true)[0] || [];
        var len = GAME.len(l);
        if (col && col + len > w) { lines.push([]); col = 0; }
        lines[lines.length - 1] = lines[lines.length - 1].concat(l);
        col += len;
    });
    var flex = status.querySelector(".flex");
    if (flex && flex.children.length == 2) {
        var left = GAME.wrap(GAME.segments([flex.children[0]], { fg: GAME.C.fg }, [], true), 1000, true)[0] || [];
        var right = GAME.wrap(GAME.segments([flex.children[1]], { fg: GAME.C.fg }, [], true), 1000, true)[0] || [];
        var gap = w - GAME.len(left) - GAME.len(right);
        if (gap >= 1) lines.push(left.concat([GAME.pad(gap)], right));
        else { lines.push(left); lines.push(right); }
    }
    return lines.filter(function (l, i) { return l.length || i; });
};

GAME.dialog = function (dlg) {
    var W = TERM.w, H = TERM.h, C = GAME.C;
    for (var i = 0; i < TERM.cells.length; i++) { var c = TERM.cells[i]; c.fg = TERM.mix(c.fg, [0, 0, 0], 0.5); c.bg = TERM.mix(c.bg, [0, 0, 0], 0.5); }
    var cw = Math.min(W - 6, Math.max(40, Math.round(W * 0.75)) - 4);
    var ls = GAME.render(dlg, cw, { fg: C.fg });
    var nat = 0;
    ls.forEach(function (l) { nat = Math.max(nat, GAME.len(l)); });
    if (nat < cw) { cw = Math.max(nat, 30); ls = GAME.render(dlg, cw, { fg: C.fg }); }
    var bw = cw + 4, bh = Math.min(H, ls.length + 4), bx = ((W - bw) / 2) | 0, by = Math.max(0, ((H - bh) / 2) | 0);
    TERM.fillRect(bx, by, bw, bh, "#000");
    for (var x = bx + 1; x < bx + bw - 1; x++) { TERM.put(x, by, "─", C.border, null); TERM.put(x, by + bh - 1, "─", C.border, null); }
    for (var y = by + 1; y < by + bh - 1; y++) { TERM.put(bx, y, "│", C.border, null); TERM.put(bx + bw - 1, y, "│", C.border, null); }
    TERM.put(bx, by, "┌", C.border, null); TERM.put(bx + bw - 1, by, "┐", C.border, null);
    TERM.put(bx, by + bh - 1, "└", C.border, null); TERM.put(bx + bw - 1, by + bh - 1, "┘", C.border, null);
    // too tall: the end of it stays in view, where the keys to go on are
    if (ls.length > bh - 4) ls = ls.slice(ls.length - (bh - 4));
    ls.forEach(function (l, j) { GAME.drawLine(l, bx + 2, by + 2 + j, cw, C.fg); });
};

GAME.snapshot = function () {
    var main = document.querySelector("main"), map = main && DOM.query(main, ".renderer", true);
    var dlg = DOM.query(document.body, "dialog", false).filter(function (d) { return d.open; }).pop();
    return "map=" + (map ? map.childNodes.length : "-") + " view=" + GAME.view.x + "," + GAME.view.y +
        " dialog=" + (dlg ? JSON.stringify((dlg.querySelector("h2") || {}).textContent) : "-");
};

// --seed N: the game's Math.random seeded, so the same map and zombies come
// each time (for the preview)
GAME.seed = null;
GAME.arg = function (a, b) {
    if (a == "--seed" && b) { GAME.seed = parseInt(b, 10) >>> 0; return true; }
    return false;
};
GAME.before = function () {
    if (GAME.seed === null) return;
    var s = GAME.seed || 1;
    Math.random = function () {   // mulberry32
        s = (s + 0x6D2B79F5) >>> 0;
        var t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
