<?php

$PageTitle = "Garden";

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
            </div>

            <div class="GardenLayout">
                <section>
                    <h2>Plots</h2>

                    <div
                        id="GardenGrid"
                        class="GardenGrid"
                    ></div>
                </section>

                <section class="SeedPanel">
                    <h2>Seeds</h2>

                    <div
                        id="SeedList"
                        class="SeedList"
                    ></div>
                </section>
            </div>

            <p id="GardenMessage">
                Select a seed, then choose an empty plot.
            </p>
        </main>

        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Garden.js"></script>
    </body>
</html>
