<?php

$PageTitle = "Social";
$PageSection = "Social";

?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Social</h1>

            <section
                id="Leaderboard"
                class="Panel Leaderboard"
            >
                <h2>Leaderboard</h2>

                <div class="LeaderboardTableContainer">
                    <table class="LeaderboardTable">
                        <thead>
                            <tr>
                                <th class="LeaderboardRankColumn">
                                    #
                                </th>

                                <th>
                                    Username
                                </th>

                                <th class="LeaderboardDewColumn">
                                    Dew
                                </th>
                            </tr>
                        </thead>

                        <tbody id="LeaderboardBody"></tbody>
                    </table>
                </div>
            </section>
        </main>

        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Users.js"></script>
        <script src="/Scripts/Garden/Leaderboard.js"></script>
        <script src="/Scripts/Garden/Social.js"></script>
    </body>
</html>
