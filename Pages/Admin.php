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

                    <button
                        id="AdminMassImportButton"
                        class="ActionButton AdminEditorLink"
                        type="button"
                    >
                        <strong>Mass import</strong>
                        <span>
                            Review and save several plant or mutation JSON files at once.
                        </span>
                    </button>

                    <button
                        id="AdminMassExportButton"
                        class="ActionButton AdminEditorLink"
                        type="button"
                    >
                        <strong>Mass export</strong>
                        <span>
                            Select plants and mutations to export together.
                        </span>
                    </button>

                    <input
                        id="AdminMassImportFiles"
                        type="file"
                        accept="application/json,.json"
                        multiple
                        hidden
                    >
                </div>

                <section
                    id="AdminMassImportPanel"
                    class="Panel AdminTransferPanel"
                    hidden
                >
                    <div class="PanelHeader AdminTransferPanelHeader">
                        <h2>Mass import</h2>
                        <button
                            id="AdminMassImportCloseButton"
                            class="ActionButton AdminTransferCloseButton"
                            type="button"
                        >
                            Close
                        </button>
                    </div>

                    <div class="AdminTransferPanelBody">
                        <p>
                            Review imported content before saving it. Nothing is changed until
                            you press Save imported content.
                        </p>

                        <div class="AdminTransferToolbar">
                            <button
                                id="AdminMassImportChooseButton"
                                class="ActionButton AdminInlineButton"
                                type="button"
                            >
                                Choose JSON files
                            </button>

                            <span id="AdminMassImportSummary" class="AdminTransferSummary"></span>
                        </div>

                        <div
                            id="AdminMassImportList"
                            class="AdminTransferCardList"
                        ></div>

                        <p
                            id="AdminMassImportMessage"
                            class="PageMessage"
                            aria-live="polite"
                        ></p>

                        <div class="AdminEditorActions AdminTransferFooter">
                            <button
                                id="AdminMassImportSaveButton"
                                class="ActionButton AdminSaveButton"
                                type="button"
                                disabled
                            >
                                Save imported content
                            </button>
                        </div>
                    </div>
                </section>

                <section
                    id="AdminMassExportPanel"
                    class="Panel AdminTransferPanel"
                    hidden
                >
                    <div class="PanelHeader AdminTransferPanelHeader">
                        <h2>Mass export</h2>
                        <button
                            id="AdminMassExportCloseButton"
                            class="ActionButton AdminTransferCloseButton"
                            type="button"
                        >
                            Close
                        </button>
                    </div>

                    <div class="AdminTransferPanelBody">
                        <p>
                            Select any mix of plants and mutations. Each item stays as its own
                            portable JSON file inside the exported ZIP.
                        </p>

                        <div class="CatalogueControls AdminTransferSearchControls">
                            <input
                                id="AdminMassExportSearchInput"
                                type="search"
                                placeholder="Search plants and mutations..."
                                aria-label="Search exportable content"
                                autocomplete="off"
                            >

                            <span id="AdminMassExportSummary" class="AdminTransferSummary"></span>
                        </div>

                        <div class="AdminTransferSelectionActions">
                            <button id="AdminMassExportSelectAllButton" class="ActionButton AdminInlineButton" type="button">Select all</button>
                            <button id="AdminMassExportSelectPlantsButton" class="ActionButton AdminInlineButton" type="button">Select plants</button>
                            <button id="AdminMassExportSelectMutationsButton" class="ActionButton AdminInlineButton" type="button">Select mutations</button>
                            <button id="AdminMassExportDeselectAllButton" class="ActionButton AdminInlineButton" type="button">Deselect all</button>
                        </div>

                        <div
                            id="AdminMassExportList"
                            class="AdminTransferCardList"
                        ></div>

                        <p
                            id="AdminMassExportMessage"
                            class="PageMessage"
                            aria-live="polite"
                        ></p>

                        <div class="AdminEditorActions AdminTransferFooter">
                            <button
                                id="AdminMassExportSaveButton"
                                class="ActionButton AdminSaveButton"
                                type="button"
                                disabled
                            >
                                Export selected
                            </button>
                        </div>
                    </div>
                </section>

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
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/FunctionalEffects.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Economy.js"></script>
        <script src="/Scripts/Garden/AdminValidation.js"></script>
        <script src="/Scripts/Garden/AdminOverview.js"></script>
        <script src="/Scripts/Garden/AdminContentTransfer.js"></script>
    </body>
</html>
