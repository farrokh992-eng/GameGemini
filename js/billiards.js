window.BilliardsGame = (() => {
    "use strict";

    const W = 900;
    const H = 600;
    const TAU = Math.PI * 2;

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    function start(canvas, ui) {
        const ctx = canvas.getContext("2d");

        canvas.width = W;
        canvas.height = H;

        let animation = 0;
        let stopped = false;

        const table = {
            x: 65,
            y: 52,
            w: 770,
            h: 495
        };

        const pockets = [
            [table.x, table.y],
            [W / 2, table.y],
            [table.x + table.w, table.y],
            [table.x, table.y + table.h],
            [W / 2, table.y + table.h],
            [table.x + table.w, table.y + table.h]
        ];

        const colors = [
            "#f6d64a",
            "#2578d5",
            "#ed4a4f",
            "#7b55bc",
            "#f28a28",
            "#3cbf78",
            "#e45aa7",
            "#202027",
            "#f6d64a",
            "#2578d5",
            "#ed4a4f",
            "#7b55bc",
            "#f28a28",
            "#3cbf78",
            "#e45aa7"
        ];

        let balls = [];
        let power = 0.75;
        let aim = { x: 500, y: 300 };
        let dragging = false;
        let moving = false;
        let score = 0;

        const controls = document.getElementById("gameControls");

        controls.innerHTML = `
            <label>
                قدرت ضربه
                <input id="poolPower" type="range" min="15" max="100" value="75">
            </label>

            <label>
                حریف
                <select id="poolDifficulty">
                    <option value="0.7">آسان</option>
                    <option value="1" selected>معمولی</option>
                    <option value="1.4">سخت</option>
                </select>
            </label>
        `;

        document.getElementById("poolPower")
            .addEventListener("input", event => {
                power = Number(event.target.value) / 100;
            });

        let difficulty = 1;

        document.getElementById("poolDifficulty")
            .addEventListener("change", event => {
                difficulty = Number(event.target.value);
            });

        function reset() {
            balls = [];

            balls.push({
                x: 250,
                y: 300,
                vx: 0,
                vy: 0,
                r: 13,
                color: "#fffdf2",
                cue: true,
                pocketed: false
            });

            let index = 0;

            for (let row = 0; row < 5; row++) {
                for (let col = 0; col <= row; col++) {
                    balls.push({
                        x: 580 + row * 24,
                        y: 300 + (col - row / 2) * 27,
                        vx: 0,
                        vy: 0,
                        r: 13,
                        color: colors[index % colors.length],
                        number: index + 1,
                        pocketed: false
                    });

                    index++;
                }
            }

            aim = { x: 500, y: 300 };
            moving = false;
            score = 0;

            ui.score(0);
        }

        function drawBall(ball) {
            const gradient = ctx.createRadialGradient(
                ball.x - ball.r * 0.35,
                ball.y - ball.r * 0.4,
                1,
                ball.x,
                ball.y,
                ball.r
            );

            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(0.2, ball.color);
            gradient.addColorStop(1, "#10151b");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, TAU);
            ctx.fill();

            ctx.strokeStyle = "#ffffff55";
            ctx.lineWidth = 1;
            ctx.stroke();

            if (ball.number) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, 5.5, 0, TAU);
                ctx.fillStyle = "#fff";
                ctx.fill();

                ctx.fillStyle = "#222";
                ctx.font = "bold 7px system-ui";
                ctx.textAlign = "center";
                ctx.fillText(
                    String(ball.number),
                    ball.x,
                    ball.y + 2.5
                );
            }
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            ctx.fillStyle = "#181b22";
            ctx.fillRect(0, 0, W, H);

            roundedRect(
                30, 20, 840, 560, 30,
                "#4c2d1c", "#bd8a4b", 4
            );

            roundedRect(
                48, 38, 804, 524, 24,
                "#142f28", "#93633b", 3
            );

            roundedRect(
                68, 58, 764, 484, 8,
                "#167a56", "#5fb48b", 4
            );

            pockets.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, 23, 0, TAU);

                ctx.fillStyle = "#050709";
                ctx.fill();

                ctx.strokeStyle = "#bc9053";
                ctx.lineWidth = 5;
                ctx.stroke();
            });

            balls.forEach(ball => {
                if (!ball.pocketed) drawBall(ball);
            });

            const cue = balls[0];

            if (!moving && cue && !cue.pocketed) {
                const dx = cue.x - aim.x;
                const dy = cue.y - aim.y;
                const length = Math.hypot(dx, dy) || 1;

                const ux = dx / length;
                const uy = dy / length;

                ctx.save();

                ctx.setLineDash([7, 7]);
                ctx.strokeStyle = "#ffffffa0";
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(cue.x, cue.y);
                ctx.lineTo(
                    cue.x + ux * 125,
                    cue.y + uy * 125
                );
                ctx.stroke();

                ctx.setLineDash([]);

                ctx.strokeStyle = "#d9ad73";
                ctx.lineWidth = 8;

                ctx.beginPath();
                ctx.moveTo(
                    cue.x + ux * 25,
                    cue.y + uy * 25
                );
                ctx.lineTo(
                    cue.x + ux * (70 + power * 120),
                    cue.y + uy * (70 + power * 120)
                );
                ctx.stroke();

                ctx.restore();
            }

            ctx.fillStyle = "#f3d5a0";
            ctx.font = "bold 14px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("8-BALL POOL", 450, 590);
        }

        function roundedRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);

            ctx.fillStyle = fill;
            ctx.fill();

            if (stroke) {
                ctx.strokeStyle = stroke;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }
        }

        function simulate() {
            let active = false;

            for (const ball of balls) {
                if (ball.pocketed) continue;

                ball.x += ball.vx;
                ball.y += ball.vy;

                ball.vx *= 0.991;
                ball.vy *= 0.991;

                if (Math.abs(ball.vx) + Math.abs(ball.vy) > 0.15) {
                    active = true;
                } else {
                    ball.vx = 0;
                    ball.vy = 0;
                }

                if (
                    ball.x < table.x + 12 + ball.r ||
                    ball.x > table.x + table.w - 12 - ball.r
                ) {
                    ball.vx *= -0.94;
                }

                if (
                    ball.y < table.y + 12 + ball.r ||
                    ball.y > table.y + table.h - 12 - ball.r
                ) {
                    ball.vy *= -0.94;
                }

                for (const [px, py] of pockets) {
                    if (Math.hypot(ball.x - px, ball.y - py) < 23) {
                        if (ball.cue) {
                            ball.x = 250;
                            ball.y = 300;
                            ball.vx = 0;
                            ball.vy = 0;

                            ui.message("توپ سفید برگشت؛ دوباره تلاش کن");
                        } else {
                            ball.pocketed = true;
                            score += 10;
                            ui.score(score);
                            ui.record(score);
                        }
                    }
                }
            }

            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const a = balls[i];
                    const b = balls[j];

                    if (a.pocketed || b.pocketed) continue;

                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const distance = Math.hypot(dx, dy) || 0.01;
                    const minDistance = a.r + b.r;

                    if (distance < minDistance) {
                        const nx = dx / distance;
                        const ny = dy / distance;
                        const overlap = minDistance - distance;

                        a.x -= nx * overlap / 2;
                        a.y -= ny * overlap / 2;

                        b.x += nx * overlap / 2;
                        b.y += ny * overlap / 2;

                        const relative =
                            (a.vx - b.vx) * nx +
                            (a.vy - b.vy) * ny;

                        if (relative > 0) {
                            a.vx -= relative * nx * 0.96;
                            a.vy -= relative * ny * 0.96;

                            b.vx += relative * nx * 0.96;
                            b.vy += relative * ny * 0.96;
                        }
                    }
                }
            }

            moving = active;
        }

        function loop() {
            if (stopped) return;

            simulate();
            draw();

            animation = requestAnimationFrame(loop);
        }

        function getPointer(event) {
            const rect = canvas.getBoundingClientRect();

            return {
                x: (event.clientX - rect.left) / rect.width * W,
                y: (event.clientY - rect.top) / rect.height * H
            };
        }

        canvas.onpointerdown = event => {
            if (moving) return;

            dragging = true;
            aim = getPointer(event);

            canvas.setPointerCapture(event.pointerId);
        };

        canvas.onpointermove = event => {
            if (!dragging) return;

            aim = getPointer(event);
        };

        canvas.onpointerup = () => {
            if (!dragging) return;

            dragging = false;

            if (moving) return;

            const cue = balls[0];

            const dx = cue.x - aim.x;
            const dy = cue.y - aim.y;
            const length = Math.hypot(dx, dy) || 1;

            cue.vx = dx / length * power * 12;
            cue.vy = dy / length * power * 12;

            ui.message("ضربه زده شد!");
        };

        canvas.onpointercancel = () => {
            dragging = false;
        };

        reset();
        loop();

        return {
            stop() {
                stopped = true;
                cancelAnimationFrame(animation);

                canvas.onpointerdown = null;
                canvas.onpointermove = null;
                canvas.onpointerup = null;
                canvas.onpointercancel = null;
            }
        };
    }

    return { start };
})();
