const GardenExpansionBaseCost = 1000;


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
