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
    BindGardenSelector();
    EnsureSelectedSeed();

    const InitialMutationResult =
        CheckAllGardenMutations(
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
    RenderGardenSelector();
    RenderGarden();
    RenderNextHarvest();
    RenderGardenOverview();
}


function BindGardenSelector() {
    const PreviousButton =
        document.getElementById(
            "PreviousGardenButton"
        );

    const NextButton =
        document.getElementById(
            "NextGardenButton"
        );

    const NameInput =
        document.getElementById(
            "GardenNameInput"
        );


    PreviousButton?.addEventListener(
        "click",
        () => {
            SwitchGarden(-1);
        }
    );

    NextButton?.addEventListener(
        "click",
        () => {
            SwitchGarden(1);
        }
    );

    NameInput?.addEventListener(
        "change",
        async () => {
            const GardenIndex =
                GameSave.ActiveGardenIndex;

            const GardenName =
                RenameGarden(
                    GameSave,
                    GardenIndex,
                    NameInput.value
                );

            NameInput.value =
                GardenName;

            SetGardenMessage(
                "Garden renamed to " +
                GardenName +
                "."
            );

            await SaveGame(
                GameSave
            );
        }
    );

    NameInput?.addEventListener(
        "keydown",
        Event => {
            if (Event.key !== "Enter") {
                return;
            }

            Event.preventDefault();
            NameInput.blur();
        }
    );
}


async function SwitchGarden(
    Direction
) {
    const GardenCount =
        GameSave.Gardens.length;

    if (GardenCount <= 1) {
        return;
    }

    const NewIndex =
        GameSave.ActiveGardenIndex +
        Direction;

    if (
        NewIndex < 0 ||
        NewIndex >= GardenCount
    ) {
        return;
    }

    SetActiveGardenIndex(
        GameSave,
        NewIndex
    );

    const MutationResult =
        CheckGardenMutations(
            GameSave
        );

    RenderGame();

    SetGardenMessage(
        "Switched to " +
        GameSave.Garden.Name +
        "."
    );

    await SaveGame(
        GameSave
    );

    if (MutationResult.Attempted) {
        RenderGame();
    }
}


function RenderGardenSelector() {
    const PreviousButton =
        document.getElementById(
            "PreviousGardenButton"
        );

    const NextButton =
        document.getElementById(
            "NextGardenButton"
        );

    const NameInput =
        document.getElementById(
            "GardenNameInput"
        );

    if (
        PreviousButton === null ||
        NextButton === null ||
        NameInput === null
    ) {
        return;
    }

    const GardenCount =
        GameSave.Gardens.length;

    const GardenIndex =
        GameSave.ActiveGardenIndex;

    PreviousButton.disabled =
        GardenIndex <= 0;

    NextButton.disabled =
        GardenIndex >=
        GardenCount - 1;

    if (
        document.activeElement !==
        NameInput
    ) {
        NameInput.value =
            GameSave.Garden.Name;
    }

    NameInput.title =
        "Garden " +
        (GardenIndex + 1) +
        " of " +
        GardenCount;
}


function CheckAllGardenMutations(
    SaveData
) {
    const OriginalGardenIndex =
        SaveData.ActiveGardenIndex;

    const Result = {
        Attempted: false,
        Changed: false
    };


    for (
        let GardenIndex = 0;
        GardenIndex <
            SaveData.Gardens.length;
        GardenIndex++
    ) {
        SetActiveGardenIndex(
            SaveData,
            GardenIndex
        );

        const GardenResult =
            CheckGardenMutations(
                SaveData
            );

        Result.Attempted =
            Result.Attempted ||
            GardenResult.Attempted;

        Result.Changed =
            Result.Changed ||
            GardenResult.Changed;
    }


    SetActiveGardenIndex(
        SaveData,
        OriginalGardenIndex
    );

    return Result;
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
            "ActionButton SeedButton";

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

    const GardenPanel =
        document.getElementById(
            "Plots"
        );

    GardenGrid.style.setProperty(
        "--GardenWidth",
        GameSave.Garden.Width
    );

    const GardenBorderColours = [
        "var(--Lavender)",
        "var(--Mauve)",
        "var(--Pink)",
        "var(--Blue)",
        "var(--Teal)",
        "var(--Peach)",
        "var(--Yellow)",
        "var(--Green)"
    ];

    GardenPanel.style.setProperty(
        "--GardenBorderColour",
        GardenBorderColours[
            GameSave.ActiveGardenIndex %
            GardenBorderColours.length
        ]
    );

    GardenGrid.replaceChildren();


    const DisplaySettings =
        GetGardenDisplaySettings();


    GameSave.Garden.Plots.forEach(
        (Plot, PlotIndex) => {
            const PlotElement =
                CreatePlotElement(
                    Plot,
                    PlotIndex,
                    DisplaySettings
                );

            GardenGrid.appendChild(
                PlotElement
            );
        }
    );
}


