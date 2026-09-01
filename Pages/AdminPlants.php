<?php

$PageTitle = "Admin plants";
$PageSection = "Admin";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Plant editor</h1>

            <p>
                Add plants or edit existing catalogue data. Numeric IDs
                and existing Plant Keys stay permanent once created.
            </p>

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
                <div class="AdminEditorToolbar">
                    <label for="AdminPlantSelect">
                        Plant
                    </label>

                    <select id="AdminPlantSelect"></select>

                    <button
                        id="AdminPlantNewButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        New plant
                    </button>
                </div>

                <form
                    id="AdminPlantForm"
                    class="Panel AdminEditorForm"
                >
                    <div class="AdminEditorGrid">
                        <label class="AdminEditorField">
                            <span>ID</span>
                            <input
                                id="AdminPlantId"
                                name="Id"
                                type="number"
                                min="1"
                                step="1"
                                required
                            >
                            <small>
                                Permanent. New plants default to the next ID.
                            </small>
                        </label>

                        <label class="AdminEditorField">
                            <span>Plant Key</span>
                            <input
                                id="AdminPlantKey"
                                name="PlantKey"
                                type="text"
                                maxlength="64"
                                required
                            >
                            <small>
                                Used by saves, recipes and the sprite folder.
                            </small>
                        </label>

                        <label class="AdminEditorField AdminEditorWideField">
                            <span>Name</span>
                            <input
                                id="AdminPlantName"
                                name="Name"
                                type="text"
                                maxlength="64"
                                required
                            >
                        </label>

                        <label class="AdminEditorField AdminEditorWideField">
                            <span>Description</span>
                            <textarea
                                id="AdminPlantDescription"
                                name="Description"
                                rows="4"
                                required
                            ></textarea>
                        </label>

                        <label class="AdminEditorField AdminEditorWideField">
                            <span>Tags</span>
                            <input
                                id="AdminPlantTags"
                                name="Tags"
                                type="text"
                                placeholder="Rose, Flower, Red"
                            >
                            <small>
                                Comma-separated. Spaces around tags are ignored.
                            </small>
                        </label>

                        <label class="AdminEditorField">
                            <span>Growth time (ms)</span>
                            <input
                                id="AdminPlantGrowthTime"
                                name="GrowthTime"
                                type="number"
                                min="0"
                                step="1000"
                                required
                            >
                            <small id="AdminPlantGrowthTimeHint"></small>
                        </label>

                        <label class="AdminEditorField">
                            <span>Base seed cost</span>
                            <input
                                id="AdminPlantBaseCost"
                                name="BaseCost"
                                type="number"
                                min="0"
                                step="1"
                            >
                            <small>
                                Used only for plants stocked from the start.
                            </small>
                        </label>

                        <label class="AdminEditorCheckField">
                            <input
                                id="AdminPlantShopPlant"
                                name="ShopPlant"
                                type="checkbox"
                            >
                            <span>
                                Available in the Shop from the beginning
                            </span>
                        </label>

                        <label class="AdminEditorField AdminEditorWideField">
                            <span>Effects JSON</span>
                            <textarea
                                id="AdminPlantEffects"
                                name="Effects"
                                rows="6"
                                spellcheck="false"
                            ></textarea>
                            <small>
                                Keep this as <code>{}</code> when the plant has no effects.
                            </small>
                        </label>
                    </div>

                    <div class="AdminEditorPreview">
                        <h2>Preview</h2>

                        <div class="AdminPlantPreviewRow">
                            <div
                                id="AdminPlantPreviewTile"
                                class="PlantTile AdminPlantPreviewTile"
                            ></div>

                            <div>
                                <strong id="AdminPlantPreviewName">
                                    New plant
                                </strong>
                                <p id="AdminPlantPreviewKey"></p>
                                <p id="AdminPlantArchiveNote" hidden>
                                    This plant is currently archived.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="AdminEditorActions">
                        <button
                            id="AdminPlantSaveButton"
                            class="ActionButton AdminSaveButton"
                            type="submit"
                        >
                            Save plant
                        </button>

                        <a
                            class="ActionButton AdminInlineButton AdminEditorBackLink"
                            href="/Pages/Admin.html"
                        >
                            Back to Admin
                        </a>
                    </div>
                </form>

                <p
                    id="AdminPlantMessage"
                    class="PageMessage"
                    aria-live="polite"
                ></p>
            </div>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/AdminPlantEditor.js"></script>
    </body>
</html>
