<?php

$PageTitle = "Garden";
$PageSection = "Garden";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Garden</h1>

            <div class="GardenStatus">
                <strong>Dew:</strong>
                <span id="DewAmount">0</span>
                <br>
                <strong>Next harvest:</strong>
                <span id="NextHarvest">Nothing planted</span>
            </div>

            <div class="GardenLayout">
                <section id="Plots">
                    <h2>Plots</h2>

                    <div
                        id="GardenGrid"
                        class="GardenGrid"
                    ></div>
                </section>

                <section
                    id="Seeds"
                    class="SeedPanel"
                >
                    <h2>Seeds</h2>

                    <div
                        id="SeedList"
                        class="SeedList"
                    ></div>

                    <h3 class="GardenToolHeading">
                        Tools
                    </h3>

                    <div class="ToolList">
                        <button
                            id="ShovelToolButton"
                            class="ToolButton ToolButtonShovel"
                            type="button"
                        >
                            Shovel
                        </button>
                    </div>
                </section>
            </div>

            <p id="GardenMessage">
                Select a seed, then choose an empty plot.
            </p>

            <section
                id="Player"
                class="GardenUser"
            >
                <h2>Player</h2>

                <p>
                    Username:
                    <strong id="UsernameDisplay">
                        Loading...
                    </strong>
                </p>

                <form
                    id="UsernameForm"
                    hidden
                >
                    <input
                        id="UsernameInput"
                        type="text"
                        minlength="3"
                        maxlength="24"
                        autocomplete="username"
                        placeholder="Username"
                        required
                    >

                    <button type="submit">
                        Set username
                    </button>

                    <p id="UsernameMessage"></p>
                </form>
            </section>

            <section
                id="Leaderboard"
                class="Leaderboard"
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

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Economy.js"></script>
        <script src="/Scripts/Garden/MutationEngine.js"></script>
        <script src="/Scripts/Garden/Users.js"></script>
        <script src="/Scripts/Garden/Leaderboard.js"></script>
        <script src="/Scripts/Garden/Garden.js"></script>
    </body>
</html>
