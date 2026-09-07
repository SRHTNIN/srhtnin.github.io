const GardenBorderColours = [
    "var(--Rosewater)",
    "var(--Flamingo)",
    "var(--Pink)",
    "var(--Mauve)",
    "var(--Red)",
    "var(--Maroon)",
    "var(--Peach)",
    "var(--Yellow)",
    "var(--Green)",
    "var(--Teal)",
    "var(--Sky)",
    "var(--Sapphire)",
    "var(--Blue)",
    "var(--Lavender)"
];

const GardenPlotDefaultRotation = "East";
const GardenPlotRotations = [
    "North",
    "East",
    "South",
    "West"
];
const GardenPlotRotationLabels = {
    North: "^",
    East: "->",
    South: "v",
    West: "<-"
};


function GetGardenBorderColour(
    GardenIndex
) {
    const ColourCount =
        GardenBorderColours.length;

    const NormalizedIndex =
        (
            Number(GardenIndex) %
            ColourCount +
            ColourCount
        ) % ColourCount;

    return GardenBorderColours[
        NormalizedIndex
    ];
}




function RenderGardenSelectorView(
    Options
) {
    const Gardens =
        Array.isArray(Options.Gardens)
            ? Options.Gardens
            : [];

    const GardenIndex =
        Number(Options.GardenIndex) || 0;

    const PreviousButton =
        Options.PreviousButton ?? null;

    const NextButton =
        Options.NextButton ?? null;

    const NameInput =
        Options.NameInput ?? null;

    if (
        PreviousButton === null ||
        NextButton === null ||
        NameInput === null ||
        Gardens.length === 0
    ) {
        return;
    }

    const HasPreviousGarden =
        GardenIndex > 0;

    const HasNextGarden =
        GardenIndex <
        Gardens.length - 1;

    PreviousButton.disabled =
        !HasPreviousGarden;

    NextButton.disabled =
        !HasNextGarden;


    PreviousButton.style.setProperty(
        "--GardenSelectorBorderColour",
        HasPreviousGarden
            ? GetGardenBorderColour(
                GardenIndex - 1
            )
            : "var(--Surface2)"
    );

    NameInput.style.setProperty(
        "--GardenSelectorBorderColour",
        GetGardenBorderColour(
            GardenIndex
        )
    );

    NextButton.style.setProperty(
        "--GardenSelectorBorderColour",
        HasNextGarden
            ? GetGardenBorderColour(
                GardenIndex + 1
            )
            : "var(--Surface2)"
    );


    PreviousButton.setAttribute(
        "aria-label",
        HasPreviousGarden
            ? "Previous Garden: " +
                Gardens[
                    GardenIndex - 1
                ].Name
            : "No previous Garden"
    );

    NextButton.setAttribute(
        "aria-label",
        HasNextGarden
            ? "Next Garden: " +
                Gardens[
                    GardenIndex + 1
                ].Name
            : "No next Garden"
    );


    if (
        Options.PreserveFocusedName !==
            true ||
        document.activeElement !==
            NameInput
    ) {
        NameInput.value =
            Gardens[GardenIndex]
                ?.Name ?? "Garden";
    }

    NameInput.title =
        "Garden " +
        (GardenIndex + 1) +
        " of " +
        Gardens.length;
}


function GetGardenPlotRotation(
    Plot
) {
    return GardenPlotRotations.includes(
        Plot?.Rotation
    )
        ? Plot.Rotation
        : GardenPlotDefaultRotation;
}


function GetGardenPlotRotationLabel(
    Plot
) {
    return GardenPlotRotationLabels[
        GetGardenPlotRotation(
            Plot
        )
    ] ?? "->";
}


function GetGardenPlotGrowthProgress(
    Plot,
    Plant,
    AtTime = Date.now()
) {
    const GrowthTime =
        Number(Plant?.GrowthTime ?? 0);

    if (GrowthTime <= 0) {
        return 1;
    }

    const PlantedAt =
        Number(Plot?.PlantedAt ?? 0);

    return Math.max(
        0,
        Math.min(
            (
                Number(AtTime) -
                PlantedAt
            ) /
            GrowthTime,
            1
        )
    );
}


