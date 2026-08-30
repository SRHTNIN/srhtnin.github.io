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
        as $Name => $Url
    ): ?>
        <?php
        $Prefix =
            str_starts_with(
                $Url,
                "#"
            )
                ? "#"
                : ">";
        ?>

        <a
            class="SubNavbarLink"
            href="<?= htmlspecialchars(
                $Url,
                ENT_QUOTES,
                "UTF-8"
            ) ?>"
            <?php if (
                $SubNavbarCurrent ===
                $Name
            ): ?>
                aria-current="<?= str_starts_with(
                    $Url,
                    "#"
                )
                    ? "location"
                    : "page" ?>"
            <?php endif; ?>
        >
            <span
                class="SubNavbarPrefix"
                aria-hidden="true"
            >
                <?= htmlspecialchars(
                    $Prefix,
                    ENT_QUOTES,
                    "UTF-8"
                ) ?>
            </span>

            <?= htmlspecialchars(
                $Name,
                ENT_QUOTES,
                "UTF-8"
            ) ?>
        </a>
    <?php endforeach; ?>
</nav>
