<?php

$PageTitle = "Gardener";
$PageSection = "Social";

?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <p class="GardenerBackLink">
                <a href="/Pages/Social.html">Back to Social</a>
            </p>

            <div class="GardenerHero">
                <div id="GardenerAvatar"></div>

                <div class="GardenerHeroText">
                    <h1 id="GardenerName">Gardener</h1>

                    <p id="GardenerDescription">
                        Loading gardener...
                    </p>
                </div>
            </div>

            <p
                id="GardenerPageMessage"
                class="PageMessage"
                aria-live="polite"
            >
                Loading gardener...
            </p>

            <section
                id="GardenerStatsSection"
                class="Panel SocialSection"
                hidden
            >
                <h2 class="PanelHeader PanelHeaderInset">Statistics</h2>

                <div class="ProfileStatistics">
                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">Current Dew</span>
                        <strong id="GardenerCurrentDew">0</strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">Lifetime Dew</span>
                        <strong id="GardenerLifetimeDew">0</strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">Plants discovered</span>
                        <strong id="GardenerPlantsDiscovered">0</strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">Mutations discovered</span>
                        <strong id="GardenerMutationsDiscovered">0</strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">Gardens owned</span>
                        <strong id="GardenerGardensOwned">0</strong>
                    </div>

                    <div class="ProfileStatistic">
                        <span class="ProfileStatisticName">Active Garden size</span>
                        <strong id="GardenerActiveGardenSize">0×0</strong>
                    </div>
                </div>

                <p
                    id="GardenerStatsPrivateMessage"
                    class="ProfileMessage"
                    hidden
                ></p>
            </section>

            <section
                id="GardenerGardensSection"
                class="Panel SocialSection"
                hidden
            >
                <div class="PanelHeader PanelHeaderInset GardenerSectionHeader">
                    <h2>Gardens</h2>
                    <span id="GardenerGardenPosition"></span>
                </div>

                <div
                    id="GardenerGardenControls"
                    class="GardenerGardenControls"
                >
                    <button
                        id="PreviousGardenerGardenButton"
                        class="ActionButton"
                        type="button"
                    >
                        Previous
                    </button>

                    <div class="GardenerGardenTitle">
                        <strong id="GardenerGardenName">Garden</strong>
                        <span id="GardenerGardenSize">0×0</span>
                    </div>

                    <button
                        id="NextGardenerGardenButton"
                        class="ActionButton"
                        type="button"
                    >
                        Next
                    </button>
                </div>

                <div class="GardenGridViewport">
                    <div
                        id="GardenerGardenGrid"
                        class="GardenGrid GardenerGardenGrid"
                    ></div>
                </div>

                <p
                    id="GardenerGardensMessage"
                    class="ProfileMessage"
                ></p>
            </section>

            <section
                id="GardenerDonationSection"
                class="Panel SocialSection InteractivePanel"
                hidden
            >
                <h2 class="PanelHeader PanelHeaderInset">Dew donation</h2>

                <p id="GardenerDonationBalance"></p>

                <form
                    id="GardenerDonationForm"
                    class="FormRow"
                >
                    <input
                        id="GardenerDonationAmount"
                        type="number"
                        min="1"
                        step="1"
                        inputmode="numeric"
                        placeholder="Dew amount"
                        required
                    >

                    <button type="submit">
                        Donate Dew
                    </button>
                </form>

                <p
                    id="GardenerDonationMessage"
                    class="ProfileMessage"
                    aria-live="polite"
                ></p>
            </section>

            <section
                id="GardenerCommentsSection"
                class="Panel SocialSection InteractivePanel"
                hidden
            >
                <h2 class="PanelHeader PanelHeaderInset">Comments</h2>

                <form id="GardenerCommentForm">
                    <label for="GardenerCommentInput">
                        Leave a comment
                    </label>

                    <textarea
                        id="GardenerCommentInput"
                        rows="3"
                        maxlength="1000"
                        placeholder="Write a comment..."
                        required
                    ></textarea>

                    <div class="FormRow">
                        <button type="submit">
                            Leave comment
                        </button>
                    </div>
                </form>

                <p
                    id="GardenerCommentMessage"
                    class="ProfileMessage"
                    aria-live="polite"
                ></p>

                <div
                    id="GardenerCommentList"
                    class="GardenerCommentList"
                ></div>

                <button
                    id="LoadMoreGardenerCommentsButton"
                    class="ActionButton GardenerLoadMoreButton"
                    type="button"
                    hidden
                >
                    Load more comments
                </button>
            </section>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Users.js"></script>
        <script src="/Scripts/Garden/Gardener.js"></script>
    </body>
</html>
