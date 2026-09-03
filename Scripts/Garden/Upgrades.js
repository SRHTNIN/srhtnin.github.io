const GardenExpansionBaseCost = 1000;
const PlantInformationUpgradeCost = 500;
const GardenOverviewUpgradeCost = 1000;
const MutationHintsUpgradeCost = 1000;


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


function GetMutationHintsUpgradeCost() {
    return MutationHintsUpgradeCost;
}


function UnlockMutationHints(
    SaveData
) {
    SaveData.Upgrades ??= {};
    SaveData.Upgrades.MutationHints =
        true;
}