function GetGardenPlotImageSources(
    Plot,
    Plant
) {
    const Direction =
        Plot !== null &&
        Plant?.DirectionalSprites === true
            ? GetGardenPlotRotation(
                Plot
            )
            : null;

    return GetPlantImageSources(
        Plant ?? Plot?.Plant,
        Direction
    );
}


function GetGardenPlotImage(
    Plot,
    Plant,
    Progress
) {
    const Images =
        GetGardenPlotImageSources(
            Plot,
            Plant
        );

    if (Images.length === 0) {
        return null;
    }

    if (Images.length === 1) {
        return Images[0] ?? null;
    }

    if (Progress >= 1) {
        return Images[
            Images.length - 1
        ] ?? null;
    }

    const GrowingImageCount =
        Images.length - 1;

    const ImageIndex = Math.min(
        Math.floor(
            Progress *
            GrowingImageCount
        ),
        GrowingImageCount - 1
    );

    return Images[
        ImageIndex
    ] ?? null;
}


function FormatGardenRemainingTime(
    Milliseconds
) {
    const TotalSeconds =
        Math.max(
            0,
            Math.ceil(
                Number(
                    Milliseconds
                ) / 1000
            )
        );

    const Hours = Math.floor(
        TotalSeconds / 3600
    );

    const Minutes = Math.floor(
        (TotalSeconds % 3600) / 60
    );

    const Seconds =
        TotalSeconds % 60;

    if (Hours > 0) {
        return (
            Hours +
            ":" +
            String(Minutes).padStart(
                2,
                "0"
            ) +
            ":" +
            String(Seconds).padStart(
                2,
                "0"
            )
        );
    }

    return (
        Minutes +
        ":" +
        String(Seconds).padStart(
            2,
            "0"
        )
    );
}


function GetGardenPlotTimerText(
    Plot,
    Plant,
    Progress,
    AtTime = Date.now(),
    CooldownState = null
) {
    if (
        Plot === null ||
        Plant === null ||
        Plant === undefined
    ) {
        return "";
    }

    if (
        Progress >= 1 &&
        CooldownState !== null
    ) {
        return FormatGardenRemainingTime(
            CooldownState.Remaining
        );
    }

    if (Progress >= 1) {
        return "Ready";
    }

    return FormatGardenRemainingTime(
        Math.max(
            0,
            Number(Plant.GrowthTime ?? 0) -
            (
                Number(AtTime) -
                Number(Plot.PlantedAt ?? 0)
            )
        )
    );
}


