const SaveKeyName = "SarahtoninGardenSaveKey";
const LocalSaveName = "SarahtoninGarden";

const ApiUrl = "https://api.srhtnin.garden";

const StartingDew = 15;

const StartingSeeds = {
    RedRose: 1
};


const DefaultGardenName = "Garden";
const MaximumGardenNameLength = 32;
const StartingGardenWidth = 3;
const StartingGardenHeight = 3;


function CreateGardenData(
    Name = DefaultGardenName
) {
    return {
        Name: NormalizeGardenName(
            Name
        ),
        Width: StartingGardenWidth,
        Height: StartingGardenHeight,
        Plots: Array(
            StartingGardenWidth *
            StartingGardenHeight
        ).fill(null),
        MutationCooldowns: {}
    };
}


function NormalizeGardenName(
    Value
) {
    if (
        typeof Value !== "string"
    ) {
        return DefaultGardenName;
    }

    const Name = Value
        .trim()
        .slice(
            0,
            MaximumGardenNameLength
        );

    return Name.length > 0
        ? Name
        : DefaultGardenName;
}


function NormalizeGardenData(
    Garden,
    LegacyMutationCooldowns = null
) {
    if (
        Garden === null ||
        typeof Garden !== "object" ||
        Array.isArray(Garden)
    ) {
        Garden = CreateGardenData();
    }

    Garden.Name = NormalizeGardenName(
        Garden.Name
    );

    Garden.Width = Math.max(
        1,
        Math.floor(
            Number(
                Garden.Width ??
                StartingGardenWidth
            ) || StartingGardenWidth
        )
    );

    Garden.Height = Math.max(
        1,
        Math.floor(
            Number(
                Garden.Height ??
                StartingGardenHeight
            ) || StartingGardenHeight
        )
    );

    if (!Array.isArray(Garden.Plots)) {
        Garden.Plots = [];
    }


    for (
        let PlotIndex = 0;
        PlotIndex < Garden.Plots.length;
        PlotIndex++
    ) {
        const Plot =
            Garden.Plots[PlotIndex];

        if (Plot === null) {
            continue;
        }

        if (
            typeof Plot !== "object" ||
            Array.isArray(Plot)
        ) {
            Garden.Plots[PlotIndex] = null;
            continue;
        }

        if (
            Plot.Plant === "Rose"
        ) {
            Plot.Plant = "RedRose";
        }

        if (
            typeof Plot.Plant ===
            "number"
        ) {
            const PlantKey =
                ResolvePlantKeyById(
                    Plot.Plant
                );

            if (PlantKey !== null) {
                Plot.Plant = PlantKey;
            }
        }

        Plot.PlantedAt = Number(
            Plot.PlantedAt ??
            Date.now()
        );

        delete Plot.VisualVariant;
        delete Plot.AddedTags;
    }


    const RequiredPlots =
        Garden.Width *
        Garden.Height;

    while (
        Garden.Plots.length <
        RequiredPlots
    ) {
        Garden.Plots.push(null);
    }

    if (
        Garden.Plots.length >
        RequiredPlots
    ) {
        Garden.Plots.length =
            RequiredPlots;
    }


    if (
        Garden.MutationCooldowns ===
            undefined &&
        LegacyMutationCooldowns !== null &&
        typeof LegacyMutationCooldowns ===
            "object" &&
        !Array.isArray(
            LegacyMutationCooldowns
        )
    ) {
        Garden.MutationCooldowns =
            LegacyMutationCooldowns;
    }

    if (
        Garden.MutationCooldowns === null ||
        typeof Garden.MutationCooldowns !==
            "object" ||
        Array.isArray(
            Garden.MutationCooldowns
        )
    ) {
        Garden.MutationCooldowns = {};
    }


    return Garden;
}


function GetActiveGarden(
    SaveData
) {
    if (
        !Array.isArray(
            SaveData.Gardens
        ) ||
        SaveData.Gardens.length === 0
    ) {
        SaveData.Gardens = [
            CreateGardenData()
        ];
    }

    const GardenIndex = Math.min(
        SaveData.Gardens.length - 1,
        Math.max(
            0,
            Math.floor(
                Number(
                    SaveData.ActiveGardenIndex ??
                    0
                ) || 0
            )
        )
    );

    SaveData.ActiveGardenIndex =
        GardenIndex;

    return SaveData.Gardens[
        GardenIndex
    ];
}


