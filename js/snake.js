window.SnakeGame = (() => {
    "use strict";

    const W = 900;
    const H = 600;

    function start(canvas, ui) {
        const ctx = canvas.getContext("2d");

        canvas.width = W;
        canvas.height = H;

        const columns = 30;
        const rows = 20;
        const cell = 25;
        const offsetX = 75;
        const offsetY = 50;

        let animation = 0;
        let stopped = false;
        let over = false;
        let ticks = 0;
        let score = 0;

        let snake;
        let direction;
        let nextDirection;
        let food;

        function reset() {
            snake = [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ];

            direction = { x: 1, y: 0 };
            nextDirection = { x: 1, y: 0 };

            food = { x: 20, y: 10 };

            over = false;
            ticks = 0;
            score = 0;

            ui.score(0);
            ui.message("بخور و رشد کن");
        }

        function changeDirection(next) {
            if (
                next.x === -direction.x &&
                next.y === -direction.y
            ) {
                return;
            }

            nextDirection = next;
        }

        function randomFood() {
            do {
                food = {
                    x: Math.floor(Math.random() * columns),
                    y: Math.floor(Math.random() * rows)
                };
            } while (
                snake.some(segment =>
                    segment.x === food.x &&
                    segment.y === food.y
                )
            );
        }

        document.querySelectorAll("[data-dir]").forEach(button => {
            button.onclick = () => {
                const directions = {
                    up: { x: 0, y: -1 },
                    down: { x: 0, y: 1 },
                    left: { x: -1, y: 0 },
                    right: { x: 1, y: 0 }
                };

                changeDirection(directions[button.dataset.dir]);
            };
        });

        function onKeyDown(event) {
            const directions = {
                ArrowUp: { x: 0, y: -1 },
                ArrowDown: { x: 0, y: 1 },
                ArrowLeft: { x: -1, y: 0 },
                ArrowRight: { x: 1, y: 0 }
            };

            if (directions[event.key]) {
                event.preventDefault();
                changeDirection(directions[event.key]);
            }
        }

        window.addEventListener("keydown", onKeyDown);

        let touchStart = null;

        canvas.ontouchstart = event => {
            const touch = event.touches[0];

            touchStart = {
                x: touch.clientX,
                y: touch.clientY
            };
        };

        canvas.ontouchend = event => {
            if (!touchStart) return;

            const touch = event.changedTouches[0];

            const dx = touch.clientX - touchStart.x;
            const dy = touch.clientY - touchStart.y;

            if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    changeDirection({
                        x: Math.sign(dx),
                        y: 0
                    });
                } else {
                    changeDirection({
                        x: 0,
                        y: Math.sign(dy)
                    });
                }
            }

            touchStart = null;
        };

        function draw() {
            ctx.clearRect(0, 0, W, H);

            ctx.fillStyle = "#f2f0fb";
            ctx.fillRect(0, 0, W, H);

            ctx.strokeStyle = "#e2def4";
            ctx.lineWidth = 1;

            for (let x = 0; x <= columns; x++) {
                ctx.beginPath();
                ctx.moveTo(offsetX + x * cell, offsetY);
                ctx.lineTo(offsetX + x * cell, offsetY + rows * cell);
                ctx.stroke();
            }

            for (let y = 0; y <= rows; y++) {
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY + y * cell);
                ctx.lineTo(offsetX + columns * cell, offsetY + y * cell);
                ctx.stroke();
            }

            ctx.fillStyle = "#ff777f";
            ctx.beginPath();

            ctx.arc(
                offsetX + food.x * cell + cell / 2,
                offsetY + food.y * cell + cell / 2,
                9,
                0,
                Math.PI * 2
            );

            ctx.fill();

            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? "#5a47bc" : "#8b7ae0";

                ctx.beginPath();

                ctx.roundRect(
                    offsetX + segment.x * cell + 2,
                    offsetY + segment.y * cell + 2,
                    cell - 4,
                    cell - 4,
                    index === 0 ? 9 : 6
                );

                ctx.fill();

                if (index === 0) {
                    ctx.fillStyle = "#fff";

                    ctx.beginPath();
                    ctx.arc(
                        offsetX + segment.x * cell + 15,
                        offsetY + segment.y * cell + 8,
                        2.5,
                        0,
                        Math.PI * 2
                    );
                    ctx.arc(
                        offsetX + segment.x * cell + 15,
                        offsetY + segment.y * cell + 16,
                        2.5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            });

            if (over) {
                ctx.fillStyle = "rgba(255,255,255,.94)";
                ctx.beginPath();
                ctx.roundRect(235, 230, 430, 120, 25);
                ctx.fill();

                ctx.textAlign = "center";
                ctx.fillStyle = "#5946a0";
                ctx.font = "bold 26px system-ui";
                ctx.fillText("به خودت برخورد کردی!", 450, 280);

                ctx.font = "16px system-ui";
                ctx.fillText("شروع دوباره را بزن", 450, 320);
            }
        }

        function update() {
            if (over) return;

            direction = { ...nextDirection };

            const head = {
                x: (snake[0].x + direction.x + columns) % columns,
                y: (snake[0].y + direction.y + rows) % rows
            };

            if (
                snake.some(segment =>
                    segment.x === head.x &&
                    segment.y === head.y
                )
            ) {
                over = true;
                ui.message("بازی تمام شد!");
                return;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score++;

                ui.score(score);
                ui.record(score);

                randomFood();
            } else {
                snake.pop();
            }
        }

        function loop() {
            if (stopped) return;

            ticks++;

            if (ticks % 7 === 0) {
                update();
            }

            draw();

            animation = requestAnimationFrame(loop);
        }

        reset();
        loop();

        return {
            stop() {
                stopped = true;
                cancelAnimationFrame(animation);

                window.removeEventListener("keydown", onKeyDown);

                canvas.ontouchstart = null;
                canvas.ontouchend = null;

                document.querySelectorAll("[data-dir]").forEach(button => {
                    button.onclick = null;
                });
            }
        };
    }

    return { start };
})();
