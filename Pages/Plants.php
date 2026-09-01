<?php

$PageTitle = "Plants";
$PageSection = "Plants";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Plant encyclopedia</h1>

            <p>
                Every plant you discover is recorded here.
                Undiscovered plants stay hidden until you find
                them in your Garden.
            </p>

            <div
                id="PlantEncyclopediaList"
                class="PlantEncyclopediaList"
            ></div>

            <p
                id="PlantEncyclopediaMessage"
                class="PageMessage"
                aria-live="polite"
            >
                Loading discovered plants...
            </p>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Economy.js"></script>
        <script src="/Scripts/Garden/PlantEncyclopedia.js"></script>
    </body>
</html>