function SetActiveGardenIndex(
    SaveData,
    GardenIndex
) {
    if (
        !Array.isArray(
            SaveData.Gardens
        ) ||
        SaveData.Gardens.length === 0
    ) {
        return false;
    }

    const NormalizedIndex = Math.min(
        SaveData.Gardens.length - 1,
        Math.max(
            0,
            Math.floor(
                Number(
                    GardenIndex
                ) || 0
            )
        )
    );

    const Changed =
        SaveData.ActiveGardenIndex !==
        NormalizedIndex;

    SaveData.ActiveGardenIndex =
        NormalizedIndex;

    return Changed;
}


function RenameGarden(
    SaveData,
    GardenIndex,
    Name
) {
    if (
        !Array.isArray(
            SaveData.Gardens
        ) ||
        SaveData.Gardens[GardenIndex] ===
            undefined
    ) {
        return DefaultGardenName;
    }

    const NormalizedName =
        NormalizeGardenName(
            Name
        );

    SaveData.Gardens[
        GardenIndex
    ].Name = NormalizedName;

    return NormalizedName;
}


function DefineActiveGardenAliases(
    SaveData
) {
    delete SaveData.Garden;
    delete SaveData.MutationCooldowns;

    Object.defineProperty(
        SaveData,
        "Garden",
        {
            configurable: true,
            enumerable: false,

            get() {
                return GetActiveGarden(
                    SaveData
                );
            },

            set(Value) {
                const GardenIndex =
                    SaveData.ActiveGardenIndex ??
                    0;

                SaveData.Gardens[
                    GardenIndex
                ] = NormalizeGardenData(
                    Value
                );
            }
        }
    );

    Object.defineProperty(
        SaveData,
        "MutationCooldowns",
        {
            configurable: true,
            enumerable: false,

            get() {
                return GetActiveGarden(
                    SaveData
                ).MutationCooldowns;
            },

            set(Value) {
                const Garden =
                    GetActiveGarden(
                        SaveData
                    );

                Garden.MutationCooldowns =
                    Value !== null &&
                    typeof Value === "object" &&
                    !Array.isArray(Value)
                        ? Value
                        : {};
            }
        }
    );
}


function CreateNewSave() {
    const SeedInventory = {};
    const StartingPlants = [];

    for (
        const [
            PlantKey,
            Amount
        ]
        of Object.entries(
            StartingSeeds
        )
    ) {
        const Plant =
            Plants[PlantKey];

        if (Plant === undefined) {
            continue;
        }

        SeedInventory[
            String(Plant.Id)
        ] = Amount;

        StartingPlants.push(
            Plant.Id
        );
    }


    return NormalizeSaveData({
        Version: 3,
        Revision: 0,
        LastSavedAt: Date.now(),

        Currency: {
            Dew: StartingDew
        },

        Statistics: {
            CurrencyEarned: {
                Dew: 0
            },

            CurrencySpent: {
                Dew: 0
            },

            SeedsPurchased: 0
        },

        Inventory: {
            Seeds: SeedInventory
        },

        Upgrades: {
            PlotSize: 0,
            PlantInformation: false,
            GardenOverview: false,
            GardenEconomy: false,
            MutationHints: false
        },

        Preferences: {
            ShowPlantNames: true,
            ShowGrowthTimers: true,
            ShowNextHarvest: true,
            ShowGardenSize: true,
            ShowEmptyPlots: true,
            ShowPlantedPlots: true,
            ShowGrowingPlots: true,
            ShowReadyPlots: true
        },

        Gardens: [
            CreateGardenData()
        ],

        ActiveGardenIndex: 0,

        Discoveries: {
            Plants: StartingPlants,
            Mutations: []
        }
    });
}


