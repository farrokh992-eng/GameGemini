window.HockeyGame = (() => {
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
        let score = 0;
        let difficulty = 1;

        const player = {
            x: 450,
            y: 465,
            r: 34
        };

        const ai = {
            x: 450,
            y: 135,
            r: 34
        };

        const puck = {
            x: 450,
            y: 300,
            vx: 3.7,
            vy: 4.1,
            r: 16
        };

        let playerGoals = 0;
        let aiGoals = 0;

        document.getElementById("gameControls").innerHTML = `
            <label>
                حریف
                <select id="hockeyDifficulty">
                    <option value="0.7">آسان</option>
                    <option value="1" selected>معمولی</option>
                    <option value="1.35">سخت</option>
                </select>
            </label>
        `;

        document.getElementById("hockeyDifficulty")
            .addEventListener("change", event => {
                difficulty = Number(event.target.value);
            });

        function drawMallet(mallet, color) {
            const gradient = ctx.createRadialGradient(
                mallet.x - 12,
                mallet.y - 14,
                3,
                mallet.x,
                mallet.y,
                mallet.r
            );

            gradient.addColorStop(0, "#fff4d5");
            gradient.addColorStop(0.2, color);
            gradient.addColorStop(1, "#663747");

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(
                mallet.x,
                mallet.y,
                mallet.r,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.strokeStyle = "#ffffff88";
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = "#ffffff65";

            ctx.beginPath();
            ctx.arc(
                mallet.x - 9,
                mallet.y - 11,
                8,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        function drawPuck() {
            ctx.save();

            ctx.shadowColor = "#102b50";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 7;

            const gradient = ctx.createRadialGradient(
                puck.x - 6,
                puck.y - 6,
                1,
                puck.x,
                puck.y,
                puck.r
            );

            gradient.addColorStop(0, "#657181");
            gradient.addColorStop(0.35, "#303946");
            gradient.addColorStop(1, "#10151b");

            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(
                puck.x,
                puck.y,
                puck.r,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            const background = ctx.createLinearGradient(0, 0, W, H);
            background.addColorStop(0, "#1a7cb3");
            background.addColorStop(1, "#123e79");

            ctx.fillStyle = background;
            ctx.fillRect(0, 0, W, H);

            ctx.beginPath();
            ctx.roundRect(60, 35, 780, 530, 32);
            ctx.fillStyle = "#237fb9";
            ctx.fill();

            ctx.strokeStyle = "#8ddfff";
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.beginPath();
            ctx.roundRect(78, 53, 744, 494, 24);
            ctx.fillStyle = "#2b94c9";
            ctx.fill();

            ctx.strokeStyle = "#d7f8ff";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.strokeStyle = "#e2f9ff";
            ctx.lineWidth = 5;

            ctx.beginPath();
            ctx.moveTo(80, 300);
            ctx.lineTo(820, 300);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(450, 300, 82, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeRect(265, 55, 370, 95);
            ctx.strokeRect(265, 480, 370, 95);

            ctx.fillStyle = "#102b50";
            ctx.fillRect(350, 25, 200, 17);
            ctx.fillRect(350, 568, 200, 17);

            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = "bold 18px system-ui";

            ctx.fillText("حریف: " + aiGoals, 450, 22);
            ctx.fillText("تو: " + playerGoals, 450, 598);

            drawMallet(ai, "#ffb56d");
            drawMallet(player, "#ff668e");
            drawPuck();
        }

        function resetPuck(direction) {
            puck.x = 450;
            puck.y = 300;
            puck.vx = (Math.random() - 0.5) * 4;
            puck.vy = direction * 4;
        }

        function movePlayer(event) {
            const rect = canvas.getBoundingClientRect();

            player.x = clamp(
                (event.clientX - rect.left) / rect.width * W,
                110,
                790
            );

            player.y = clamp(
                (event.clientY - rect.top) / rect.height * H,
                330,
                535
            );
        }

        canvas.onpointerdown = event => {
            canvas.setPointerCapture(event.pointerId);
            movePlayer(event);
        };

        canvas.onpointermove = event => {
            if (event.buttons || event.pointerType === "touch") {
                movePlayer(event);
            }
        };

        function collideMallet(mallet) {
            const dx = puck.x - mallet.x;
            const dy = puck.y - mallet.y;
            const distance = Math.hypot(dx, dy) || 1;
            const minimum = puck.r + mallet.r;

            if (distance >= minimum) return;

            const nx = dx / distance;
            const ny = dy / distance;

            puck.x = mallet.x + nx * (minimum + 1);
            puck.y = mallet.y + ny * (minimum + 1);

            const speed = Math.max(
                4,
                Math.hypot(puck.vx, puck.vy)
            );

            puck.vx = nx * speed;
            puck.vy = ny * speed;
        }

        function loop() {
            if (stopped) return;

            puck.x += puck.vx;
            puck.y += puck.vy;

            puck.vx *= 0.999;
            puck.vy *= 0.999;

            if (puck.x < 98 + puck.r || puck.x > 802 - puck.r) {
                puck.vx *= -0.97;
                puck.x = clamp(puck.x, 98 + puck.r, 802 - puck.r);
            }

            if (
                puck.y < 55 + puck.r &&
                !(puck.x > 350 && puck.x < 550)
            ) {
                puck.vy = Math.abs(puck.vy) * 0.97;
                puck.y = 55 + puck.r;
            }

            if (
                puck.y > 545 - puck.r &&
                !(puck.x > 350 && puck.x < 550)
            ) {
                puck.vy = -Math.abs(puck.vy) * 0.97;
                puck.y = 545 - puck.r;
            }

            collideMallet(player);
            collideMallet(ai);

            ai.x += (puck.x - ai.x) * 0.035 * difficulty;
            ai.y += (Math.min(250, puck.y) - ai.y) * 0.025 * difficulty;

            ai.x = clamp(ai.x, 135, 765);
            ai.y = clamp(ai.y, 90, 260);

            if (
                puck.y < 35 &&
                puck.x > 355 &&
                puck.x < 545
            ) {
                playerGoals++;
                score += 10;

                ui.score(score);
                ui.record(score);
                ui.message("گللل! ⚽");

                resetPuck(1);
            }

            if (
                puck.y > 565 &&
                puck.x > 355 &&
                puck.x < 545
            ) {
                aiGoals++;

                ui.message("حریف گل زد!");

                resetPuck(-1);
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
