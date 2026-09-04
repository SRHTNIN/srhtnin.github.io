<?php

$NavbarPages = [
    "Home" => [
        "Href" => "/",
        "Icon" => "Home.png"
    ],
    "Sarahtonin" => [
        "Href" => "/Pages/Sarahtonin.html",
        "Icon" => "Sarahtonin.png"
    ],
    "Garden" => [
        "Href" => "/Pages/Garden.html",
        "Icon" => "Garden.png"
    ],
    "Shop" => [
        "Href" => "/Pages/Shop.html",
        "Icon" => "Shop.png"
    ],
    "Plants" => [
        "Href" => "/Pages/Plants.html",
        "Icon" => "Plants.png"
    ],
    "Mutations" => [
        "Href" => "/Pages/Mutations.html",
        "Icon" => "Mutations.png"
    ],
    "Guide" => [
        "Href" => "/Pages/Guide.html",
        "Icon" => "Guide.png"
    ],
    "Profile" => [
        "Href" => "/Pages/Profile.html",
        "Icon" => "Profile.png"
    ],
    "Social" => [
        "Href" => "/Pages/Social.html",
        "Icon" => "Social.png"
    ]
];

?>

<nav class="Navbar" aria-label="Main navigation">
    <?php foreach ($NavbarPages as $NavbarPage => $NavbarData): ?>
        <a
            class="NavbarLink"
            href="<?= htmlspecialchars($NavbarData["Href"], ENT_QUOTES, "UTF-8") ?>"
            aria-label="<?= htmlspecialchars($NavbarPage, ENT_QUOTES, "UTF-8") ?>"
            title="<?= htmlspecialchars($NavbarPage, ENT_QUOTES, "UTF-8") ?>"
            <?= ($PageSection ?? $PageTitle ?? "") === $NavbarPage ? 'aria-current="page"' : "" ?>
        >
            <img
                class="NavbarIcon"
                src="/Assets/Img/<?= rawurlencode($NavbarData["Icon"]) ?>"
                alt=""
            >

            <span class="NavbarText">
                <?= htmlspecialchars($NavbarPage, ENT_QUOTES, "UTF-8") ?>
            </span>
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

        <span class="NavbarText">
            Admin
        </span>
    </a>
</nav>

<script
    src="/Scripts/Garden/AdminAccess.js"
    defer
></script>