function NormalizeSaveData(
    SaveData
) {
    SaveData.Version = Math.max(
        Number(
            SaveData.Version ?? 1
        ),
        3
    );

    SaveData.Revision = Number(
        SaveData.Revision ?? 0
    );

    SaveData.LastSavedAt = Number(
        SaveData.LastSavedAt ??
        Date.now()
    );


    SaveData.Currency ??= {};
    SaveData.Currency.Dew = Number(
        SaveData.Currency.Dew ?? 0
    );


    SaveData.Statistics ??= {};
    SaveData.Statistics.CurrencyEarned ??= {};
    SaveData.Statistics.CurrencySpent ??= {};

    SaveData.Statistics.CurrencyEarned.Dew ??=
        SaveData.Currency.Dew;

    SaveData.Statistics.CurrencySpent.Dew ??= 0;
    SaveData.Statistics.SeedsPurchased ??= 0;


    const HadSeedInventory =
        SaveData.Inventory
            ?.Seeds !== undefined;

    SaveData.Inventory ??= {};
    SaveData.Inventory.Seeds ??= {};


    /*
     * Migrate the old infinite seed unlock list
     * into the new finite seed inventory.
     */

    for (
        const LegacyPlant
        of SaveData.Seeds
            ?.Unlocked ?? []
    ) {
        const PlantId =
            ResolveLegacyPlantId(
                LegacyPlant
            );

        if (PlantId === null) {
            continue;
        }

        SaveData.Inventory.Seeds[
            String(PlantId)
        ] ??= 1;
    }


    /*
     * Existing saves predate inventory, so give them
     * one seed for each starting plant as a migration
     * safety net. New saves already contain these.
     */

    if (!HadSeedInventory) {
        for (
            const Plant
            of GetStartingPlantDefinitions()
        ) {
            SaveData.Inventory.Seeds[
                String(Plant.Id)
            ] ??= 1;
        }
    }


    for (
        const InventoryKey
        of Object.keys(
            SaveData.Inventory.Seeds
        )
    ) {
        const Amount = Math.max(
            0,
            Math.floor(
                Number(
                    SaveData.Inventory.Seeds[
                        InventoryKey
                    ] ?? 0
                )
            )
        );

        SaveData.Inventory.Seeds[
            InventoryKey
        ] = Amount;
    }


    delete SaveData.Seeds;


    SaveData.Discoveries ??= {};

    SaveData.Discoveries.Plants =
        NormalizePlantDiscoveries(
            SaveData.Discoveries.Plants ?? []
        );

    SaveData.Discoveries.Mutations =
        NormalizeMutationDiscoveries(
            SaveData.Discoveries.Mutations ?? []
        );


    for (
        const Plant
        of GetStartingPlantDefinitions()
    ) {
        if (
            !SaveData.Discoveries.Plants
                .includes(
                    Plant.Id
                )
        ) {
            SaveData.Discoveries.Plants.push(
                Plant.Id
            );
        }
    }

    SaveData.Discoveries.Plants.sort(
        (A, B) => A - B
    );

    SaveData.Discoveries.Mutations.sort(
        (A, B) => A - B
    );


    SaveData.Upgrades ??= {};
    SaveData.Upgrades.PlotSize ??= 0;
    SaveData.Upgrades.PlantInformation =
        SaveData.Upgrades.PlantInformation ===
        true;

    SaveData.Upgrades.GardenOverview =
        SaveData.Upgrades.GardenOverview ===
        true;

    SaveData.Upgrades.GardenEconomy =
        SaveData.Upgrades.GardenEconomy ===
        true;

    SaveData.Upgrades.MutationHints =
        SaveData.Upgrades.MutationHints ===
        true;


    SaveData.Preferences ??= {};

    SaveData.Preferences.ShowPlantNames =
        SaveData.Preferences.ShowPlantNames !==
        false;

    SaveData.Preferences.ShowGrowthTimers =
        SaveData.Preferences.ShowGrowthTimers !==
        false;

    SaveData.Preferences.ShowNextHarvest =
        SaveData.Preferences.ShowNextHarvest !==
        false;

    SaveData.Preferences.ShowGardenSize =
        SaveData.Preferences.ShowGardenSize !==
        false;

    SaveData.Preferences.ShowEmptyPlots =
        SaveData.Preferences.ShowEmptyPlots !==
        false;

    SaveData.Preferences.ShowPlantedPlots =
        SaveData.Preferences.ShowPlantedPlots !==
        false;

    SaveData.Preferences.ShowGrowingPlots =
        SaveData.Preferences.ShowGrowingPlots !==
        false;

    SaveData.Preferences.ShowReadyPlots =
        SaveData.Preferences.ShowReadyPlots !==
        false;


    const LegacyGarden =
        SaveData.Garden ??
        null;

    const LegacyMutationCooldowns =
        SaveData.MutationCooldowns ??
        null;


    if (
        !Array.isArray(
            SaveData.Gardens
        ) ||
        SaveData.Gardens.length === 0
    ) {
        SaveData.Gardens = [
            LegacyGarden ??
            CreateGardenData()
        ];
    }


    SaveData.Gardens =
        SaveData.Gardens.map(
            (Garden, GardenIndex) =>
                NormalizeGardenData(
                    Garden,
                    GardenIndex === 0
                        ? LegacyMutationCooldowns
                        : null
                )
        );


    SetActiveGardenIndex(
        SaveData,
        SaveData.ActiveGardenIndex ?? 0
    );

    DefineActiveGardenAliases(
        SaveData
    );


    return SaveData;
}


