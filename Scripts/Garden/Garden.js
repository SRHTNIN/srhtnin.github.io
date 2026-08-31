let GameSave;
let SelectedSeedId = null;
let SelectedGardenTool = "Seed";

let MutationCheckPending = false;

const GardenUpdateInterval = 1000;


async function StartGame() {
    try {
        await LoadGameContent();
    } catch (Error) {
        console.error(
            "Couldn't load Garden content:",
            Error
        );

        SetGardenMessage(
            "Couldn't load plant or mutation data."
        );

        return;
    }


    GameSave = await LoadGame();

    BindGardenTools();
    EnsureSelectedSeed();

    const InitialMutationResult =
        CheckGardenMutations(
            GameSave
        );

    RenderGame();

    if (InitialMutationResult.Attempted) {
        await SaveGame(
            GameSave
        );
    }

    setInterval(
        GardenTick,
        GardenUpdateInterval
    );

    await RenderUser();
    await RenderLeaderboard();
}


function RenderGame() {
    EnsureSelectedSeed();
    RenderCurrency();
    RenderSeeds();
    RenderTools();
    RenderGarden();
    RenderNextHarvest();
}


function BindGardenTools() {
    const ShovelButton =
        document.getElementById(
            "ShovelToolButton"
        );

    if (ShovelButton === null) {
        return;
    }

    ShovelButton.addEventListener(
        "click",
        () => {
            if (
                SelectedGardenTool ===
                "Shovel"
            ) {
                SelectedGardenTool =
                    null;
            } else {
                SelectedGardenTool =
                    "Shovel";
            }

            RenderSeeds();
            RenderTools();
            RenderGarden();
        }
    );
}


function RenderTools() {
    const ShovelButton =
        document.getElementById(
            "ShovelToolButton"
        );

    if (ShovelButton === null) {
        return;
    }

    if (
        SelectedGardenTool ===
        "Shovel"
    ) {
        ShovelButton.setAttribute(
            "aria-current",
            "true"
        );
    } else {
        ShovelButton.removeAttribute(
            "aria-current"
        );
    }
}


function RenderCurrency() {
    const DewAmount =
        document.getElementById(
            "DewAmount"
        );

    DewAmount.textContent =
        GameSave.Currency.Dew
            .toLocaleString();
}


function EnsureSelectedSeed() {
    if (
        SelectedSeedId !== null &&
        GetSeedCount(
            GameSave,
            SelectedSeedId
        ) > 0
    ) {
        return;
    }

    SelectedSeedId = null;

    const SeedIds = Object.keys(
        GameSave.Inventory.Seeds
    )
        .map(Number)
        .filter(
            PlantId =>
                GetSeedCount(
                    GameSave,
                    PlantId
                ) > 0 &&
                GetPlantById(
                    PlantId
                ) !== null
        )
        .sort(
            (A, B) => A - B
        );

    if (SeedIds.length > 0) {
        SelectedSeedId =
            SeedIds[0];

        return;
    }

    if (
        SelectedGardenTool ===
        "Seed"
    ) {
        SelectedGardenTool = null;
    }
}


