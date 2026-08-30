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
}


function NormalizeSave() {
    GameSave.Currency ??= {};
    GameSave.Currency.Dew ??= 0;

    GameSave.Seeds ??= {};
    GameSave.Seeds.Unlocked ??= [
        "Rose"
    ];

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


    const Stage =
        GetPlantStage(
            Plot,
            Plant
        );

    const Image =
        document.createElement(
            "img"
        );

    Image.className =
        "GardenPlant";

    Image.alt =
        Plant.Name +
        " - " +
        Stage;

    SetPlantImage(
        Image,
        Plot,
        Plant,
        Stage
    );

    Button.appendChild(
        Image
    );


    if (Stage === "Mature") {
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
        GetPlantStage(
            Plot,
            Plant
        ) !== "Mature"
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

    return Math.min(
        Age /
        Plant.GrowthTime,
        1
    );
}


function GetPlantStage(
    Plot,
    Plant
) {
    const Progress =
        GetPlantGrowthProgress(
            Plot,
            Plant
        );

    if (Progress < 1 / 3) {
        return "Seed";
    }

    if (Progress < 2 / 3) {
        return "Sprout";
    }

    return "Mature";
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


function SetPlantImage(
    Image,
    Plot,
    Plant,
    Stage
) {
    const Variant =
        GetPlantVariant(
            Plot,
            Plant
        );

    const BasePath =
        "/Assets/Img/Garden/Plants/" +
        Plot.Plant +
        "/" +
        Variant +
        "/";


    /*
     * Try the requested stage first.
     *
     * If that image doesn't exist,
     * Mature.png becomes the fallback.
     */

    const Candidates = [
        BasePath + Stage + ".png",
        BasePath + "Mature.png"
    ];

    let CandidateIndex = 0;

    Image.src =
        Candidates[
            CandidateIndex
        ];

    Image.addEventListener(
        "error",
        () => {
            CandidateIndex++;

            if (
                CandidateIndex <
                Candidates.length
            ) {
                Image.src =
                    Candidates[
                        CandidateIndex
                    ];

                return;
            }

            Image.remove();
        }
    );
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
