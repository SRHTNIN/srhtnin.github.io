<?php

$PageTitle = "Admin";
$PageSection = "Admin";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Admin</h1>

            <p
                id="AdminAccessMessage"
                class="PageMessage"
                aria-live="polite"
            >
                Checking admin access...
            </p>

            <div
                id="AdminContent"
                hidden
            >
                <p>
                    Content tools for editing the Garden catalogue.
                    Changes here affect the live game data.
                </p>

                <div class="AdminEditorNavigation">
                    <a
                        class="ActionButton AdminEditorLink"
                        href="/Pages/AdminPlants.html"
                    >
                        <strong>Plant editor</strong>
                        <span>
                            Add plants and edit their catalogue data.
                        </span>
                    </a>

                    <a
                        class="ActionButton AdminEditorLink"
                        href="/Pages/AdminMutations.html"
                    >
                        <strong>Mutation editor</strong>
                        <span>
                            Build mutation recipes with a visual grid.
                        </span>
                    </a>

                    <a
                        class="ActionButton AdminEditorLink"
                        href="/Pages/AdminMassPlants.html"
                    >
                        <strong>Mass plant editor</strong>
                        <span>
                            Apply selected plant fields to several plants at once.
                        </span>
                    </a>

                    <a
                        class="ActionButton AdminEditorLink"
                        href="/Pages/AdminMassMutations.html"
                    >
                        <strong>Mass mutation editor</strong>
                        <span>
                            Apply selected mutation fields to several mutations at once.
                        </span>
                    </a>
                </div>

                <section
                    id="AdminOverview"
                    class="Panel AdminOverview"
                    hidden
                >
                    <div class="PanelHeader">
                        <h2>Quick overview</h2>
                    </div>

                    <p
                        id="AdminOverviewMessage"
                        class="PageMessage"
                        aria-live="polite"
                    ></p>

                    <div class="AdminOverviewGroups">
                        <section>
                            <h2>Plants</h2>
                            <div id="AdminOverviewMissingSprites"></div>
                            <div id="AdminOverviewPlantNoDescription"></div>
                            <div id="AdminOverviewPlantNoTags"></div>
                            <div id="AdminOverviewNoObtain"></div>
                        </section>

                        <section>
                            <h2>Mutations</h2>
                            <div id="AdminOverviewNoDescription"></div>
                            <div id="AdminOverviewNoHint"></div>
                            <div id="AdminOverviewMissingParents"></div>
                            <div id="AdminOverviewMissingChildren"></div>
                            <div id="AdminOverviewNoChance"></div>
                            <div id="AdminOverviewNoSuccessChange"></div>
                        </section>
                    </div>
                </section>
            </div>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/AdminOverview.js"></script>
    </body>
</html>
