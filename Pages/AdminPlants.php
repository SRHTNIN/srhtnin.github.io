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

                    <label for="AdminPlantDuplicateSelect">
                        Duplicate existing
                    </label>

                    <select id="AdminPlantDuplicateSelect"></select>

                    <button
                        id="AdminPlantDuplicateButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        Duplicate
                    </button>
                </div>

                <div class="AdminEditorActions AdminEditorTransferActions">
                    <button
                        id="AdminPlantImportButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        Import JSON
                    </button>

                    <input
                        id="AdminPlantImportFile"
                        type="file"
                        accept="application/json,.json"
                        hidden
                    >

                    <button
                        id="AdminPlantExportButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        Export JSON
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
                                Used by saves, recipes and repository sprite fallbacks.
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

                        <div class="AdminEditorField">
                            <span>Growth time</span>

                            <div class="AdminDurationInputs">
                                <label>
                                    <span>Hours</span>
                                    <input
                                        id="AdminPlantGrowthHours"
                                        type="number"
                                        min="0"
                                        step="1"
                                        required
                                    >
                                </label>

                                <label>
                                    <span>Minutes</span>
                                    <input
                                        id="AdminPlantGrowthMinutes"
                                        type="number"
                                        min="0"
                                        max="59"
                                        step="1"
                                        required
                                    >
                                </label>

                                <label>
                                    <span>Seconds</span>
                                    <input
                                        id="AdminPlantGrowthSeconds"
                                        type="number"
                                        min="0"
                                        max="59"
                                        step="1"
                                        required
                                    >
                                </label>
                            </div>

                            <input
                                id="AdminPlantGrowthTime"
                                name="GrowthTime"
                                type="hidden"
                            >

                            <small id="AdminPlantGrowthTimeHint"></small>
                        </div>

                        <label class="AdminEditorField">
                            <span>Harvest multiplier</span>
                            <input
                                id="AdminPlantHarvestMultiplier"
                                name="HarvestMultiplier"
                                type="number"
                                min="0"
                                max="9999.9999"
                                step="0.0001"
                                required
                            >
                            <small>
                                Defaults to 1.5. Reward is seed cost × this multiplier.
                            </small>
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

                        <div class="AdminPlantEconomyPreview">
                            <h3>Economy</h3>

                            <dl>
                                <div>
                                    <dt>Seed cost</dt>
                                    <dd id="AdminPlantEconomyCost">Unavailable</dd>
                                </div>
                                <div>
                                    <dt>Harvest multiplier</dt>
                                    <dd id="AdminPlantEconomyMultiplier">1.5×</dd>
                                </div>
                                <div>
                                    <dt>Harvest reward</dt>
                                    <dd id="AdminPlantEconomyReward">Unavailable</dd>
                                </div>
                                <div>
                                    <dt>Net profit</dt>
                                    <dd id="AdminPlantEconomyProfit">Unavailable</dd>
                                </div>
                                <div>
                                    <dt>Growth time</dt>
                                    <dd id="AdminPlantEconomyGrowth">Unavailable</dd>
                                </div>
                                <div>
                                    <dt>DPH</dt>
                                    <dd id="AdminPlantEconomyDph">Unavailable</dd>
                                </div>
                                <div class="AdminPlantEconomySource">
                                    <dt>Price source</dt>
                                    <dd id="AdminPlantEconomySource">Unavailable</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div class="AdminPlantImagesSection">
                        <h2>Sprites</h2>

                        <p>
                            Optional. You can save a plant with no sprites and add them later.
                            Upload PNG files named by stage, such as
                            <code>1.png</code>, <code>2.png</code>, <code>3.png</code>.
                        </p>

                        <div class="AdminPlantImageUpload">
                            <input
                                id="AdminPlantImageFiles"
                                type="file"
                                accept="image/png,.png"
                                multiple
                            >

                            <button
                                id="AdminPlantImageUploadButton"
                                class="ActionButton AdminInlineButton"
                                type="button"
                            >
                                Upload selected sprites
                            </button>
                        </div>

                        <p
                            id="AdminPlantImageNote"
                            class="AdminPlantImageNote"
                        ></p>

                        <div
                            id="AdminPlantImageList"
                            class="AdminPlantImageList"
                        ></div>
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
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Economy.js"></script>
        <script src="/Scripts/Garden/AdminValidation.js"></script>
        <script src="/Scripts/Garden/AdminPlantEditor.js"></script>
    </body>
</html>
