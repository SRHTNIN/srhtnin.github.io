const MagicTrowelUnlockCost = 1000;
const ShovelUnlockCost = 50;
const FertilizerUnlockCost = 200;
const FutureSightUnlockCost = 5000;

const ToolUpgradeCostMultiplier = 2;
const ShovelMaximumLevel = 3;
const FertilizerMaximumLevel = 5;
const FertilizerUseCost = 100;
const FertilizerGrowthMinutes = [
    10,
    20,
    30,
    40,
    50,
    60
];

const FutureSightCooldown =
    2 * 60 * 60 * 1000;

const GardenExpansionBaseCost = 1000;
const PlantInformationUpgradeCost = 500;
const GardenOverviewUpgradeCost = 1000;
const GardenEconomyUpgradeCost = 1000;
const MutationHintsUnlockCost = 1500;
const MutationHintsUpgradeCostMultiplier = 2;
const MutationHintsMaximumLevel = 1;
const MutationHintsMaximumVisible = 10;
const RotationUnlockCost = 1200;
const NewGardenBaseCost = 4000;
const NewGardenCostMultiplier = 1.5;


function GetGardenColumnUpgradeCost(
    SaveData
) {
    const GardenWidth =
        SaveData.Garden.Width;

    const GardenHeight =
        SaveData.Garden.Height;

    return Math.round(
        GardenExpansionBaseCost *
        GardenHeight *
        (
            1 +
            GardenHeight / 10 +
            (GardenWidth - 3) / 10
        )
    );
}


function GetGardenRowUpgradeCost(
    SaveData
) {
    const GardenWidth =
        SaveData.Garden.Width;

    const GardenHeight =
        SaveData.Garden.Height;

    return Math.round(
        GardenExpansionBaseCost *
        GardenWidth *
        (
            1 +
            GardenWidth / 10 +
            (GardenHeight - 3) / 10
        )
    );
}


function AddGardenColumn(
    SaveData
) {
    const Garden = SaveData.Garden;
    const OldWidth = Garden.Width;
    const Height = Garden.Height;
    const NewWidth = OldWidth + 1;

    const NewPlots = Array(
        NewWidth * Height
    ).fill(null);


    for (
        let Y = 0;
        Y < Height;
        Y++
    ) {
        for (
            let X = 0;
            X < OldWidth;
            X++
        ) {
            NewPlots[
                Y * NewWidth + X
            ] = Garden.Plots[
                Y * OldWidth + X
            ] ?? null;
        }
    }


    Garden.Width = NewWidth;
    Garden.Plots = NewPlots;

    ResetGardenMutationCooldowns(
        SaveData
    );
}


function AddGardenRow(
    SaveData
) {
    const Garden = SaveData.Garden;
    const Width = Garden.Width;

    Garden.Height++;

    Garden.Plots.push(
        ...Array(Width).fill(null)
    );

    ResetGardenMutationCooldowns(
        SaveData
    );
}


function ResetGardenMutationCooldowns(
    SaveData
) {
    SaveData.MutationCooldowns = {};
}


function GetNewGardenCost(
    SaveData
) {
    const GardensOwned = Math.max(
        1,
        SaveData.Gardens?.length ?? 1
    );

    return Math.round(
        NewGardenBaseCost *
        Math.pow(
            NewGardenCostMultiplier,
            GardensOwned - 1
        )
    );
}


function AddNewGarden(
    SaveData
) {
    SaveData.Gardens ??= [];

    SaveData.Gardens.push(
        CreateGardenData()
    );

    SetActiveGardenIndex(
        SaveData,
        SaveData.Gardens.length - 1
    );

    return SaveData.Garden;
}


function HasRotationUpgrade(
    SaveData
) {
    return (
        SaveData
            ?.Upgrades
            ?.Rotation === true
    );
}


function GetRotationUpgradeCost() {
    return RotationUnlockCost;
}


function UnlockRotation(
    SaveData
) {
    SaveData.Upgrades ??= {};
    SaveData.Preferences ??= {};

    SaveData.Upgrades.Rotation = true;
    SaveData.Preferences.ShowPlotRotation =
        true;
}


function HasPlantInformationUpgrade(
    SaveData
) {
    return (
        SaveData
            ?.Upgrades
            ?.PlantInformation ===
        true
    );
}


function GetPlantInformationUpgradeCost() {
    return PlantInformationUpgradeCost;
}


