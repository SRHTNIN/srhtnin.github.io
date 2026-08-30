let GameSave;
let SelectedSeed = "Rose";

const GardenUpdateInterval = 1000;


async function StartGame() {
    GameSave = await LoadGame();
    NormalizeSave();

    RenderGame();

    setInterval(
        RenderGarden,
        GardenUpdateInterval
    );
    await RenderUser();
    await RenderLeaderboard();
}


function NormalizeSave() {
    GameSave.Currency ??= {};
    GameSave.Currency.Dew ??= 0;

    GameSave.Seeds ??= {};
    GameSave.Seeds.Unlocked ??= [
        "Rose"
    ];

    GameSave.Statistics ??= {};
    GameSave.Statistics.CurrencyEarned ??= {};

    GameSave.Statistics.CurrencyEarned.Dew ??=
        GameSave.Currency.Dew;

    GameSave.Garden ??= {
        Width: 3,
        Height: 3,
        Plots: []
    };

    const RequiredPlots =
        GameSave.Garden.Width *
        GameSave.Garden.Height;

    while (
        GameSave.Garden.Plots.length <
        RequiredPlots
    ) {
        GameSave.Garden.Plots.push(null);
    }
}


function RenderGame() {
    RenderCurrency();
    RenderSeeds();
    RenderGarden();
}


function RenderCurrency() {
    const DewAmount =
        document.getElementById(
            "DewAmount"
        );

    DewAmount.textContent =
        GameSave.Currency.Dew;
}


function RenderSeeds() {
    const SeedList =
        document.getElementById(
            "SeedList"
        );

    SeedList.replaceChildren();

    for (
        const PlantId
        of GameSave.Seeds.Unlocked
    ) {
        const Plant =
            Plants[PlantId];

        if (Plant === undefined) {
            continue;
        }

        const Button =
            document.createElement(
                "button"
            );

        Button.className =
            "SeedButton";

        Button.type = "button";

        Button.textContent =
            Plant.Name;

        if (
            PlantId ===
            SelectedSeed
        ) {
            Button.setAttribute(
                "aria-current",
                "true"
            );
        }

        Button.addEventListener(
            "click",
            () => {
                SelectedSeed =
                    PlantId;

                RenderSeeds();

                SetGardenMessage(
                    "Selected " +
                    Plant.Name +
                    "."
                );
            }
        );

        SeedList.appendChild(
            Button
        );
    }
}


function RenderGarden() {
    const GardenGrid =
        document.getElementById(
            "GardenGrid"
        );

    GardenGrid.style.setProperty(
        "--GardenWidth",
        GameSave.Garden.Width
    );

    GardenGrid.replaceChildren();

    GameSave.Garden.Plots.forEach(
        (Plot, PlotIndex) => {
            const PlotElement =
                CreatePlotElement(
                    Plot,
                    PlotIndex
                );

            GardenGrid.appendChild(
                PlotElement
            );
        }
    );
}


function CreatePlotElement(
    Plot,
    PlotIndex
) {
    const Button =
        document.createElement(
            "button"
        );

    Button.className =
        "GardenPlot";

    Button.type = "button";


    /*
     * Empty plot.
     */

    if (Plot === null) {
        Button.classList.add(
            "GardenPlotEmpty"
        );

        Button.title =
            "Empty plot";

        Button.addEventListener(
            "click",
            () => {
                PlantSeed(
                    PlotIndex
                );
            }
        );

        return Button;
    }


    const Plant =
        Plants[Plot.Plant];

    if (Plant === undefined) {
        Button.textContent = "?";

        return Button;
    }


    /*
     * Plant image.
     */

    const ImagePath =
        GetPlantImage(
            Plot,
            Plant
        );

    if (ImagePath !== null) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "GardenPlant";

        Image.alt =
            Plant.Name;

        Image.src =
            ImagePath;

        Button.appendChild(
            Image
        );
    }


    /*
     * Mature plants can be harvested.
     */

    if (
        IsPlantMature(
            Plot,
            Plant
        )
    ) {
        Button.classList.add(
            "GardenPlotMature"
        );

        Button.title =
            "Harvest " +
            Plant.Name;

        Button.addEventListener(
            "click",
            () => {
                HarvestPlant(
                    PlotIndex
                );
            }
        );
    } else {
        const Progress =
            GetPlantGrowthProgress(
                Plot,
                Plant
            );

        Button.title =
            Plant.Name +
            " - " +
            Math.floor(
                Progress * 100
            ) +
            "% grown";
    }

    return Button;
}


