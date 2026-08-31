<?php

$NavbarPages = [
    "Home" => "/",
    "Sarahtonin" => "/Pages/Sarahtonin.html",
    "Garden" => "/Pages/Garden.html",
    "Shop" => "/Pages/Shop.html",
    "Profile" => "/Pages/Profile.html"
];

?>

<nav class="Navbar" aria-label="Main navigation">
    <?php foreach ($NavbarPages as $NavbarPage => $NavbarHref): ?>
        <a
            class="NavbarLink"
            href="<?= htmlspecialchars($NavbarHref, ENT_QUOTES, "UTF-8") ?>"
            aria-label="<?= htmlspecialchars($NavbarPage, ENT_QUOTES, "UTF-8") ?>"
            title="<?= htmlspecialchars($NavbarPage, ENT_QUOTES, "UTF-8") ?>"
            <?= ($PageSection ?? $PageTitle ?? "") === $NavbarPage ? 'aria-current="page"' : "" ?>
        >
            <img
                class="NavbarIcon"
                src="/Assets/Img/<?= rawurlencode($NavbarPage) ?>.png"
                alt=""
            >
        </a>
    <?php endforeach; ?>
</nav>
