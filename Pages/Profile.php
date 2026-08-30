<?php

$PageTitle = "Profile";

$SubNavbarItems = [
    "Player" => "#Player",
    "Statistics" => "#Statistics",
    "Account" => "#Account",
    "Import" => "#Import"
];

$SubNavbarCurrent = "Player";

?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>
        <?php require __DIR__ . "/Bits/SubNavbar.php"; ?>

        <main class="MainContainer">
            <h1>Profile</h1>

            <p>
                Manage your Garden profile, view your
                statistics, and move your account between
                devices.
            </p>


            <section
                id="Player"
                class="ProfileSection"
            >
                <h2>Player</h2>

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
            </section>


            <section
                id="Statistics"
                class="ProfileSection"
            >
                <h3>Statistics</h3>

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
                class="ProfileSection"
            >
                <h2>Account</h2>

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
            </section>


            <section
                id="Import"
                class="ProfileSection"
            >
                <h3>Import Account</h3>

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


        <script src="/Scripts/SubNavbar.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Users.js"></script>
        <script src="/Scripts/Garden/Profile.js"></script>
        <script src="/Scripts/Garden/Account.js"></script>
    </body>
</html>