function RenderSeeds() {
    const SeedList =
        document.getElementById(
            "SeedList"
        );

    SeedList.replaceChildren();

    const SeedIds = Object.keys(
        GameSave.Inventory.Seeds
    )
        .map(Number)
        .filter(
            PlantId =>
                GetSeedCount(
                    GameSave,
                    PlantId
                ) > 0 &&
                GetPlantById(
                    PlantId
                ) !== null
        )
        .sort(
            (A, B) => A - B
        );


    if (SeedIds.length === 0) {
        const EmptyMessage =
            document.createElement(
                "p"
            );

        EmptyMessage.className =
            "SeedEmpty";

        EmptyMessage.append(
            "You don't have any seeds. Visit the "
        );

        const ShopLink =
            document.createElement(
                "a"
            );

        ShopLink.href =
            "/Pages/Shop.html";

        ShopLink.textContent =
            "shop";

        EmptyMessage.append(
            ShopLink,
            "."
        );

        SeedList.appendChild(
            EmptyMessage
        );

        return;
    }


    for (
        const PlantId
        of SeedIds
    ) {
        const Plant =
            GetPlantById(
                PlantId
            );

        if (Plant === null) {
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
            Plant.Name +
            " ×" +
            GetSeedCount(
                GameSave,
                PlantId
            );

        if (
            SelectedGardenTool ===
                "Seed" &&
            PlantId ===
                SelectedSeedId
        ) {
            Button.setAttribute(
                "aria-current",
                "true"
            );
        }

        Button.addEventListener(
            "click",
            () => {
                SelectedGardenTool =
                    "Seed";

                SelectedSeedId =
                    PlantId;

                RenderSeeds();
                RenderTools();
                RenderGarden();

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

        if (
            SelectedGardenTool ===
            "Seed"
        ) {
            Button.addEventListener(
                "click",
                () => {
                    PlantSeed(
                        PlotIndex
                    );
                }
            );
        }

        return Button;
    }


    const Plant =
        Plants[Plot.Plant];

    if (Plant === undefined) {
        Button.textContent = "?";

        return Button;
    }


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
    } else {
        const MissingImage =
            document.createElement(
                "span"
            );

        MissingImage.className =
            "GardenPlantMissing";

        MissingImage.textContent =
            Plant.Name;

        Button.appendChild(
            MissingImage
        );
    }


    if (
        SelectedGardenTool ===
        "Shovel"
    ) {
        Button.classList.add(
            "GardenPlotRemove"
        );

        Button.title =
            "Remove " +
            Plant.Name;

        Button.addEventListener(
            "click",
            () => {
                RemovePlant(
                    PlotIndex
                );
            }
        );

        return Button;
    }


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

    EnsureSelectedSeed();

    if (SelectedSeedId === null) {
        SetGardenMessage(
            "You don't have any seeds to plant."
        );

        return;
    }


    const Plant =
        GetPlantById(
            SelectedSeedId
        );

    const PlantKey =
        GetPlantKeyById(
            SelectedSeedId
        );

    if (
        Plant === null ||
        PlantKey === null
    ) {
        return;
    }


    if (
        !TakeSeed(
            GameSave,
            SelectedSeedId
        )
    ) {
        EnsureSelectedSeed();
        RenderSeeds();

        return;
    }


    GameSave.Garden.Plots[
        PlotIndex
    ] = {
        Plant: PlantKey,
        PlantedAt: Date.now()
    };


    SetGardenMessage(
        "Planted " +
        Plant.Name +
        "."
    );

    CheckGardenMutations(
        GameSave
    );

    RenderGame();

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
        Plant === undefined ||
        !IsPlantMature(
            Plot,
            Plant
        )
    ) {
        return;
    }


    const RewardAmount =
        GetPlantHarvestReward(
            GameSave,
            Plant.Id
        );

    if (RewardAmount === null) {
        SetGardenMessage(
            "Couldn't calculate the harvest reward for " +
            Plant.Name +
            "."
        );

        return;
    }


    GiveReward({
        Currency: "Dew",
        Amount: RewardAmount
    });

    GameSave.Garden.Plots[
        PlotIndex
    ] = null;


    SetGardenMessage(
        "Harvested " +
        Plant.Name +
        " for " +
        RewardAmount +
        " Dew."
    );

    CheckGardenMutations(
        GameSave
    );

    RenderGame();

    await SaveGame(
        GameSave
    );
}


async function RemovePlant(
    PlotIndex
) {
    if (
        GameSave.Garden.Plots[
            PlotIndex
        ] === null
    ) {
        return;
    }


    GameSave.Garden.Plots[
        PlotIndex
    ] = null;


    CheckGardenMutations(
        GameSave
    );

    RenderGame();

    await SaveGame(
        GameSave
    );
}


async function GardenTick() {
    RenderGarden();
    RenderNextHarvest();


    if (MutationCheckPending) {
        return;
    }


    MutationCheckPending = true;


    try {
        const MutationResult =
            CheckGardenMutations(
                GameSave
            );


        if (MutationResult.Attempted) {
            RenderGame();

            await SaveGame(
                GameSave
            );
        }
    } finally {
        MutationCheckPending = false;
    }
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
        ...(Plant.Tags ?? [])
    ];
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
    return PlantImages[
        Plot.Plant
    ] ?? [];
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


function GetNextHarvestTime() {
    let NextHarvestTime = null;


    for (
        const Plot
        of GameSave.Garden.Plots
    ) {
        if (Plot === null) {
            continue;
        }


        const Plant =
            Plants[Plot.Plant];

        if (Plant === undefined) {
            continue;
        }


        const HarvestTime =
            Plot.PlantedAt +
            Plant.GrowthTime;


        if (
            HarvestTime <=
            Date.now()
        ) {
            return Date.now();
        }


        if (
            NextHarvestTime === null ||
            HarvestTime <
                NextHarvestTime
        ) {
            NextHarvestTime =
                HarvestTime;
        }
    }


    return NextHarvestTime;
}


function RenderNextHarvest() {
    const Element =
        document.getElementById(
            "NextHarvest"
        );

    if (Element === null) {
        return;
    }


    const HarvestTime =
        GetNextHarvestTime();


    if (HarvestTime === null) {
        Element.textContent =
            "Nothing planted";

        Element.removeAttribute(
            "title"
        );

        return;
    }


    const Remaining =
        HarvestTime -
        Date.now();


    if (Remaining <= 0) {
        Element.textContent =
            "Ready now!";

        Element.removeAttribute(
            "title"
        );

        return;
    }


    Element.textContent =
        FormatRemainingTime(
            Remaining
        );


    const HarvestDate =
        new Date(
            HarvestTime
        );


    Element.title =
        "Ready at " +
        HarvestDate.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


function FormatRemainingTime(
    Milliseconds
) {
    const TotalSeconds =
        Math.ceil(
            Milliseconds /
            1000
        );

    const Days =
        Math.floor(
            TotalSeconds /
            86400
        );

    const Hours =
        Math.floor(
            (
                TotalSeconds %
                86400
            ) /
            3600
        );

    const Minutes =
        Math.floor(
            (
                TotalSeconds %
                3600
            ) /
            60
        );

    const Seconds =
        TotalSeconds %
        60;


    if (Days > 0) {
        return (
            Days +
            "d " +
            Hours +
            "h"
        );
    }


    if (Hours > 0) {
        return (
            Hours +
            "h " +
            Minutes +
            "m"
        );
    }


    if (Minutes > 0) {
        return (
            Minutes +
            "m " +
            Seconds +
            "s"
        );
    }


    return (
        Seconds +
        "s"
    );
}


document.addEventListener(
    "DOMContentLoaded",
    StartGame
);