async function PlantSeed(
    PlotIndex
) {
    if (
        GameSave.Garden.Plots[
            PlotIndex
        ] !== null
    ) {
        return;
    }

    if (
        !GameSave.Seeds.Unlocked
            .includes(
                SelectedSeed
            )
    ) {
        return;
    }

    GameSave.Garden.Plots[
        PlotIndex
    ] = {
        Plant: SelectedSeed,

        AddedTags: [],

        VisualVariant: null,

        PlantedAt: Date.now()
    };

    SetGardenMessage(
        "Planted " +
        Plants[SelectedSeed].Name +
        "."
    );

    RenderGarden();

    await SaveGame(
        GameSave
    );
}


async function HarvestPlant(
    PlotIndex
) {
    const Plot =
        GameSave.Garden.Plots[
            PlotIndex
        ];

    if (Plot === null) {
        return;
    }

    const Plant =
        Plants[Plot.Plant];

    if (
        !IsPlantMature(
            Plot,
            Plant
        )
    ) {
        return;
    }

    GiveReward(
        Plant.Reward
    );

    GameSave.Garden.Plots[
        PlotIndex
    ] = null;

    SetGardenMessage(
        "Harvested " +
        Plant.Name +
        " for " +
        Plant.Reward.Amount +
        " " +
        Plant.Reward.Currency +
        "."
    );

    RenderGame();

    await SaveGame(
        GameSave
    );
}


function GiveReward(
    Reward
) {
    GameSave.Currency[
        Reward.Currency
    ] ??= 0;

    GameSave.Currency[
        Reward.Currency
    ] += Reward.Amount;


    GameSave.Statistics ??= {};
    GameSave.Statistics.CurrencyEarned ??= {};

    GameSave.Statistics.CurrencyEarned[
        Reward.Currency
    ] ??= 0;

    GameSave.Statistics.CurrencyEarned[
        Reward.Currency
    ] += Reward.Amount;
}


function GetPlantGrowthProgress(
    Plot,
    Plant
) {
    if (
        Plant.GrowthTime <= 0
    ) {
        return 1;
    }

    const Age =
        Date.now() -
        Plot.PlantedAt;

    return Math.max(
        0,
        Math.min(
            Age /
            Plant.GrowthTime,
            1
        )
    );
}

function GetPlantTags(
    Plot,
    Plant
) {
    return [
        ...Plant.Tags,
        ...(Plot.AddedTags ?? [])
    ];
}


function GetPlantVariant(
    Plot,
    Plant
) {
    if (
        Plot.VisualVariant !==
        null
    ) {
        return Plot.VisualVariant;
    }

    const Tags =
        GetPlantTags(
            Plot,
            Plant
        );

    const Variants = [
        ...Plant.Variants
    ].sort(
        (A, B) =>
            B.Priority -
            A.Priority
    );

    for (
        const Variant
        of Variants
    ) {
        const Matches =
            Variant.Tags.every(
                Tag =>
                    Tags.includes(
                        Tag
                    )
            );

        if (Matches) {
            return Variant.Name;
        }
    }

    return "Default";
}


function IsPlantMature(
    Plot,
    Plant
) {
    return (
        GetPlantGrowthProgress(
            Plot,
            Plant
        ) >= 1
    );
}


function GetPlantImages(
    Plot,
    Plant
) {
    const Variants =
        PlantImages[
            Plot.Plant
        ];

    if (Variants === undefined) {
        return [];
    }


    const Variant =
        GetPlantVariant(
            Plot,
            Plant
        );


    /*
     * Preferred variant.
     */

    if (
        Array.isArray(
            Variants[Variant]
        ) &&
        Variants[Variant].length > 0
    ) {
        return Variants[
            Variant
        ];
    }


    /*
     * Default visual fallback.
     */

    if (
        Array.isArray(
            Variants.Default
        ) &&
        Variants.Default.length > 0
    ) {
        return Variants.Default;
    }


    /*
     * Absolute fallback:
     * use the first variant that has images.
     */

    for (
        const Images
        of Object.values(
            Variants
        )
    ) {
        if (
            Array.isArray(Images) &&
            Images.length > 0
        ) {
            return Images;
        }
    }


    return [];
}


function GetPlantImage(
    Plot,
    Plant
) {
    const Images =
        GetPlantImages(
            Plot,
            Plant
        );

    if (Images.length === 0) {
        return null;
    }

    if (Images.length === 1) {
        return Images[0];
    }


    const Progress =
        GetPlantGrowthProgress(
            Plot,
            Plant
        );

    if (Progress >= 1) {
        return Images[
            Images.length - 1
        ];
    }

    const GrowingImageCount =
        Images.length - 1;

    const ImageIndex =
        Math.min(
            Math.floor(
                Progress *
                GrowingImageCount
            ),

            GrowingImageCount - 1
        );


    return Images[
        ImageIndex
    ];
}


function SetGardenMessage(
    Message
) {
    document.getElementById(
        "GardenMessage"
    ).textContent = Message;
}


document.addEventListener(
    "DOMContentLoaded",
    StartGame
);
