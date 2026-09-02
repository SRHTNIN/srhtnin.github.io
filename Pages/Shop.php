<?php

$PageTitle = "Shop";
$PageSection = "Shop";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Garden shop</h1>

            <div class="StatusPanel">
                <strong>Dew:</strong>
                <span id="ShopDewAmount">0</span>
            </div>

            <p>
                Buy seeds here, then take them to the Garden
                to plant them. Seeds are consumable: planting
                one removes it from your inventory.
            </p>

            <p>
                Plants discovered through mutations become
                purchasable automatically. Their seed price is
                based on the cheapest recipe you've discovered,
                plus 10 Dew per hour of mutation time.
            </p>

            <p>
                Harvesting a plant returns 150% of its current
                seed price, rounded up.
            </p>

            <section
                id="PermanentUpgrades"
                class="ShopSection"
            >
                <h2>Permanent upgrades</h2>

                <p>
                    Expand your Garden one row or column at a time.
                    Existing plants keep their positions.
                </p>

                <div
                    id="ShopGardenUpgradeList"
                    class="ShopSeedList"
                ></div>
            </section>

            <section
                id="Seeds"
                class="ShopSection"
            >
                <h2>Seeds</h2>

                <div
                    id="ShopSeedList"
                    class="ShopSeedList"
                ></div>
            </section>

            <p id="ShopMessage" class="PageMessage">
                Choose something to buy.
            </p>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Economy.js"></script>
        <script src="/Scripts/Garden/Upgrades.js"></script>
        <script src="/Scripts/Garden/Shop.js"></script>
    </body>
</html>
