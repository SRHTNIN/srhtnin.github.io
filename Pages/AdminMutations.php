<?php

$PageTitle = "Admin mutations";
$PageSection = "Admin";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer AdminMutationMain">
            <h1>Mutation editor</h1>

            <p>
                Edit mutation settings and build the recipe visually.
                Select a cell in either grid to change what it means.
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
                    <label for="AdminMutationSelect">
                        Mutation
                    </label>

                    <select id="AdminMutationSelect"></select>

                    <button
                        id="AdminMutationNewButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        New mutation
                    </button>

                    <label for="AdminMutationDuplicateSelect">
                        Duplicate existing
                    </label>

                    <select id="AdminMutationDuplicateSelect"></select>

                    <button
                        id="AdminMutationDuplicateButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        Duplicate
                    </button>
                </div>

                <div class="AdminEditorActions AdminEditorTransferActions">
                    <button
                        id="AdminMutationImportButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        Import JSON
                    </button>

                    <input
                        id="AdminMutationImportFile"
                        type="file"
                        accept="application/json,.json"
                        hidden
                    >

                    <button
                        id="AdminMutationExportButton"
                        class="ActionButton AdminInlineButton"
                        type="button"
                    >
                        Export JSON
                    </button>
                </div>

                <form
                    id="AdminMutationForm"
                    class="Panel AdminEditorForm"
                >
                    <div class="AdminEditorGrid">
                        <label class="AdminEditorField">
                            <span>ID</span>
                            <input
                                id="AdminMutationId"
                                type="number"
                                min="1"
                                step="1"
                                required
                            >
                            <small>
                                Permanent. New mutations default to the next ID.
                            </small>
                        </label>

                        <label class="AdminEditorField">
                            <span>Mutation Key</span>
                            <input
                                id="AdminMutationKey"
                                type="text"
                                maxlength="64"
                                required
                            >
                        </label>

                        <label class="AdminEditorField AdminEditorWideField">
                            <span>Name</span>
                            <input
                                id="AdminMutationName"
                                type="text"
                                maxlength="128"
                                required
                            >
                        </label>

                        <label class="AdminEditorField AdminEditorWideField">
                            <span>Description</span>
                            <textarea
                                id="AdminMutationDescription"
                                rows="4"
                            ></textarea>
                        </label>

                        <label class="AdminEditorField AdminEditorWideField">
                            <span>Hint</span>
                            <textarea
                                id="AdminMutationHint"
                                rows="3"
                                placeholder="Optional hint shown by the Mutation Hints upgrade."
                            ></textarea>
                            <small>
                                Optional. Leave blank if this mutation should not have a hint.
                            </small>
                        </label>

                        <label class="AdminEditorField">
                            <span>Priority</span>
                            <input
                                id="AdminMutationPriority"
                                type="number"
                                step="1"
                                required
                            >
                        </label>

                        <label class="AdminEditorField">
                            <span>Chance (%)</span>
                            <input
                                id="AdminMutationChance"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                required
                            >
                        </label>

                        <div class="AdminEditorField">
                            <span>Cooldown</span>

                            <div class="AdminDurationInputs">
                                <label>
                                    <span>Hours</span>
                                    <input
                                        id="AdminMutationCooldownHours"
                                        type="number"
                                        min="0"
                                        step="1"
                                        required
                                    >
                                </label>

                                <label>
                                    <span>Minutes</span>
                                    <input
                                        id="AdminMutationCooldownMinutes"
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
                                        id="AdminMutationCooldownSeconds"
                                        type="number"
                                        min="0"
                                        max="59"
                                        step="1"
                                        required
                                    >
                                </label>
                            </div>

                            <input
                                id="AdminMutationCooldown"
                                type="hidden"
                            >

                            <small id="AdminMutationCooldownHint"></small>
                        </div>

                        <label class="AdminEditorField">
                            <span>Rotation</span>
                            <select id="AdminMutationRotation">
                                <option value="None">None</option>
                                <option value="Any">Any</option>
                            </select>
                        </label>

                        <label class="AdminEditorCheckField">
                            <input
                                id="AdminMutationAllowImmature"
                                type="checkbox"
                            >
                            <span>
                                Allow immature plants
                            </span>
                        </label>
                    </div>

                    <section class="AdminMutationRecipeSection">
                        <div class="AdminMutationRecipeHeader">
                            <div>
                                <h2>Visual recipe</h2>
                                <p>
                                    Pattern and result always use the same dimensions.
                                </p>
                            </div>

                            <div class="AdminMutationDimensions">
                                <label>
                                    Width
                                    <input
                                        id="AdminMutationWidth"
                                        type="number"
                                        min="1"
                                        max="7"
                                        step="1"
                                        value="3"
                                    >
                                </label>

                                <label>
                                    Height
                                    <input
                                        id="AdminMutationHeight"
                                        type="number"
                                        min="1"
                                        max="7"
                                        step="1"
                                        value="1"
                                    >
                                </label>

                                <button
                                    id="AdminMutationResizeButton"
                                    class="ActionButton AdminInlineButton"
                                    type="button"
                                >
                                    Resize
                                </button>
                            </div>
                        </div>

                        <div class="AdminMutationRecipeFlow">
                            <div class="AdminMutationGridPanel">
                                <h3>Arrange</h3>
                                <div
                                    id="AdminMutationPatternGrid"
                                    class="GuideRecipe AdminMutationGrid"
                                ></div>
                            </div>

                            <span
                                class="MutationEncyclopediaRecipeArrow"
                                aria-hidden="true"
                            >
                                →
                            </span>

                            <div class="AdminMutationGridPanel">
                                <h3>Result</h3>
                                <div
                                    id="AdminMutationResultGrid"
                                    class="GuideRecipe AdminMutationGrid"
                                ></div>
                            </div>
                        </div>

                        <div
                            id="AdminMutationCellEditor"
                            class="AdminMutationCellEditor"
                            hidden
                        >
                            <h3 id="AdminMutationCellEditorTitle">
                                Cell
                            </h3>

                            <div id="AdminMutationPatternCellControls">
                                <label class="AdminEditorField">
                                    <span>Type</span>
                                    <select id="AdminMutationPatternCellType">
                                        <option value="Any">Any</option>
                                        <option value="Empty">Empty</option>
                                        <option value="Plant">Exact plant</option>
                                        <option value="Matcher">Tag matcher</option>
                                    </select>
                                </label>

                                <label
                                    id="AdminMutationPatternPlantRow"
                                    class="AdminEditorField"
                                    hidden
                                >
                                    <span>Plant</span>
                                    <select id="AdminMutationPatternPlant"></select>
                                </label>

                                <div
                                    id="AdminMutationMatcherRows"
                                    class="AdminMatcherFields"
                                    hidden
                                >
                                    <label class="AdminEditorField">
                                        <span>Exact plant (optional)</span>
                                        <select id="AdminMutationMatcherPlant"></select>
                                    </label>

                                    <label class="AdminEditorField">
                                        <span>Required tags</span>
                                        <input
                                            id="AdminMutationMatcherTags"
                                            type="text"
                                            placeholder="Rose, Red"
                                        >
                                    </label>

                                    <label class="AdminEditorField">
                                        <span>Any of these tags</span>
                                        <input
                                            id="AdminMutationMatcherTagsAny"
                                            type="text"
                                        >
                                    </label>

                                    <label class="AdminEditorField">
                                        <span>Excluded tags</span>
                                        <input
                                            id="AdminMutationMatcherTagsNot"
                                            type="text"
                                        >
                                    </label>

                                    <label class="AdminEditorField">
                                        <span>Capture name</span>
                                        <input
                                            id="AdminMutationMatcherCapture"
                                            type="text"
                                            placeholder="ParentA"
                                        >
                                    </label>
                                </div>
                            </div>

                            <div
                                id="AdminMutationResultCellControls"
                                hidden
                            >
                                <label class="AdminEditorField">
                                    <span>Type</span>
                                    <select id="AdminMutationResultCellType">
                                        <option value="Keep">Keep</option>
                                        <option value="Empty">Empty</option>
                                        <option value="Plant">Plant</option>
                                        <option value="Capture">Captured plant</option>
                                    </select>
                                </label>

                                <label
                                    id="AdminMutationResultPlantRow"
                                    class="AdminEditorField"
                                    hidden
                                >
                                    <span>Plant</span>
                                    <select id="AdminMutationResultPlant"></select>
                                </label>

                                <label
                                    id="AdminMutationResultCaptureRow"
                                    class="AdminEditorField"
                                    hidden
                                >
                                    <span>Capture name</span>
                                    <input
                                        id="AdminMutationResultCapture"
                                        type="text"
                                        placeholder="ParentA"
                                    >
                                </label>
                            </div>
                        </div>
                    </section>

                    <section class="AdminMutationRelationsSection">
                        <h2>Plant relationships</h2>

                        <p>
                            These power discoveries and encyclopedia links.
                            They are metadata, so tag-based recipes may still
                            need explicit plants selected here.
                        </p>

                        <div class="AdminMutationRelationColumns">
                            <fieldset>
                                <legend>Plants used</legend>
                                <div
                                    id="AdminMutationPlantsUsed"
                                    class="AdminPlantChecklist"
                                ></div>
                            </fieldset>

                            <fieldset>
                                <legend>Plants created</legend>
                                <div
                                    id="AdminMutationPlantsCreated"
                                    class="AdminPlantChecklist"
                                ></div>
                            </fieldset>
                        </div>
                    </section>

                    <section class="AdminMutationFailureSection">
                        <h2>Failure result</h2>

                        <label class="AdminEditorField">
                            <span>On failure</span>
                            <select id="AdminMutationFailureType">
                                <option value="Keep">Keep everything</option>
                                <option value="Clear">Clear matched area</option>
                                <option value="Custom">Custom result JSON</option>
                            </select>
                        </label>

                        <label
                            id="AdminMutationFailureJsonRow"
                            class="AdminEditorField"
                            hidden
                        >
                            <span>Custom failure result JSON</span>
                            <textarea
                                id="AdminMutationFailureJson"
                                rows="6"
                                spellcheck="false"
                            ></textarea>
                        </label>
                    </section>

                    <details class="AdminGeneratedJson">
                        <summary>Generated mutation JSON</summary>
                        <pre id="AdminMutationJsonPreview"></pre>
                    </details>

                    <p id="AdminMutationArchiveNote" hidden>
                        This mutation is currently archived.
                    </p>

                    <div class="AdminEditorActions">
                        <button
                            id="AdminMutationSaveButton"
                            class="ActionButton AdminSaveButton"
                            type="submit"
                        >
                            Save mutation
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
                    id="AdminMutationMessage"
                    class="PageMessage"
                    aria-live="polite"
                ></p>
            </div>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/AdminValidation.js"></script>
        <script src="/Scripts/Garden/AdminMutationEditor.js"></script>
    </body>
</html>
