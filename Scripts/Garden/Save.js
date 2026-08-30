const SaveKeyName = "SarahtoninGardenSaveKey";
const LocalSaveName = "SarahtoninGarden";

const ApiUrl = "https://api.srhtnin.garden";


function CreateNewSave() {
    const StartingSeeds = {};
    const StartingPlants = [];

    if (
        typeof Plants !==
        "undefined"
    ) {
        for (
            const Plant
            of Object.values(Plants)
        ) {
            if (
                Plant.Shop
                    ?.StartingPlant !==
                true
            ) {
                continue;
            }

            StartingSeeds[
                String(Plant.Id)
            ] = 1;

            StartingPlants.push(
                Plant.Id
            );
        }
    }

    if (
        StartingPlants.length === 0
    ) {
        StartingSeeds["1"] = 1;
        StartingPlants.push(1);
    }


    return {
        Version: 2,
        Revision: 0,
        LastSavedAt: Date.now(),

        Currency: {
            Dew: 0
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
            Seeds: StartingSeeds
        },

        Upgrades: {
            PlotSize: 0
        },

        Garden: {
            Width: 3,
            Height: 3,
            Plots: Array(9).fill(null)
        },

        Discoveries: {
            Plants: StartingPlants,
            Mutations: []
        },

        MutationCooldowns: {}
    };
}


function NormalizeSaveData(
    SaveData
) {
    SaveData.Version = Math.max(
        Number(
            SaveData.Version ?? 1
        ),
        2
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


    SaveData.Garden ??= {
        Width: 3,
        Height: 3,
        Plots: []
    };

    SaveData.Garden.Width = Math.max(
        1,
        Number(
            SaveData.Garden.Width ?? 3
        )
    );

    SaveData.Garden.Height = Math.max(
        1,
        Number(
            SaveData.Garden.Height ?? 3
        )
    );

    SaveData.Garden.Plots ??= [];


    for (
        let PlotIndex = 0;
        PlotIndex <
            SaveData.Garden.Plots.length;
        PlotIndex++
    ) {
        const Plot =
            SaveData.Garden.Plots[
                PlotIndex
            ];

        if (Plot === null) {
            continue;
        }

        if (
            Plot.Plant === "Rose"
        ) {
            Plot.Plant =
                "RedRose";
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
        SaveData.Garden.Width *
        SaveData.Garden.Height;

    while (
        SaveData.Garden.Plots.length <
        RequiredPlots
    ) {
        SaveData.Garden.Plots.push(null);
    }

    if (
        SaveData.Garden.Plots.length >
        RequiredPlots
    ) {
        SaveData.Garden.Plots.length =
            RequiredPlots;
    }


    SaveData.MutationCooldowns ??= {};


    return SaveData;
}


function GetStartingPlantDefinitions() {
    if (
        typeof Plants ===
        "undefined"
    ) {
        return [];
    }

    return Object.values(Plants)
        .filter(
            Plant =>
                Plant.Shop
                    ?.StartingPlant ===
                true
        );
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