function GetGardenDisplaySettings() {
    const HasPlantInformation =
        HasPlantInformationUpgrade(
            GameSave
        );

    return {
        ShowPlantNames:
            HasPlantInformation &&
            GameSave.Preferences
                .ShowPlantNames !==
                false,

        ShowGrowthTimers:
            HasPlantInformation &&
            GameSave.Preferences
                .ShowGrowthTimers !==
                false
    };
}


function CreatePlotElement(
    Plot,
    PlotIndex,
    DisplaySettings
) {
    const Button =
        document.createElement(
            "button"
        );

    Button.className =
        "PlantTile GardenPlot";

    Button.type = "button";


    if (
        DisplaySettings.ShowPlantNames
    ) {
        Button.classList.add(
            "GardenPlotWithName"
        );
    }

    if (
        DisplaySettings.ShowGrowthTimers
    ) {
        Button.classList.add(
            "GardenPlotWithTimer"
        );
    }


    const Plant =
        Plot === null
            ? null
            : Plants[Plot.Plant];

    if (
        DisplaySettings.ShowPlantNames
    ) {
        Button.appendChild(
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

    Button.appendChild(
        Visual
    );


    if (Plot === null) {
        Button.classList.add(
            "GardenPlotEmpty"
        );

        Button.title =
            "Empty plot";

        if (
            DisplaySettings
                .ShowGrowthTimers
        ) {
            Button.appendChild(
                CreateGardenPlotTimer(
                    null,
                    null,
                    0
                )
            );
        }

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


    if (Plant === undefined) {
        Visual.textContent = "?";

        if (
            DisplaySettings
                .ShowGrowthTimers
        ) {
            Button.appendChild(
                CreateGardenPlotTimer(
                    Plot,
                    null,
                    0
                )
            );
        }

        return Button;
    }


    const Progress =
        GetPlantGrowthProgress(
            Plot,
            Plant
        );

    Button.style.setProperty(
        "--GrowthProgress",
        `${Progress * 100}%`
    );


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
            "PlantSprite";

        Image.alt =
            Plant.Name;

        Image.src =
            ImagePath;

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
            Plant.Name;

        Visual.appendChild(
            MissingImage
        );
    }


    if (
        DisplaySettings.ShowGrowthTimers
    ) {
        Button.appendChild(
            CreateGardenPlotTimer(
                Plot,
                Plant,
                Progress
            )
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
        Progress >= 1
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


function CreateGardenPlotTimer(
    Plot,
    Plant,
    Progress
) {
    const Timer =
        document.createElement(
            "span"
        );

    Timer.className =
        "GardenPlotTimer";

    if (
        Plot === null ||
        Plant === null ||
        Plant === undefined
    ) {
        Timer.textContent = "";

        return Timer;
    }


    if (Progress >= 1) {
        Timer.textContent =
            "Ready";

        return Timer;
    }


    const RemainingTime =
        Math.max(
            0,
            Plant.GrowthTime -
            (
                Date.now() -
                Plot.PlantedAt
            )
        );

    Timer.textContent =
        FormatGardenRemainingTime(
            RemainingTime
        );

    return Timer;
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

    const Hours =
        Math.floor(
            TotalSeconds / 3600
        );

    const Minutes =
        Math.floor(
            (
                TotalSeconds % 3600
            ) / 60
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
    RenderGardenOverview();


    if (MutationCheckPending) {
        return;
    }


    MutationCheckPending = true;


    try {
        const MutationResult =
            CheckAllGardenMutations(
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


function GetNextHarvestInfo() {
    let NextHarvest = null;


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
            NextHarvest === null ||
            HarvestTime <
                NextHarvest.Time
        ) {
            NextHarvest = {
                Time: HarvestTime,
                Plant
            };
        }
    }


    return NextHarvest;
}


function RenderNextHarvest() {
    const Line =
        document.getElementById(
            "NextHarvestLine"
        );

    const Element =
        document.getElementById(
            "NextHarvest"
        );

    if (
        Line === null ||
        Element === null
    ) {
        return;
    }


    const HasOverview =
        HasGardenOverviewUpgrade(
            GameSave
        );

    const ShowNextHarvest =
        !HasOverview ||
        GameSave.Preferences
            .ShowNextHarvest !== false;

    Line.hidden = !ShowNextHarvest;

    if (!ShowNextHarvest) {
        return;
    }


    const Harvest =
        GetNextHarvestInfo();

    if (Harvest === null) {
        Element.textContent =
            "Nothing planted";

        Element.removeAttribute(
            "title"
        );

        return;
    }


    const Remaining =
        Harvest.Time -
        Date.now();

    const IncludePlantName =
        HasOverview;


    if (Remaining <= 0) {
        Element.textContent =
            IncludePlantName
                ? Harvest.Plant.Name +
                    " is ready!"
                : "Ready now!";

        Element.removeAttribute(
            "title"
        );

        return;
    }


    const RemainingText =
        FormatRemainingTime(
            Remaining
        );

    Element.textContent =
        IncludePlantName
            ? Harvest.Plant.Name +
                " in " +
                RemainingText
            : RemainingText;


    const HarvestDate =
        new Date(
            Harvest.Time
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


function RenderGardenOverview() {
    const Overview =
        document.getElementById(
            "GardenOverviewDetails"
        );

    if (Overview === null) {
        return;
    }


    if (
        !HasGardenOverviewUpgrade(
            GameSave
        )
    ) {
        Overview.hidden = true;

        return;
    }


    const TotalPlots =
        GameSave.Garden.Width *
        GameSave.Garden.Height;

    let PlantedPlots = 0;
    let GrowingPlots = 0;
    let ReadyPlots = 0;


    for (
        const Plot
        of GameSave.Garden.Plots
    ) {
        if (Plot === null) {
            continue;
        }

        PlantedPlots++;

        const Plant =
            Plants[Plot.Plant];

        if (Plant === undefined) {
            continue;
        }

        if (
            IsPlantMature(
                Plot,
                Plant
            )
        ) {
            ReadyPlots++;
        } else {
            GrowingPlots++;
        }
    }


    const EmptyPlots =
        Math.max(
            0,
            TotalPlots -
            PlantedPlots
        );

    const Lines = [
        {
            LineId:
                "GardenSizeOverviewLine",
            ValueId:
                "GardenSizeOverview",
            Preference:
                "ShowGardenSize",
            Value:
                GameSave.Garden.Width +
                "×" +
                GameSave.Garden.Height +
                " (" +
                TotalPlots.toLocaleString() +
                ")"
        },
        {
            LineId:
                "EmptyPlotsOverviewLine",
            ValueId:
                "EmptyPlotsOverview",
            Preference:
                "ShowEmptyPlots",
            Value:
                EmptyPlots.toLocaleString() +
                "/" +
                TotalPlots.toLocaleString()
        },
        {
            LineId:
                "PlantedPlotsOverviewLine",
            ValueId:
                "PlantedPlotsOverview",
            Preference:
                "ShowPlantedPlots",
            Value:
                PlantedPlots.toLocaleString() +
                "/" +
                TotalPlots.toLocaleString()
        },
        {
            LineId:
                "GrowingPlotsOverviewLine",
            ValueId:
                "GrowingPlotsOverview",
            Preference:
                "ShowGrowingPlots",
            Value:
                GrowingPlots.toLocaleString() +
                "/" +
                TotalPlots.toLocaleString()
        },
        {
            LineId:
                "ReadyPlotsOverviewLine",
            ValueId:
                "ReadyPlotsOverview",
            Preference:
                "ShowReadyPlots",
            Value:
                ReadyPlots.toLocaleString() +
                "/" +
                TotalPlots.toLocaleString()
        }
    ];

    let VisibleLines = 0;


    for (
        const Line
        of Lines
    ) {
        const LineElement =
            document.getElementById(
                Line.LineId
            );

        const ValueElement =
            document.getElementById(
                Line.ValueId
            );

        if (
            LineElement === null ||
            ValueElement === null
        ) {
            continue;
        }

        const IsVisible =
            GameSave.Preferences[
                Line.Preference
            ] !== false;

        LineElement.hidden =
            !IsVisible;

        ValueElement.textContent =
            Line.Value;

        if (IsVisible) {
            VisibleLines++;
        }
    }


    Overview.hidden =
        VisibleLines === 0;
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
