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
                <h2 class="ShopSectionHeading">
                    <button
                        id="PermanentUpgradesToggle"
                        class="ShopSectionToggle"
                        type="button"
                        aria-expanded="false"
                        aria-controls="PermanentUpgradesContent"
                    >
                        <span class="ShopSectionArrow" aria-hidden="true">&gt;</span>
                        <span>Permanent upgrades</span>
                    </button>
                </h2>

                <div
                    id="PermanentUpgradesContent"
                    class="ShopSectionContent"
                    hidden
                >
                    <p>
                        Expand your active Garden, buy additional Gardens,
                        or unlock information and quality-of-life features.
                    </p>

                    <div
                        id="ShopGardenUpgradeList"
                        class="ShopSeedList"
                    ></div>
                </div>
            </section>

            <section
                id="Seeds"
                class="ShopSection"
            >
                <h2 class="ShopSectionHeading">
                    <button
                        id="SeedsToggle"
                        class="ShopSectionToggle"
                        type="button"
                        aria-expanded="true"
                        aria-controls="SeedsContent"
                    >
                        <span class="ShopSectionArrow" aria-hidden="true">&gt;</span>
                        <span>Seeds</span>
                    </button>
                </h2>

                <div
                    id="SeedsContent"
                    class="ShopSectionContent"
                >
                    <div
                        class="CatalogueControls"
                        aria-label="Seed search and sorting"
                    >
                        <input
                            id="ShopSeedSearchInput"
                            type="search"
                            placeholder="Search plants..."
                            aria-label="Search plants"
                            autocomplete="off"
                        >

                        <select
                            id="ShopSeedSortSelect"
                            aria-label="Sort seeds"
                        >
                            <option value="IdAsc">ID</option>
                            <option value="NameAsc">Name A-Z</option>
                            <option value="PriceAsc">Price low-high</option>
                            <option value="PriceDesc">Price high-low</option>
                            <option value="GrowthAsc">Growth short-long</option>
                            <option value="GrowthDesc">Growth long-short</option>
                            <option value="RewardAsc">Reward low-high</option>
                            <option value="RewardDesc">Reward high-low</option>
                            <option value="DphDesc">DPH high-low</option>
                            <option value="DphAsc">DPH low-high</option>
                            <option value="InventoryDesc">Inventory high-low</option>
                            <option value="InventoryAsc">Inventory low-high</option>
                        </select>
                    </div>

                    <div
                        id="ShopSeedList"
                        class="ShopSeedList"
                    ></div>
                </div>
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
