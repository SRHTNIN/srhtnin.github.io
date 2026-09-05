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
            <h1 id="GardenPageHeading">Your Garden</h1>

            <div
                id="GardenSelector"
                class="GardenSelectorPanel"
            >
                <button
                    id="PreviousGardenButton"
                    class="ActionButton GardenSelectorButton"
                    type="button"
                    aria-label="Previous Garden"
                >
                    &lt;
                </button>

                <input
                    id="GardenNameInput"
                    class="GardenNameInput"
                    type="text"
                    maxlength="32"
                    value="Garden"
                    aria-label="Garden name"
                >

                <button
                    id="NextGardenButton"
                    class="ActionButton GardenSelectorButton"
                    type="button"
                    aria-label="Next Garden"
                >
                    &gt;
                </button>
            </div>

            <section
                id="GardenInfoPanel"
                class="StatusPanel GardenInfoPanel"
            >
                <div class="GardenInfoRow GardenInfoTopRow">
                    <div class="GardenInfoSection GardenInfoPrimarySection">
                        <div class="GardenStatusLine">
                            <strong>Dew:</strong>
                            <span id="DewAmount">0</span>
                        </div>

                        <div
                            id="NextHarvestLine"
                            class="GardenStatusLine"
                        >
                            <strong>Next harvest:</strong>
                            <span id="NextHarvest">Nothing planted</span>
                        </div>
                    </div>

                    <div
                        class="GardenInfoSection GardenInfoReservedSection"
                        aria-hidden="true"
                    ></div>
                </div>

                <div
                    id="GardenInfoDetailRow"
                    class="GardenInfoRow GardenInfoDetailRow"
                    hidden
                >
                    <div
                        id="GardenOverviewSection"
                        class="GardenInfoSection GardenOverviewSection"
                    >
                        <div
                            id="GardenOverviewDetails"
                            class="GardenOverviewDetails"
                            hidden
                        >
                            <div
                                id="GardenSizeOverviewLine"
                                class="GardenStatusLine"
                            >
                                <strong>Garden size:</strong>
                                <span id="GardenSizeOverview">3×3 (9)</span>
                            </div>

                            <div
                                id="EmptyPlotsOverviewLine"
                                class="GardenStatusLine"
                            >
                                <strong>Empty plots:</strong>
                                <span id="EmptyPlotsOverview">9/9</span>
                            </div>

                            <div
                                id="PlantedPlotsOverviewLine"
                                class="GardenStatusLine"
                            >
                                <strong>Planted plots:</strong>
                                <span id="PlantedPlotsOverview">0/9</span>
                            </div>

                            <div
                                id="GrowingPlotsOverviewLine"
                                class="GardenStatusLine"
                            >
                                <strong>Growing:</strong>
                                <span id="GrowingPlotsOverview">0/9</span>
                            </div>

                            <div
                                id="ReadyPlotsOverviewLine"
                                class="GardenStatusLine"
                            >
                                <strong>Ready to harvest:</strong>
                                <span id="ReadyPlotsOverview">0/9</span>
                            </div>
                        </div>
                    </div>

                    <div
                        id="GardenEconomySection"
                        class="GardenInfoSection GardenEconomySection"
                    >
                        <div
                            id="GardenEconomyDetails"
                            class="GardenEconomyDetails"
                            hidden
                        >
                            <div class="GardenStatusLine">
                                <strong>Dew invested:</strong>
                                <span id="GardenDewInvested">0</span>
                            </div>

                            <div class="GardenStatusLine">
                                <strong>Harvest value:</strong>
                                <span id="GardenHarvestValue">0</span>
                            </div>

                            <div class="GardenStatusLine">
                                <strong>Net profit:</strong>
                                <span id="GardenNetProfit">0</span>
                            </div>

                            <div class="GardenStatusLine">
                                <strong>Farm DPH:</strong>
                                <span id="GardenDewPerHour">0 Dew</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="QuickBuy"
                class="Panel GardenQuickBuyPanel"
            >
                <div class="PanelHeader PanelHeaderInset GardenQuickBuyHeader">
                    <h2>Quick-buy</h2>

                    <div
                        class="QuickBuyAmountList"
                        role="group"
                        aria-label="Quick-buy amount"
                    >
                        <button
                            id="QuickBuyOneButton"
                            class="QuickBuyAmountButton"
                            type="button"
                        >
                            ×1
                        </button>

                        <button
                            id="QuickBuyTenButton"
                            class="QuickBuyAmountButton"
                            type="button"
                        >
                            ×10
                        </button>

                        <button
                            id="QuickBuyGardenButton"
                            class="QuickBuyAmountButton"
                            type="button"
                        >
                            ×9
                        </button>
                    </div>
                </div>

                <div
                    id="QuickBuyPlantList"
                    class="QuickBuyPlantList"
                ></div>
            </section>

            <section
                id="Tools"
                class="Panel GardenToolsPanel"
            >
                <h2 class="PanelHeader PanelHeaderInset">Tools</h2>

                <div
                    id="ToolList"
                    class="ToolList"
                ></div>
            </section>

            <section
                id="Seeds"
                class="Panel GardenInventoryPanel"
            >
                <h2 class="PanelHeader PanelHeaderInset">Inventory</h2>

                <div
                    id="SeedList"
                    class="SeedList"
                ></div>
            </section>

            <section
                id="Plots"
                class="Panel GardenPlotsPanel"
            >
                <h2 class="PanelHeader PanelHeaderInset">Plots</h2>

                <div class="GardenGridViewport">
                    <div
                        id="GardenGrid"
                        class="GardenGrid"
                    ></div>
                </div>
            </section>

            <p id="GardenMessage" class="PageMessage">
                Select a seed and use the Trowel on an empty plot.
            </p>

            <section
                id="Player"
                class="Panel GardenUser"
            >
                <h2 class="PanelHeader PanelHeaderInset">Player</h2>

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

        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/FunctionalEffects.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Economy.js"></script>
        <script src="/Scripts/Garden/Upgrades.js"></script>
        <script src="/Scripts/Garden/Simulation.js"></script>
        <script src="/Scripts/Garden/MutationEngine.js"></script>
        <script src="/Scripts/Garden/Users.js"></script>
        <script src="/Scripts/Garden/Garden.js"></script>
    </body>
</html>
