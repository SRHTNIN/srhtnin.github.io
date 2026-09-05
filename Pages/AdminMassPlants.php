<?php

$PageTitle = "Admin mass plants";
$PageSection = "Admin";

?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Mass plant editor</h1>

            <p>
                Mark the plants you want to edit, enable the fields to
                change, then save. Fields left disabled stay untouched.
            </p>

            <p
                id="AdminAccessMessage"
                class="PageMessage"
                aria-live="polite"
            >
                Checking admin access...
            </p>

            <div id="AdminContent" hidden>
                <section class="Panel AdminMassSelectionPanel">
                    <div class="PanelHeader">
                        <h2>Plants</h2>
                    </div>

                    <div class="AdminMassSelectionBody">
                        <div
                            id="AdminMassPlantSelection"
                            class="AdminPlantChecklist AdminMassChecklist"
                        ></div>

                        <div class="AdminEditorActions">
                            <button
                                id="AdminMassPlantSelectAll"
                                class="ActionButton AdminInlineButton"
                                type="button"
                            >
                                Select all
                            </button>

                            <button
                                id="AdminMassPlantClear"
                                class="ActionButton AdminInlineButton"
                                type="button"
                            >
                                Clear selection
                            </button>
                        </div>
                    </div>
                </section>

                <form
                    id="AdminMassPlantForm"
                    class="Panel AdminEditorForm AdminMassEditorForm"
                >
                    <div class="PanelHeader PanelHeaderInset">
                        <h2>Fields</h2>
                    </div>

                    <div class="AdminEditorGrid">
                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Name">
                                <span>Apply</span>
                            </label>

                            <label class="AdminEditorField">
                                <span>Name</span>
                                <input id="AdminMassPlantName" type="text" maxlength="64">
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Description">
                                <span>Apply</span>
                            </label>

                            <label class="AdminEditorField">
                                <span>Description</span>
                                <textarea id="AdminMassPlantDescription" rows="4"></textarea>
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Tags">
                                <span>Apply</span>
                            </label>

                            <label class="AdminEditorField">
                                <span>Tags</span>
                                <input id="AdminMassPlantTags" type="text" placeholder="Rose, Flower, Red">
                                <small>Comma-separated.</small>
                            </label>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="GrowthTime">
                                <span>Apply</span>
                            </label>

                            <div class="AdminEditorField">
                                <span>Growth time</span>

                                <div class="AdminDurationInputs">
                                    <label>
                                        <span>Hours</span>
                                        <input id="AdminMassPlantGrowthHours" type="number" min="0" step="1" value="1">
                                    </label>
                                    <label>
                                        <span>Minutes</span>
                                        <input id="AdminMassPlantGrowthMinutes" type="number" min="0" max="59" step="1" value="0">
                                    </label>
                                    <label>
                                        <span>Seconds</span>
                                        <input id="AdminMassPlantGrowthSeconds" type="number" min="0" max="59" step="1" value="0">
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="HarvestMultiplier">
                                <span>Apply</span>
                            </label>

                            <label class="AdminEditorField">
                                <span>Harvest multiplier</span>
                                <input id="AdminMassPlantHarvestMultiplier" type="number" min="0" max="9999.9999" step="0.0001" value="1.5">
                            </label>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="ShopPlant">
                                <span>Apply</span>
                            </label>

                            <label class="AdminEditorField">
                                <span>Shop plant</span>
                                <select id="AdminMassPlantShopPlant">
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </label>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="BaseCost">
                                <span>Apply</span>
                            </label>

                            <label class="AdminEditorField">
                                <span>Base seed cost</span>
                                <input id="AdminMassPlantBaseCost" type="number" min="0" step="1" value="0">
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Effects">
                                <span>Apply</span>
                            </label>

                            <label class="AdminEditorField">
                                <span>Effects JSON</span>
                                <textarea id="AdminMassPlantEffects" rows="8" spellcheck="false">{}</textarea>
                            </label>
                        </div>
                    </div>

                    <div class="AdminEditorActions">
                        <button
                            id="AdminMassPlantSaveButton"
                            class="ActionButton AdminSaveButton"
                            type="submit"
                        >
                            Save marked plants
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
                    id="AdminMassPlantMessage"
                    class="PageMessage"
                    aria-live="polite"
                ></p>
            </div>
        </main>

        <script src="/Scripts/Garden/FunctionalEffects.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/AdminValidation.js"></script>
        <script src="/Scripts/Garden/AdminMassPlantEditor.js"></script>
    </body>
</html>
