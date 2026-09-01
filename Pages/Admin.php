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
                    Admin access verified. Garden content
                    editors will live here.
                </p>
            </div>
        </main>
    </body>
</html>
