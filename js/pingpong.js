window.PingPongGame = (() => {
    "use strict";

    const W = 900;
    const H = 600;

    const clamp = (n, min, max) =>
        Math.max(min, Math.min(max, n));

    function start(canvas, ui) {
        const ctx = canvas.getContext("2d");

        canvas.width = W;
        canvas.height = H;

        let animation = 0;
        let stopped = false;
        let rally = 0;
        let difficulty = 1;

        const player = { x: 450, y: 515 };
        const ai = { x: 450, y: 90 };

        const ball = {
            x: 450,
            y: 300,
            vx: 4,
            vy: 5,
            r: 11
        };

        document.getElementById("gameControls").innerHTML = `
            <label>
                حریف
                <select id="pingDifficulty">
                    <option value="0.65">آسان</option>
                    <option value="1" selected>معمولی</option>
                    <option value="1.35">سخت</option>
                </select>
            </label>
        `;

        document.getElementById("pingDifficulty")
            .addEventListener("change", event => {
                difficulty = Number(event.target.value);
            });

        function drawRacket(x, y, angle, color) {
            ctx.save();

            ctx.translate(x, y);
            ctx.rotate(angle);

            ctx.fillStyle = "#d0a070";
            ctx.beginPath();
            ctx.roundRect(-7, 17, 14, 46, 6);
            ctx.fill();

            ctx.fillStyle = "#87512e";
            ctx.fillRect(-3, 22, 6, 35);

            const gradient = ctx.createRadialGradient(
                -10, -14, 3,
                0, 0, 45
            );

            gradient.addColorStop(0, "#fff");
            gradient.addColorStop(0.12, color);
            gradient.addColorStop(1, "#7d2030");

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.ellipse(0, 0, 34, 42, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#ffffff70";
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.ellipse(-5, -7, 25, 32, -0.2, 3.5, 5.3);
            ctx.stroke();

            ctx.restore();
        }

        function drawBall() {
            const gradient = ctx.createRadialGradient(
                ball.x - 4,
                ball.y - 5,
                1,
                ball.x,
                ball.y,
                ball.r
            );

            gradient.addColorStop(0, "#fff");
            gradient.addColorStop(1, "#b7c5d1");

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            ctx.fill();
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            ctx.fillStyle = "#172a3c";
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = "#207a56";

            ctx.beginPath();
            ctx.moveTo(100, 90);
            ctx.lineTo(800, 90);
            ctx.lineTo(875, 560);
            ctx.lineTo(25, 560);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 4;
            ctx.strokeRect(100, 90, 700, 440);

            ctx.setLineDash([12, 12]);
            ctx.beginPath();
            ctx.moveTo(55, 310);
            ctx.lineTo(845, 310);
            ctx.stroke();

            ctx.setLineDash([]);

            ctx.fillStyle = "#d9e4ed";
            ctx.fillRect(40, 300, 820, 7);

            ctx.fillStyle = "#ffffff50";
            ctx.fillRect(40, 294, 820, 5);

            drawRacket(ai.x, ai.y, Math.PI, "#dc4754");
            drawRacket(player.x, player.y, 0, "#e94c58");

            drawBall();

            ctx.fillStyle = "#fff";
            ctx.font = "bold 15px system-ui";
            ctx.textAlign = "center";

            ctx.fillText("حریف", 450, 35);
            ctx.fillText("تو", 450, 585);
        }

        function resetBall(direction) {
            ball.x = 450;
            ball.y = 300;
            ball.vx = (Math.random() - 0.5) * 5;
            ball.vy = direction * 5;
        }

        function movePlayer(event) {
            const rect = canvas.getBoundingClientRect();

            player.x = clamp(
                (event.clientX - rect.left) / rect.width * W,
                130,
                770
            );
        }

        canvas.onpointerdown = event => {
            canvas.setPointerCapture(event.pointerId);
            movePlayer(event);
        };

        canvas.onpointermove = event => {
            movePlayer(event);
        };

        function loop() {
            if (stopped) return;

            ball.x += ball.vx;
            ball.y += ball.vy;

            ball.vx *= 0.999;
            ball.vy *= 0.999;

            if (ball.x < 110 || ball.x > 790) {
                ball.vx *= -1;
            }

            if (
                ball.y > 315 &&
                ball.y < 535 &&
                Math.abs(ball.x - player.x) < 55 &&
                ball.vy > 0
            ) {
                ball.vy = -Math.abs(ball.vy) - 0.5;
                ball.vx += (ball.x - player.x) * 0.08;

                rally++;
                ui.score(rally);
                ui.record(rally);
            }

            if (
                ball.y < 95 &&
                Math.abs(ball.x - ai.x) < 50 &&
                ball.vy < 0
            ) {
                ball.vy = Math.abs(ball.vy) + 0.25;
                ball.vx += (ball.x - ai.x) * 0.08;
            }

            ai.x += (ball.x - ai.x) * 0.035 * difficulty;
            ai.x = clamp(ai.x, 135, 765);

            if (ball.y > 570) {
                ui.message("حریف امتیاز گرفت");
                rally = 0;
                resetBall(1);
            }

            if (ball.y < 55) {
                ui.message("آفرین! امتیاز تو");
                rally += 3;
                ui.score(rally);
                ui.record(rally);
                resetBall(-1);
            }

            draw();
            animation = requestAnimationFrame(loop);
        }

        loop();

        return {
            stop() {
                stopped = true;
                cancelAnimationFrame(animation);

                canvas.onpointerdown = null;
                canvas.onpointermove = null;
            }
        };
    }

    return { start };
})();
