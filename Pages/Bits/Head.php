<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        <?= htmlspecialchars(
            "SG/" . ($PageTitle ?? "Home"),
            ENT_QUOTES,
            "UTF-8"
        ) ?>
    </title>

    <link
        rel="stylesheet"
        href="<?= $RootPath ?>Styles/Style.css"
    >
</head>
