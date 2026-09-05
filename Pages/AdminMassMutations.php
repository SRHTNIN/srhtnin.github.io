<?php

$PageTitle = "Admin mass mutations";
$PageSection = "Admin";

?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer AdminMutationMain">
            <h1>Mass mutation editor</h1>

            <p>
                Mark the mutations you want to edit, enable the fields to
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
                        <h2>Mutations</h2>
                    </div>

                    <div class="AdminMassSelectionBody">
                        <div
                            id="AdminMassMutationSelection"
                            class="AdminPlantChecklist AdminMassChecklist"
                        ></div>

                        <div class="AdminEditorActions">
                            <button
                                id="AdminMassMutationSelectAll"
                                class="ActionButton AdminInlineButton"
                                type="button"
                            >
                                Select all
                            </button>

                            <button
                                id="AdminMassMutationClear"
                                class="ActionButton AdminInlineButton"
                                type="button"
                            >
                                Clear selection
                            </button>
                        </div>
                    </div>
                </section>

                <form
                    id="AdminMassMutationForm"
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
                                <input id="AdminMassMutationName" type="text" maxlength="128">
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Description">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Description</span>
                                <textarea id="AdminMassMutationDescription" rows="4"></textarea>
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Hint">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Hint</span>
                                <textarea id="AdminMassMutationHint" rows="3"></textarea>
                            </label>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Priority">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Priority</span>
                                <input id="AdminMassMutationPriority" type="number" step="1" value="0">
                            </label>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Chance">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Chance (%)</span>
                                <input id="AdminMassMutationChance" type="number" min="0" max="100" step="0.01" value="100">
                            </label>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Cooldown">
                                <span>Apply</span>
                            </label>
                            <div class="AdminEditorField">
                                <span>Cooldown</span>
                                <div class="AdminDurationInputs">
                                    <label>
                                        <span>Hours</span>
                                        <input id="AdminMassMutationCooldownHours" type="number" min="0" step="1" value="0">
                                    </label>
                                    <label>
                                        <span>Minutes</span>
                                        <input id="AdminMassMutationCooldownMinutes" type="number" min="0" max="59" step="1" value="0">
                                    </label>
                                    <label>
                                        <span>Seconds</span>
                                        <input id="AdminMassMutationCooldownSeconds" type="number" min="0" max="59" step="1" value="0">
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Rotation">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Rotation</span>
                                <select id="AdminMassMutationRotation">
                                    <option value="None">None</option>
                                    <option value="Any">Any</option>
                                </select>
                            </label>
                        </div>

                        <div class="AdminMassField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="AllowImmature">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Allow immature plants</span>
                                <select id="AdminMassMutationAllowImmature">
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Pattern">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Pattern JSON</span>
                                <textarea id="AdminMassMutationPattern" rows="7" spellcheck="false">[["Any"]]</textarea>
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Success">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Success result JSON</span>
                                <textarea id="AdminMassMutationSuccess" rows="7" spellcheck="false">[["Keep"]]</textarea>
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="Failure">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Failure result JSON</span>
                                <textarea id="AdminMassMutationFailure" rows="7" spellcheck="false">"Keep"</textarea>
                                <small>Use "Keep", "Clear", or a result matrix.</small>
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="PlantsUsed">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Plants used</span>
                                <input id="AdminMassMutationPlantsUsed" type="text" placeholder="RedRose, BlueRose">
                                <small>Comma-separated Plant Keys.</small>
                            </label>
                        </div>

                        <div class="AdminMassField AdminEditorWideField">
                            <label class="AdminEditorCheckField AdminMassApplyField">
                                <input type="checkbox" data-admin-mass-apply="PlantsCreated">
                                <span>Apply</span>
                            </label>
                            <label class="AdminEditorField">
                                <span>Plants created</span>
                                <input id="AdminMassMutationPlantsCreated" type="text" placeholder="PurpleRose">
                                <small>Comma-separated Plant Keys.</small>
                            </label>
                        </div>
                    </div>

                    <div class="AdminEditorActions">
                        <button
                            id="AdminMassMutationSaveButton"
                            class="ActionButton AdminSaveButton"
                            type="submit"
                        >
                            Save marked mutations
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
                    id="AdminMassMutationMessage"
                    class="PageMessage"
                    aria-live="polite"
                ></p>
            </div>
        </main>

        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/AdminValidation.js"></script>
        <script src="/Scripts/Garden/AdminMassMutationEditor.js"></script>
    </body>
</html>
