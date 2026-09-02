const GardenExpansionBaseCost = 1000;


function GetGardenColumnUpgradeCost(
    SaveData
) {
    return CalculateGardenExpansionCost(
        SaveData.Garden.Height
    );
}


function GetGardenRowUpgradeCost(
    SaveData
) {
    return CalculateGardenExpansionCost(
        SaveData.Garden.Width
    );
}


function CalculateGardenExpansionCost(
    AddedPlots
) {
    const PlotCount = Math.max(
        1,
        Math.floor(
            Number(AddedPlots) || 1
        )
    );

    return Math.round(
        GardenExpansionBaseCost *
        PlotCount *
        (1 + PlotCount / 10)
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
