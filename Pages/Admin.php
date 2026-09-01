<?php

$PageTitle = "Admin";
$PageSection = "Admin";


?>

<!DOCTYPE html>

<html lang="en" data-palette="CatppuccinMocha">
    <?php require __DIR__ . "/Bits/Head.php"; ?>

    <body>
        <?php require __DIR__ . "/Bits/Navbar.php"; ?>

        <main class="MainContainer">
            <h1>Admin</h1>

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
                <p>
                    Content tools for editing the Garden catalogue.
                    Changes here affect the live game data.
                </p>

                <div class="AdminEditorNavigation">
                    <a
                        class="ActionButton AdminEditorLink"
                        href="/Pages/AdminPlants.html"
                    >
                        <strong>Plant editor</strong>
                        <span>
                            Add plants and edit their catalogue data.
                        </span>
                    </a>

                    <a
                        class="ActionButton AdminEditorLink"
                        href="/Pages/AdminMutations.html"
                    >
                        <strong>Mutation editor</strong>
                        <span>
                            Build mutation recipes with a visual grid.
                        </span>
                    </a>
                </div>
            </div>
        </main>
    </body>
</html>