function UnlockPlantInformation(
    SaveData
) {
    SaveData.Upgrades ??= {};
    SaveData.Preferences ??= {};

    SaveData.Upgrades.PlantInformation =
        true;

    SaveData.Preferences.ShowPlantNames =
        true;

    SaveData.Preferences.ShowGrowthTimers =
        true;
}


function HasGardenOverviewUpgrade(
    SaveData
) {
    return (
        SaveData
            ?.Upgrades
            ?.GardenOverview ===
        true
    );
}


function GetGardenOverviewUpgradeCost() {
    return GardenOverviewUpgradeCost;
}


function UnlockGardenOverview(
    SaveData
) {
    SaveData.Upgrades ??= {};
    SaveData.Preferences ??= {};

    SaveData.Upgrades.GardenOverview =
        true;

    SaveData.Preferences.ShowNextHarvest =
        true;

    SaveData.Preferences.ShowGardenSize =
        true;

    SaveData.Preferences.ShowEmptyPlots =
        true;

    SaveData.Preferences.ShowPlantedPlots =
        true;

    SaveData.Preferences.ShowGrowingPlots =
        true;

    SaveData.Preferences.ShowReadyPlots =
        true;
}


function HasGardenEconomyUpgrade(
    SaveData
) {
    return (
        SaveData
            ?.Upgrades
            ?.GardenEconomy ===
        true
    );
}


function GetGardenEconomyUpgradeCost() {
    return GardenEconomyUpgradeCost;
}


function UnlockGardenEconomy(
    SaveData
) {
    SaveData.Upgrades ??= {};
    SaveData.Upgrades.GardenEconomy =
        true;
}


function HasMutationHintsUpgrade(
    SaveData
) {
    return (
        SaveData
            ?.Upgrades
            ?.MutationHints ===
        true
    );
}


function GetMutationHintsLevel(
    SaveData
) {
    return Math.max(
        0,
        Math.min(
            MutationHintsMaximumLevel,
            Math.floor(
                Number(
                    SaveData
                        ?.Upgrades
                        ?.MutationHintsLevel ?? 0
                ) || 0
            )
        )
    );
}


function GetMutationHintsDisplayLimit(
    SaveData
) {
    if (
        !HasMutationHintsUpgrade(
            SaveData
        )
    ) {
        return 0;
    }

    return GetMutationHintsLevel(
        SaveData
    ) >= MutationHintsMaximumLevel
        ? MutationHintsMaximumVisible
        : 1;
}


function GetMutationHintsUpgradeCost(
    SaveData
) {
    if (
        !HasMutationHintsUpgrade(
            SaveData
        )
    ) {
        return MutationHintsUnlockCost;
    }

    const Level =
        GetMutationHintsLevel(
            SaveData
        );

    if (
        Level >= MutationHintsMaximumLevel
    ) {
        return null;
    }

    return Math.round(
        MutationHintsUnlockCost *
        Math.pow(
            MutationHintsUpgradeCostMultiplier,
            Level + 1
        )
    );
}


function UnlockMutationHints(
    SaveData
) {
    SaveData.Upgrades ??= {};
    SaveData.Upgrades.MutationHints =
        true;
    SaveData.Upgrades.MutationHintsLevel =
        0;
}


function UpgradeMutationHints(
    SaveData
) {
    if (
        !HasMutationHintsUpgrade(
            SaveData
        )
    ) {
        return false;
    }

    const Level =
        GetMutationHintsLevel(
            SaveData
        );

    if (
        Level >= MutationHintsMaximumLevel
    ) {
        return false;
    }

    SaveData.Upgrades.MutationHintsLevel =
        Level + 1;

    return true;
}


function IsGardenToolUnlocked(
    SaveData,
    Tool
) {
    if (Tool === "Trowel") {
        return true;
    }

    if (Tool === "MagicTrowel") {
        return SaveData?.Tools?.MagicTrowel === true;
    }

    if (Tool === "Shovel") {
        return SaveData?.Tools?.Shovel === true;
    }

    if (Tool === "Fertilizer") {
        return SaveData?.Tools?.Fertilizer === true;
    }

    if (Tool === "FutureSight") {
        return SaveData?.Tools?.FutureSight === true;
    }

    return false;
}


function GetGardenToolUnlockCost(
    Tool
) {
    const Costs = {
        MagicTrowel: MagicTrowelUnlockCost,
        Shovel: ShovelUnlockCost,
        Fertilizer: FertilizerUnlockCost,
        FutureSight: FutureSightUnlockCost
    };

    return Costs[Tool] ?? null;
}


