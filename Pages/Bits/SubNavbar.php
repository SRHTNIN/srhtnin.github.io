<?php

$SubNavbarItems ??= [];

if (count($SubNavbarItems) === 0) {
    return;
}

$SubNavbarCurrent ??= null;

?>

<nav
    class="SubNavbar"
    aria-label="Secondary navigation"
>
    <?php foreach (
        $SubNavbarItems
        as $SubNavbarName => $SubNavbarHref
    ): ?>
        <a
            class="SubNavbarLink"
            href="<?= htmlspecialchars(
                $SubNavbarHref,
                ENT_QUOTES,
                "UTF-8"
            ) ?>"
            <?= $SubNavbarCurrent === $SubNavbarName
                ? 'aria-current="page"'
                : "" ?>
        >
            <?= htmlspecialchars(
                $SubNavbarName,
                ENT_QUOTES,
                "UTF-8"
            ) ?>
        </a>
    <?php endforeach; ?>
</nav>