function GetStartingPlantDefinitions() {
    const StartingPlants = [];

    for (
        const PlantKey
        of Object.keys(
            StartingSeeds
        )
    ) {
        const Plant =
            Plants[PlantKey];

        if (Plant !== undefined) {
            StartingPlants.push(
                Plant
            );
        }
    }

    return StartingPlants;
}


function ResolveLegacyPlantId(
    Value
) {
    if (
        typeof Value ===
        "number"
    ) {
        return Value;
    }

    if (
        typeof Value !==
        "string"
    ) {
        return null;
    }

    const LegacyPlantIds = {
        Rose: 1,
        RedRose: 1,
        DarkRose: 2,
        BlueRose: 3,
        PurpleRose: 4
    };

    if (
        LegacyPlantIds[Value] !==
        undefined
    ) {
        return LegacyPlantIds[Value];
    }

    if (
        typeof Plants !==
        "undefined" &&
        Plants[Value] !== undefined
    ) {
        return Plants[Value].Id;
    }

    const NumericValue =
        Number(Value);

    if (
        Number.isInteger(
            NumericValue
        ) &&
        NumericValue > 0
    ) {
        return NumericValue;
    }

    return null;
}


function ResolvePlantKeyById(
    PlantId
) {
    if (
        typeof Plants ===
        "undefined"
    ) {
        return null;
    }

    for (
        const [PlantKey, Plant]
        of Object.entries(Plants)
    ) {
        if (
            Plant.Id ===
            Number(PlantId)
        ) {
            return PlantKey;
        }
    }

    return null;
}


function NormalizePlantDiscoveries(
    Values
) {
    const PlantIds = [];

    for (
        const Value
        of Values
    ) {
        const PlantId =
            ResolveLegacyPlantId(
                Value
            );

        if (
            PlantId !== null &&
            !PlantIds.includes(
                PlantId
            )
        ) {
            PlantIds.push(
                PlantId
            );
        }
    }

    return PlantIds;
}


function NormalizeMutationDiscoveries(
    Values
) {
    const MutationIds = [];

    for (
        const Value
        of Values
    ) {
        let MutationId = null;

        if (
            typeof Value ===
            "number"
        ) {
            MutationId = Value;
        } else if (
            typeof Value ===
            "string" &&
            typeof MutationSets !==
                "undefined" &&
            MutationSets[Value] !==
                undefined
        ) {
            MutationId =
                MutationSets[Value].Id;
        } else {
            const NumericValue =
                Number(Value);

            if (
                Number.isInteger(
                    NumericValue
                ) &&
                NumericValue > 0
            ) {
                MutationId =
                    NumericValue;
            }
        }

        if (
            MutationId !== null &&
            !MutationIds.includes(
                MutationId
            )
        ) {
            MutationIds.push(
                MutationId
            );
        }
    }

    return MutationIds;
}


