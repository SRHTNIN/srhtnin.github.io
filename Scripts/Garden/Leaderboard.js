async function RenderLeaderboard() {
    const Response = await fetch(
        ApiUrl + "/Leaderboard.php"
    );

    const Result =
        await Response.json();

    if (!Result.Success) {
        return;
    }

    const Body =
        document.getElementById(
            "LeaderboardBody"
        );

    Body.replaceChildren();

    for (
        const Player
        of Result.Players
    ) {
        const Row =
            document.createElement(
                "tr"
            );

        const Rank =
            document.createElement(
                "td"
            );

        const Username =
            document.createElement(
                "td"
            );

        const Dew =
            document.createElement(
                "td"
            );

        Rank.textContent =
            Player.Rank + ".";

        Username.textContent =
            Player.Username;

        Dew.textContent =
            Player.Dew;

        Row.append(
            Rank,
            Username,
            Dew
        );

        Body.appendChild(
            Row
        );
    }
}
