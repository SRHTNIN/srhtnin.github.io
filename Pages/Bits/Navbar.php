<?php

$NavbarPages = [
    "Home" => "/",
    "Sarahtonin" => "/Pages/Sarahtonin.html",
    "Garden" => "/Pages/Garden.html",
    "Shop" => "/Pages/Shop.html",
    "Plants" => "/Pages/Plants.html",
    "Mutations" => "/Pages/Mutations.html",
    "Guide" => "/Pages/Guide.html",
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

    <a
        id="AdminNavbarLink"
        class="NavbarLink"
        href="/Pages/Admin.html"
        aria-label="Admin"
        title="Admin"
        <?= ($PageSection ?? $PageTitle ?? "") === "Admin" ? 'aria-current="page"' : "" ?>
        hidden
    >
        <img
            class="NavbarIcon"
            src="/Assets/Img/Icon.png"
            alt=""
        >
    </a>
</nav>

<script
    src="/Scripts/Garden/AdminAccess.js"
    defer
></script>