function UnlockGardenTool(
    SaveData,
    Tool
) {
    SaveData.Tools ??= {};

    if (
        ![
            "MagicTrowel",
            "Shovel",
            "Fertilizer",
            "FutureSight"
        ].includes(Tool)
    ) {
        return false;
    }

    SaveData.Tools[Tool] = true;

    return true;
}


function GetShovelLevel(
    SaveData
) {
    return Math.max(
        0,
        Math.min(
            ShovelMaximumLevel,
            Math.floor(
                Number(
                    SaveData?.Tools?.ShovelLevel ?? 0
                ) || 0
            )
        )
    );
}


function GetShovelUpgradeCost(
    SaveData
) {
    const Level = GetShovelLevel(
        SaveData
    );

    if (Level >= ShovelMaximumLevel) {
        return null;
    }

    return Math.round(
        ShovelUnlockCost *
        Math.pow(
            ToolUpgradeCostMultiplier,
            Level + 1
        )
    );
}


function UpgradeShovel(
    SaveData
) {
    if (
        !IsGardenToolUnlocked(
            SaveData,
            "Shovel"
        )
    ) {
        return false;
    }

    const Level = GetShovelLevel(
        SaveData
    );

    if (Level >= ShovelMaximumLevel) {
        return false;
    }

    SaveData.Tools.ShovelLevel =
        Level + 1;

    return true;
}


function GetShovelRefundRate(
    SaveData
) {
    const Level = GetShovelLevel(
        SaveData
    );

    if (Level === 1) {
        return 0.33;
    }

    if (Level === 2) {
        return 0.66;
    }

    return 0;
}


function DoesShovelReturnSeed(
    SaveData
) {
    return GetShovelLevel(
        SaveData
    ) >= 3;
}


function GetFertilizerLevel(
    SaveData
) {
    return Math.max(
        0,
        Math.min(
            FertilizerMaximumLevel,
            Math.floor(
                Number(
                    SaveData?.Tools?.FertilizerLevel ?? 0
                ) || 0
            )
        )
    );
}


function GetFertilizerUpgradeCost(
    SaveData
) {
    const Level = GetFertilizerLevel(
        SaveData
    );

    if (Level >= FertilizerMaximumLevel) {
        return null;
    }

    return Math.round(
        FertilizerUnlockCost *
        Math.pow(
            ToolUpgradeCostMultiplier,
            Level + 1
        )
    );
}


function UpgradeFertilizer(
    SaveData
) {
    if (
        !IsGardenToolUnlocked(
            SaveData,
            "Fertilizer"
        )
    ) {
        return false;
    }

    const Level = GetFertilizerLevel(
        SaveData
    );

    if (Level >= FertilizerMaximumLevel) {
        return false;
    }

    SaveData.Tools.FertilizerLevel =
        Level + 1;

    return true;
}


function GetFertilizerGrowthMinutes(
    SaveData
) {
    return FertilizerGrowthMinutes[
        GetFertilizerLevel(
            SaveData
        )
    ];
}


function GetFertilizerUseCost(
    Amount = 1
) {
    return FertilizerUseCost *
        Math.max(
            1,
            Math.floor(
                Number(Amount) || 1
            )
        );
}


function AddFertilizerUses(
    SaveData,
    Amount = 1
) {
    SaveData.Inventory ??= {};
    SaveData.Inventory.Fertilizer ??= 0;

    SaveData.Inventory.Fertilizer +=
        Math.max(
            0,
            Math.floor(
                Number(Amount) || 0
            )
        );
}


function TakeFertilizerUse(
    SaveData
) {
    const CurrentUses = Math.max(
        0,
        Math.floor(
            Number(
                SaveData?.Inventory?.Fertilizer ?? 0
            ) || 0
        )
    );

    if (CurrentUses <= 0) {
        return false;
    }

    SaveData.Inventory.Fertilizer =
        CurrentUses - 1;

    return true;
}


function GetFutureSightCooldownRemaining(
    SaveData,
    Now = GetSavedSimulationTime(
        SaveData
    )
) {
    return Math.max(
        0,
        Number(
            SaveData?.Tools?.FutureSightCooldownUntil ?? 0
        ) - Now
    );
}


function IsFutureSightReady(
    SaveData,
    Now = GetSavedSimulationTime(
        SaveData
    )
) {
    return GetFutureSightCooldownRemaining(
        SaveData,
        Now
    ) <= 0;
}


function StartFutureSightCooldown(
    SaveData,
    Now = GetSavedSimulationTime(
        SaveData
    )
) {
    SaveData.Tools ??= {};
    SaveData.Tools.FutureSightCooldownUntil =
        Now + FutureSightCooldown;
}
