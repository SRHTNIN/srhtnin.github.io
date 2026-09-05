<?php

$PageTitle = "Profile";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Profile</h1>

            <p>
                Manage your Garden profile, view your
                statistics, and move your account between
                devices.
            </p>


            <section
                id="Player"
                class="Panel ProfileSection"
            >
                <h2 class="PanelHeader PanelHeaderInset">Player</h2>

                <form id="ProfileUsernameForm">
                    <label
                        for="ProfileUsernameInput"
                    >
                        Username
                    </label>

                    <div class="ProfileFormRow">
                        <input
                            id="ProfileUsernameInput"
                            type="text"
                            minlength="3"
                            maxlength="24"
                            autocomplete="username"
                            placeholder="Username"
                            required
                        >

                        <button type="submit">
                            Save username
                        </button>
                    </div>

                    <p
                        id="ProfileUsernameMessage"
                        class="ProfileMessage"
                    ></p>
                </form>

                <form id="ProfileColourForm">
                    <label
                        for="ProfileColourInput"
                    >
                        Colour
                    </label>

                    <div class="ProfileFormRow">
                        <input
                            id="ProfileColourInput"
                            class="ProfileColourInput"
                            type="color"
                            value="#000000"
                        >

                        <strong
                            id="ProfileColourPreview"
                            class="ProfileColourPreview"
                        >
                            Preview
                        </strong>

                        <button type="submit">
                            Save colour
                        </button>

                        <button
                            id="ResetProfileColourButton"
                            type="button"
                        >
                            Reset
                        </button>
                    </div>

                    <p
                        id="ProfileColourMessage"
                        class="ProfileMessage"
                    ></p>
                </form>
            </section>

            <section
                id="GardenDisplay"
                class="Panel ProfileSection"
            >
                <h2 class="PanelHeader PanelHeaderInset">Garden display</h2>

                <h3>Tool selection</h3>

                <p>
                    Choose which Garden actions automatically change
                    your selected seed or tool.
                </p>

                <div class="ProfileButtonRow">
                    <button
                        id="ToggleSelectQuickBoughtPlantButton"
                        type="button"
                    >
                        Select bought plant when you quick-buy one: On
                    </button>

                    <button
                        id="ToggleSelectTrowelWithInventoryPlantButton"
                        type="button"
                    >
                        Select trowel when you select an inventory plant: On
                    </button>
                </div>

                <h3>Plant information</h3>

                <p>
                    Choose which Plant information details are
                    shown on Garden plots.
                </p>

                <div class="ProfileButtonRow">
                    <button
                        id="TogglePlantNamesButton"
                        type="button"
                    >
                        Plant names: Locked
                    </button>

                    <button
                        id="ToggleGrowthTimersButton"
                        type="button"
                    >
                        Growth timers: Locked
                    </button>
                </div>

                <p
                    id="GardenDisplayMessage"
                    class="ProfileMessage"
                >
                    Unlock Plant information in the Shop
                    to use these settings.
                </p>

                <h3>Garden overview</h3>

                <p>
                    Choose which Garden overview lines are
                    shown in the Garden status box.
                </p>

                <div class="ProfileButtonRow">
                    <button
                        id="ToggleNextHarvestButton"
                        type="button"
                    >
                        Next harvest: Locked
                    </button>

                    <button
                        id="ToggleGardenSizeButton"
                        type="button"
                    >
                        Garden size: Locked
                    </button>

                    <button
                        id="ToggleEmptyPlotsButton"
                        type="button"
                    >
                        Empty plots: Locked
                    </button>

                    <button
                        id="TogglePlantedPlotsButton"
                        type="button"
                    >
                        Planted plots: Locked
                    </button>

                    <button
                        id="ToggleGrowingPlotsButton"
                        type="button"
                    >
                        Growing: Locked
                    </button>

                    <button
                        id="ToggleReadyPlotsButton"
                        type="button"
                    >
                        Ready to harvest: Locked
                    </button>
                </div>

                <p
                    id="GardenOverviewDisplayMessage"
                    class="ProfileMessage"
                >
                    Unlock Garden overview in the Shop
                    to use these settings.
                </p>
            </section>

            <section
                id="Statistics"
                class="Panel ProfileSection"
            >
                <h3 class="PanelHeader PanelHeaderInset">Statistics</h3>

                <div class="ProfileStatistics">
                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">
                            Current Dew
                        </span>

                        <strong id="ProfileCurrentDew">
                            ...
                        </strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">
                            Lifetime Dew
                        </span>

                        <strong id="ProfileLifetimeDew">
                            ...
                        </strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">
                            Plants discovered
                        </span>

                        <strong id="ProfilePlantsDiscovered">
                            ...
                        </strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">
                            Mutations discovered
                        </span>

                        <strong id="ProfileMutationsDiscovered">
                            ...
                        </strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">
                            Garden size
                        </span>

                        <strong id="ProfileGardenSize">
                            ...
                        </strong>
                    </div>
                </div>
            </section>


            <section
                id="Account"
                class="Panel ProfileSection"
            >
                <h2 class="PanelHeader PanelHeaderInset">Account</h2>

                <p>
                    Your Account Key is the secret key used
                    to identify your Garden account.
                </p>

                <p>
                    You can use the same Account Key on
                    another device to access the same
                    username, save, and leaderboard entry.
                </p>

                <p>
                    <strong>
                        Anyone with your Account Key can
                        access your Garden account.
                    </strong>
                    Keep it private and treat it like a
                    password.
                </p>


                <details class="AccountKeySpoiler">
                    <summary>
                        Show Account Key
                    </summary>

                    <div class="AccountKeyContent">
                        <p>
                            Do not share this key with
                            anyone you do not trust.
                        </p>

                        <code id="AccountKeyDisplay">
                            Loading...
                        </code>

                        <div class="ProfileButtonRow">
                            <button
                                id="CopyAccountKeyButton"
                                type="button"
                            >
                                Copy Account Key
                            </button>

                            <button
                                id="ExportAccountKeyButton"
                                type="button"
                            >
                                Export Account Key
                            </button>
                        </div>

                        <p
                            id="AccountKeyMessage"
                            class="ProfileMessage"
                        ></p>
                    </div>
                </details>


                <h3>Account data</h3>

                <p>
                    Download a JSON copy of the Garden account
                    data currently stored on the server. The
                    Account Key is not included in this export.
                </p>

                <div class="ProfileButtonRow">
                    <button
                        id="ExportAccountDataButton"
                        type="button"
                    >
                        Export account data
                    </button>
                </div>


                <h3>Delete account</h3>

                <p class="ProfileDangerText">
                    Permanently delete this Garden account from
                    the server and clear its Account Key and save
                    from this browser. This cannot be undone.
                </p>

                <div class="ProfileButtonRow">
                    <button
                        id="DeleteAccountButton"
                        class="ProfileDangerButton"
                        type="button"
                    >
                        Delete account
                    </button>
                </div>

                <p
                    id="AccountDataMessage"
                    class="ProfileMessage"
                ></p>
            </section>


            <section
                id="Import"
                class="Panel ProfileSection"
            >
                <h3 class="PanelHeader PanelHeaderInset">Import Account</h3>

                <p>
                    To use an existing Garden account on
                    this device, paste its Account Key
                    below.
                </p>

                <p>
                    Importing an Account Key will replace
                    the account currently used by this
                    browser. It will not delete the old
                    account or its server save.
                </p>

                <form id="ImportAccountForm">
                    <label
                        for="ImportAccountKeyInput"
                    >
                        Account Key
                    </label>

                    <textarea
                        id="ImportAccountKeyInput"
                        rows="3"
                        spellcheck="false"
                        autocomplete="off"
                        placeholder="Paste Account Key here"
                        required
                    ></textarea>

                    <div class="ProfileButtonRow">
                        <button type="submit">
                            Import Account
                        </button>

                        <button
                            id="ImportAccountKeyFileButton"
                            type="button"
                        >
                            Import From File
                        </button>
                    </div>

                    <input
                        id="ImportAccountKeyFile"
                        type="file"
                        accept=".txt,text/plain"
                        hidden
                    >

                    <p
                        id="ImportAccountMessage"
                        class="ProfileMessage"
                    ></p>
                </form>
            </section>
        </main>


        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Upgrades.js"></script>
        <script src="/Scripts/Garden/Users.js"></script>
        <script src="/Scripts/Garden/Profile.js"></script>
        <script src="/Scripts/Garden/Account.js"></script>
    </body>
</html>
