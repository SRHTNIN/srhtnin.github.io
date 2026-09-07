<?php

$PageTitle = "Social";
$PageSection = "Social";

?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Social</h1>

            <p>
                Find other gardeners, visit their public profiles,
                preview their Gardens, leave comments, and donate Dew
                when they allow it.
            </p>

            <section
                id="GardenerSearch"
                class="Panel SocialSection"
            >
                <h2 class="PanelHeader PanelHeaderInset">Find gardeners</h2>

                <form
                    id="GardenerSearchForm"
                    class="CatalogueControls"
                    role="search"
                >
                    <input
                        id="GardenerSearchInput"
                        type="search"
                        maxlength="64"
                        placeholder="Search usernames..."
                        aria-label="Search gardeners by username"
                        autocomplete="off"
                    >

                    <button
                        class="ActionButton"
                        type="submit"
                    >
                        Search
                    </button>
                </form>

                <div
                    id="GardenerSearchResults"
                    class="GardenerSearchResults"
                ></div>

                <p
                    id="GardenerSearchMessage"
                    class="PageMessage"
                    aria-live="polite"
                >
                    Search for a gardener by username.
                </p>
            </section>

            <section
                id="Leaderboard"
                class="Panel Leaderboard"
            >
                <h2 class="PanelHeader PanelHeaderInset">Leaderboard</h2>

                <div class="LeaderboardTableContainer">
                    <table class="LeaderboardTable">
                        <thead>
                            <tr>
                                <th class="LeaderboardRankColumn">
                                    #
                                </th>

                                <th>
                                    Gardener
                                </th>

                                <th class="LeaderboardDewColumn">
                                    Dew
                                </th>
                            </tr>
                        </thead>

                        <tbody id="LeaderboardBody"></tbody>
                    </table>
                </div>
            </section>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Users.js"></script>
        <script src="/Scripts/Garden/Leaderboard.js"></script>
        <script src="/Scripts/Garden/Social.js"></script>
    </body>
</html>
