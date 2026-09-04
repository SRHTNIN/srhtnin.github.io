<?php

$PageTitle = "Guide";
$PageSection = "Guide";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Garden guide</h1>

            <p>
                A quick guide to growing plants, earning Dew,
                and discovering mutations. You do not need to
                know everything here before you start playing.
                (But it's useful to do..)
            </p>

            <section
                id="GettingStarted"
                class="GuideSection"
            >
                <h2>Getting started</h2>

                <p>
                    A new Garden starts with a Red Rose seed and
                    some Dew. The <a href="/Pages/Shop.html">Shop</a>
                    stocks seeds you can buy to start gardening and
                    making some Dew.
                </p>

                <p>
                    Seeds are consumable. Planting one removes it
                    from your inventory, so you need to buy
                    another if you want to grow the same plant again.
                    ..So just buy multiple at once.
                </p>
            </section>

            <section
                id="Planting"
                class="GuideSection"
            >
                <h2>Planting and growing</h2>

                <p>
                    In the <a href="/Pages/Garden.html">Garden</a>,
                    select a seed and then choose an empty plot.
                    Plants continue growing with real time, even while
                    you are away from the page.
                </p>

                <p>
                    Plant sprites change as they grow. When the final
                    growth sprite appears, the plant is mature and can
                    be harvested. The Garden also shows when your next
                    plant will be ready. Don't worry: it'll also have
                    a green border around it when it's ready to harvest.
                </p>
            </section>

            <section
                id="Harvesting"
                class="GuideSection"
            >
                <h3>Harvesting</h3>

                <p>
                    Click a mature plant to harvest it. Harvesting gives
                    you Dew and makes the plot empty again, as it once was.
                </p>

                <p>
                    More valuable seeds usually give more Dew.
                    The Shop shows the current seed cost,
                    harvest reward, growth time, and how many seeds you
                    already own. So you can be smart in your plant investments!
                </p>
            </section>

            <section
                id="Shop"
                class="GuideSection"
            >
                <h2>The Shop</h2>

                <p>
                    Some basic plants can be bought from the beginning.
                    Plants created through mutations become purchasable
                    in the shop after you discover them.
                </p>

                <p>
                    Mutation-derived seed prices are based on their
                    recipes, so discovering and performing mutations is
                    often a useful alternative to simply buying the
                    resulting seed.
                </p>
            </section>

            <section
                id="Mutations"
                class="GuideSection"
            >
                <h2>Mutations</h2>

                <p>
                    Most plants can create new plants or change when they are
                    arranged in a particular pattern. Unless a mutation
                    says otherwise, the plants involved need to be
                    mature before the recipe can work.
                </p>

                <p>
                    As soon as a valid recipe exists, the Garden tries
                    the mutation. Some mutations are guaranteed, but
                    others may only have a chance to succeed. A failed
                    attempt may need to wait for its cooldown before
                    that same area can try mutating again.
                </p>

                <div class="GuideTip">
                    <strong>
                        Since you were good and actually read this...
                    </strong>

                    <p>
                        Try arranging mature plants like this:
                    </p>

                    <div
                        id="GuideMutationHint"
                        class="GuideRecipe"
                        aria-label="Red Rose, empty plot, Blue Rose"
                    >
                        <div
                            class="PlantTile GuideRecipeCell GuideRecipePlant"
                            data-plant-key="RedRose"
                        >
                            <span class="GuideRecipeLabel">
                                Red Rose
                            </span>
                        </div>

                        <div
                            class="PlantTile GuideRecipeCell GuideRecipeEmpty"
                        >
                            <span>Empty</span>
                        </div>

                        <div
                            class="PlantTile GuideRecipeCell GuideRecipePlant"
                            data-plant-key="BlueRose"
                        >
                            <span class="GuideRecipeLabel">
                                Blue Rose
                            </span>
                        </div>
                    </div>

                    <p class="GuideHintText">
                        "Empty" means the middle plot really does need
                        to be empty. What happens next is for you to
                        find out.
                    </p>
                </div>
            </section>

            <section
                id="Discoveries"
                class="GuideSection"
            >
                <h3>Discoveries</h3>

                <p>
                    Discovering a new plant or mutation is saved with
                    your Garden. New plant discoveries also unlock
                    additional seeds in the Shop, so you can skip
                    creating them through mutations. Though it always
                    costs more to buy the seeds than create them by mutation..
                </p>

                <p>
                    Experiment with different plants, empty spaces, and
                    arrangements. Not every recipe has to look like the
                    example above. Some are logical (Red + Blue = Purple),
                    while others are visual, or maybe don't make sense at all.
                </p>
            </section>

            <section
                id="Tools"
                class="GuideSection"
            >
                <h2>Tools</h2>

                <p>
                    The Shovel removes a planted crop without giving a
                    harvest reward. Select it, click the plant you want
                    to remove, and click the Shovel again when you want
                    to have no tool equipped. It's very useful when you
                    decide you want to try a new mutation, for example.
                </p>
            </section>

            <section
                id="Account"
                class="GuideSection"
            >
                <h2>Your account</h2>

                <p>
                    Your <a href="/Pages/Profile.html">Profile</a>
                    contains your username, colour, statistics, and
                    Account Key. Garden saves can sync through the API,
                    while the Account Key lets you use the same Garden
                    in another browser or on another device.
                    It's basically just like logging into an account.
                </p>

                <p>
                    Treat your Account Key like a password. Anyone who
                    has it can load the same Garden account and mess stuff up.
                </p>
            </section>

            <section
                id="Privacy"
                class="GuideSection"
            >
                <h2>Privacy and your data</h2>

                <p>
                    The Garden API stores the data needed to keep your
                    account synchronized, including your Garden save,
                    username, profile colour, Dew totals, and the time
                    the server save was last updated. The server identifies
                    the account using a one-way hash derived from your
                    Account Key rather than storing the Account Key itself.
                </p>

                <p>
                    This browser stores your Account Key and a local copy
                    of your Garden save so the same account can keep working
                    between visits. If you set a username, some profile
                    information and statistics can also appear on the
                    public leaderboard.
                </p>

                <p>
                    The <a href="/Pages/Profile.html#Account">Profile</a>
                    page lets you export a JSON copy of the account data
                    stored on the server, or permanently delete the account.
                    Deleting removes the server account and clears the
                    Account Key and local save from the browser where you
                    perform the deletion. Other devices have their own local
                    browser storage and cannot be cleared remotely.
                </p>
            </section>
        </main>

        <script src="/Scripts/Garden/PlantImages.js"></script>
        <script src="/Scripts/Garden/Plants.js"></script>
        <script src="/Scripts/Garden/Mutations.js"></script>
        <script src="/Scripts/Garden/Save.js"></script>
        <script src="/Scripts/Garden/Content.js"></script>
        <script src="/Scripts/Garden/Guide.js"></script>
    </body>
</html>
