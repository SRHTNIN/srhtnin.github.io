async function RenderLeaderboard() {
    const Body =
        document.getElementById(
            "LeaderboardBody"
        );

    try {
        const Response = await fetch(
            ApiUrl + "/Leaderboard.php"
        );

        const Result =
            await Response.json();

        if (!Result.Success) {
            throw new Error(
                Result.Error ??
                "Couldn't load leaderboard."
            );
        }

        Body.replaceChildren();

        if (
            Result.Players.length === 0
        ) {
            const Row =
                document.createElement(
                    "tr"
                );

            const Cell =
                document.createElement(
                    "td"
                );

            Cell.colSpan = 3;
            Cell.className =
                "LeaderboardEmpty";

            Cell.textContent =
                "Nobody is on the leaderboard yet.";

            Row.appendChild(
                Cell
            );

            Body.appendChild(
                Row
            );

            return;
        }


        const UsernameDisplay =
            document.getElementById(
                "UsernameDisplay"
            );

        const CurrentUsername =
            UsernameDisplay?.textContent;


        for (
            const Player
            of Result.Players
        ) {
            const Row =
                document.createElement(
                    "tr"
                );

            Row.classList.add(
                "LeaderboardRow"
            );


            /*
             * Give the top three places
             * their own styling.
             */

            if (
                Player.Rank >= 1 &&
                Player.Rank <= 3
            ) {
                Row.classList.add(
                    "LeaderboardRank" +
                    Player.Rank
                );
            }


            /*
             * Highlight the current player.
             */

            if (
                CurrentUsername !== null &&
                CurrentUsername !==
                    "Unnamed" &&
                Player.Username ===
                    CurrentUsername
            ) {
                Row.classList.add(
                    "LeaderboardSelf"
                );
            }


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


            Rank.className =
                "LeaderboardRank";

            Username.className =
                "LeaderboardUsername";

            Dew.className =
                "LeaderboardDew";


            Rank.textContent =
                Player.Rank + ".";

            Username.textContent =
                Player.Username;

            if (
                Player.Colour !== null
            ) {
                Username.style.color =
                    Player.Colour;
            }

          Dew.textContent =
                Player.Dew.toLocaleString();


            Row.append(
                Rank,
                Username,
                Dew
            );

            Body.appendChild(
                Row
            );
        }
    } catch (Error) {
        console.error(
            "Couldn't render leaderboard:",
            Error
        );

        Body.replaceChildren();

        const Row =
            document.createElement(
                "tr"
            );

        const Cell =
            document.createElement(
                "td"
            );

        Cell.colSpan = 3;
        Cell.className =
            "LeaderboardEmpty";

        Cell.textContent =
            "Couldn't load the leaderboard.";

        Row.appendChild(
            Cell
        );

        Body.appendChild(
            Row
        );
    }
}