function GetSaveKey() {
    let SaveKey = localStorage.getItem(
        SaveKeyName
    );

    if (SaveKey !== null) {
        return SaveKey;
    }

    const Bytes = new Uint8Array(32);

    crypto.getRandomValues(Bytes);

    SaveKey = Array.from(
        Bytes,
        Byte => Byte
            .toString(16)
            .padStart(2, "0")
    ).join("");

    localStorage.setItem(
        SaveKeyName,
        SaveKey
    );

    return SaveKey;
}


function WriteLocalSave(SaveData) {
    localStorage.setItem(
        LocalSaveName,
        JSON.stringify(SaveData)
    );
}


function ReadLocalSave() {
    const RawSave = localStorage.getItem(
        LocalSaveName
    );

    if (RawSave === null) {
        return null;
    }

    try {
        return NormalizeSaveData(
            JSON.parse(RawSave)
        );
    } catch (Error) {
        console.error(
            "Couldn't read local save:",
            Error
        );

        return null;
    }
}


async function WriteRemoteSave(SaveData) {
    const Response = await fetch(
        ApiUrl + "/Save.php",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                SaveKey: GetSaveKey(),
                SaveData: SaveData
            })
        }
    );

    if (!Response.ok) {
        throw new Error(
            "Save API returned HTTP " +
            Response.status
        );
    }

    const Result = await Response.json();

    if (!Result.Success) {
        throw new Error(
            Result.Error ??
            "Remote save failed."
        );
    }

    return Result;
}


async function ReadRemoteSave(
    SaveKey = GetSaveKey()
) {
    const Response = await fetch(
        ApiUrl + "/Load.php",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                SaveKey: SaveKey
            })
        }
    );

    if (!Response.ok) {
        throw new Error(
            "Load API returned HTTP " +
            Response.status
        );
    }

    const Result =
        await Response.json();

    if (!Result.Success) {
        throw new Error(
            Result.Error ??
            "Remote load failed."
        );
    }

    if (!Result.Exists) {
        return null;
    }

    return NormalizeSaveData(
        Result.SaveData
    );
}


async function SaveGame(SaveData) {
    NormalizeSaveData(
        SaveData
    );

    SaveData.Revision++;
    SaveData.LastSavedAt = Date.now();

    WriteLocalSave(SaveData);

    try {
        await WriteRemoteSave(SaveData);
    } catch (Error) {
        console.error(
            "Couldn't synchronize garden save:",
            Error
        );
    }
}


async function LoadGame() {
    const LocalSave = ReadLocalSave();

    let RemoteSave = null;

    try {
        RemoteSave = await ReadRemoteSave();
    } catch (Error) {
        console.error(
            "Couldn't retrieve remote save:",
            Error
        );
    }


    if (
        LocalSave === null &&
        RemoteSave === null
    ) {
        const NewSave = CreateNewSave();

        WriteLocalSave(NewSave);

        try {
            await WriteRemoteSave(NewSave);
        } catch (Error) {
            console.error(
                "Couldn't create remote save:",
                Error
            );
        }

        return NewSave;
    }


    if (
        LocalSave !== null &&
        RemoteSave === null
    ) {
        try {
            await WriteRemoteSave(LocalSave);
        } catch (Error) {
            console.error(
                "Couldn't upload local save:",
                Error
            );
        }

        return LocalSave;
    }


    if (
        LocalSave === null &&
        RemoteSave !== null
    ) {
        WriteLocalSave(RemoteSave);

        return RemoteSave;
    }


    if (
        LocalSave.Revision >
        RemoteSave.Revision
    ) {
        try {
            await WriteRemoteSave(LocalSave);
        } catch (Error) {
            console.error(
                "Couldn't update remote save:",
                Error
            );
        }

        return LocalSave;
    }


    if (
        RemoteSave.Revision >
        LocalSave.Revision
    ) {
        WriteLocalSave(RemoteSave);

        return RemoteSave;
    }


    if (
        RemoteSave.LastSavedAt >
        LocalSave.LastSavedAt
    ) {
        WriteLocalSave(RemoteSave);

        return RemoteSave;
    }

    WriteLocalSave(LocalSave);

    return LocalSave;
}