function CreateGardenPlotView(
    Options
) {
    const Plot =
        Options.Plot ?? null;

    const Plant =
        Options.Plant;

    const Progress =
        Number(
            Options.Progress ?? 0
        );

    const BorderProgress =
        Number(
            Options.BorderProgress ??
            Progress
        );

    const DisplaySettings =
        Options.DisplaySettings ?? {};

    const Tile =
        document.createElement(
            "div"
        );

    Tile.className =
        "PlantTile GardenPlot";

    if (Options.ReadOnly === true) {
        Tile.classList.add(
            "GardenPlotReadOnly"
        );
    }

    if (
        Options.FunctionalCooldown ===
        true
    ) {
        Tile.classList.add(
            "GardenPlotFunctionalCooldown"
        );
    }

    if (
        Options.Mature === true
    ) {
        Tile.classList.add(
            "GardenPlotMature"
        );
    }

    if (Plot === null) {
        Tile.classList.add(
            "GardenPlotEmpty"
        );
    } else if (
        Plant !== null &&
        Plant !== undefined
    ) {
        Tile.style.setProperty(
            "--GrowthProgress",
            `${BorderProgress * 100}%`
        );
    }

    const MainButton =
        document.createElement(
            "button"
        );

    MainButton.className =
        "GardenPlotMain";
    MainButton.type = "button";
    MainButton.disabled =
        Options.ReadOnly === true;

    if (
        DisplaySettings.ShowPlantNames
    ) {
        Tile.classList.add(
            "GardenPlotWithName"
        );

        MainButton.appendChild(
            CreateGardenPlotName(
                Plot,
                Plant
            )
        );
    }

    const Visual =
        document.createElement(
            "span"
        );

    Visual.className =
        "GardenPlotVisual";

    if (
        Plot !== null &&
        Plant === undefined
    ) {
        Visual.textContent = "?";
    } else if (
        Plot !== null &&
        Plant !== null
    ) {
        const ImagePath =
            Options.ImagePath ?? null;

        if (ImagePath !== null) {
            const Image =
                document.createElement(
                    "img"
                );

            Image.className =
                "PlantSprite";
            Image.alt =
                Plant.Name ?? "";
            Image.src =
                ImagePath;
            Image.draggable = false;

            Visual.appendChild(
                Image
            );
        } else {
            const MissingImage =
                document.createElement(
                    "span"
                );

            MissingImage.className =
                "GardenPlantMissing";
            MissingImage.textContent =
                Plant.Name ?? "Unknown";

            Visual.appendChild(
                MissingImage
            );
        }
    }

    MainButton.appendChild(
        Visual
    );

    Tile.appendChild(
        MainButton
    );

    AppendGardenPlotFooter(
        Tile,
        Plot,
        Plant,
        DisplaySettings,
        Options.TimerText ?? "",
        Options.ShowRotation === true,
        Options.OnRotate,
        Options.ReadOnly === true
    );

    return {
        Tile,
        MainButton,
        Visual
    };
}


function AppendGardenPlotFooter(
    Tile,
    Plot,
    Plant,
    DisplaySettings,
    TimerText,
    ShowRotation,
    OnRotate,
    ReadOnly
) {
    const ShowTimer =
        DisplaySettings.ShowGrowthTimers ===
        true;

    if (
        !ShowTimer &&
        !ShowRotation
    ) {
        return;
    }

    Tile.classList.add(
        "GardenPlotWithFooter"
    );

    const Footer =
        document.createElement(
            "span"
        );

    Footer.className =
        "GardenPlotFooter";

    if (
        ShowTimer &&
        ShowRotation
    ) {
        Footer.classList.add(
            "GardenPlotFooterSplit"
        );
    }

    if (ShowTimer) {
        const Timer =
            document.createElement(
                "span"
            );

        Timer.className =
            "GardenPlotTimer";
        Timer.textContent =
            TimerText;

        Footer.appendChild(
            Timer
        );
    }

    if (ShowRotation) {
        const RotateButton =
            document.createElement(
                "button"
            );

        RotateButton.className =
            "GardenPlotRotationButton";
        RotateButton.type = "button";
        RotateButton.textContent =
            GetGardenPlotRotationLabel(
                Plot
            );
        RotateButton.title =
            ReadOnly
                ? "Plot rotation"
                : "Rotate plot clockwise";
        RotateButton.setAttribute(
            "aria-label",
            ReadOnly
                ? (
                    Plant?.Name ?? "Plot"
                ) +
                    " faces " +
                    GetGardenPlotRotation(
                        Plot
                    ).toLowerCase()
                : "Rotate " +
                    (Plant?.Name ?? "plot") +
                    " clockwise"
        );
        RotateButton.disabled =
            ReadOnly;

        if (
            !ReadOnly &&
            typeof OnRotate ===
                "function"
        ) {
            RotateButton.addEventListener(
                "click",
                OnRotate
            );
        }

        Footer.appendChild(
            RotateButton
        );
    }

    Tile.appendChild(
        Footer
    );
}


function CreateGardenPlotName(
    Plot,
    Plant
) {
    const Name =
        document.createElement(
            "span"
        );

    Name.className =
        "GardenPlotName";

    if (Plot === null) {
        Name.textContent =
            "Empty";
    } else if (Plant === undefined) {
        Name.textContent =
            "Unknown";
    } else {
        Name.textContent =
            Plant.Name;

        Name.title =
            Plant.Name;
    }

    return Name;
}
