(() => {
    "use strict";

    const $ = selector => document.querySelector(selector);

    const gameNames = {
        billiards: ["بیلیارد", "۸-BALL POOL"],
        pingpong: ["پینگ‌پنگ", "TABLE TENNIS"],
        snake: ["مار مینیمال", "SNAKE"],
        hockey: ["هاکی رومیزی", "AIR HOCKEY"]
    };

    const digits = number =>
        String(number).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);

    const state = {
        active: null,
        engine: null,
        records: JSON.parse(
            localStorage.getItem("pocketArcadeRecords") || "{}"
        )
    };

    function updateRecords() {
        const total = Object.values(state.records)
            .reduce((sum, value) => sum + (Number(value) || 0), 0);

        $("#totalRecord").textContent = digits(total);
    }

    function saveRecord(game, value) {
        state.records[game] = Math.max(
            Number(state.records[game]) || 0,
            Number(value) || 0
        );

        localStorage.setItem(
            "pocketArcadeRecords",
            JSON.stringify(state.records)
        );

        updateRecords();
    }

    updateRecords();

    /* Theme */

    const themeToggle = $("#themeToggle");

    function loadTheme() {
        const dark = localStorage.getItem("pocketArcadeTheme") === "dark";

        document.body.classList.toggle("dark", dark);
        themeToggle.textContent = dark ? "☀️" : "🌙";
    }

    themeToggle.addEventListener("click", () => {
        const dark = !document.body.classList.contains("dark");

        document.body.classList.toggle("dark", dark);

        localStorage.setItem(
            "pocketArcadeTheme",
            dark ? "dark" : "light"
        );

        themeToggle.textContent = dark ? "☀️" : "🌙";
    });

    loadTheme();

    /* Game selection */

    document.querySelectorAll("[data-game]").forEach(button => {
        button.addEventListener("click", () => {
            openGame(button.dataset.game);
        });
    });

    function stopCurrentGame() {
        if (state.engine && typeof state.engine.stop === "function") {
            state.engine.stop();
        }

        state.engine = null;
    }

    function closeGame() {
        stopCurrentGame();

        $("#playScreen").classList.add("hidden");
        $("#gameGrid").classList.remove("hidden");
        $(".hero").classList.remove("hidden");
        $(".record-card").classList.remove("hidden");

        state.active = null;
    }

    $("#backButton").addEventListener("click", closeGame);

    $("#restartButton").addEventListener("click", () => {
        if (state.active) {
            openGame(state.active);
        }
    });

    function openGame(id) {
        if (!gameNames[id]) return;

        stopCurrentGame();

        state.active = id;

        $("#gameGrid").classList.add("hidden");
        $(".hero").classList.add("hidden");
        $(".record-card").classList.add("hidden");
        $("#playScreen").classList.remove("hidden");

        $("#gameHeading").textContent = gameNames[id][0];
        $("#gameKicker").textContent = gameNames[id][1];

        $("#score").textContent = "۰";
        $("#gameMessage").textContent = "آماده‌ای؟";

        const hints = {
            billiards: "برای نشانه‌گیری بکش و رها کن",
            pingpong: "دسته را با انگشت حرکت بده",
            snake: "جهت را عوض کن و از خودت دوری کن",
            hockey: "دسته را بکش و به توپ ضربه بزن"
        };

        $("#canvasHint").textContent = hints[id];

        const ui = {
            score: value => {
                $("#score").textContent = digits(value);
            },

            message: message => {
                $("#gameMessage").textContent = message;
            },

            record: value => {
                saveRecord(id, value);
            }
        };

        const canvas = $("#gameCanvas");

        const games = {
            billiards: window.BilliardsGame,
            pingpong: window.PingPongGame,
            snake: window.SnakeGame,
            hockey: window.HockeyGame
        };

        if (!games[id]) {
            $("#gameMessage").textContent = "این بازی هنوز آماده نیست.";
            return;
        }

        state.engine = games[id].start(canvas, ui);
    }

    window.PocketArcade = {
        digits,
        saveRecord
    };
})();
