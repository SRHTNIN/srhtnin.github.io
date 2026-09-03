<?php

$PageTitle = "Mutations";
$PageSection = "Mutations";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Mutation encyclopedia</h1>

            <p>
                Every mutation you discover is recorded here.
                Once found, its recipe and result stay visible so
                you can recreate it whenever you want. Mutation
                hints may also appear here for recipes you are
                currently capable of discovering.
            </p>

            <div
                id="MutationEncyclopediaList"
                class="MutationEncyclopediaList"
            ></div>

            <p
                id="MutationEncyclopediaMessage"
                class="PageMessage"
                aria-live="polite"
            >
                Loading discovered mutations...
            </p>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Economy.js"></script>
        <script src="/Scripts/Garden/Upgrades.js"></script>
        <script src="/Scripts/Garden/MutationEncyclopedia.js"></script>
    </body>
</html>
