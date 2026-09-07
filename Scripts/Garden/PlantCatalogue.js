function GetPlantRelatedMutations(
    PlantId,
    RelationName
) {
    return Object.values(
        MutationSets
    )
        .filter(
            Mutation =>
                Mutation.Relations?.[
                    RelationName
                ]?.includes(
                    Number(PlantId)
                )
        )
        .sort(
            (A, B) =>
                A.Id - B.Id
        );
}


function DoesPlantCatalogueMatchSearch(
    Plant,
    SearchQuery,
    SaveData
) {
    if (SearchQuery.length === 0) {
        return true;
    }

    const SearchParts = [
        Plant.Id,
        Plant.Name,
        Plant.Description,
        Plant.Archived === true
            ? "Archived"
            : "",
        ...(Array.isArray(Plant.Tags)
            ? Plant.Tags
            : [])
    ];

    for (
        const Mutation
        of GetPlantRelatedMutations(
            Plant.Id,
            "PlantsCreated"
        ).concat(
            GetPlantRelatedMutations(
                Plant.Id,
                "PlantsUsed"
            )
        )
    ) {
        if (
            HasDiscoveredMutation(
                SaveData,
                Mutation.Id
            )
        ) {
            SearchParts.push(
                Mutation.Name
            );
        }
    }

    return SearchParts
        .filter(
            Value =>
                Value !== null &&
                Value !== undefined
        )
        .join(" ")
        .toLocaleLowerCase()
        .includes(
            SearchQuery
        );
}


function ComparePlantCataloguePlants(
    A,
    B,
    SortMode,
    SaveData
) {
    switch (SortMode) {
        case "NameAsc":
            return String(A.Name ?? "")
                .localeCompare(
                    String(B.Name ?? ""),
                    undefined,
                    {sensitivity: "base"}
                ) || A.Id - B.Id;

        case "GrowthAsc":
            return ComparePlantCatalogueNumbers(
                A.GrowthTime,
                B.GrowthTime,
                1
            ) || A.Id - B.Id;

        case "GrowthDesc":
            return ComparePlantCatalogueNumbers(
                A.GrowthTime,
                B.GrowthTime,
                -1
            ) || A.Id - B.Id;

        case "CostAsc":
            return ComparePlantCatalogueNumbers(
                GetPlantShopCost(
                    SaveData,
                    A.Id
                ),
                GetPlantShopCost(
                    SaveData,
                    B.Id
                ),
                1
            ) || A.Id - B.Id;

        case "CostDesc":
            return ComparePlantCatalogueNumbers(
                GetPlantShopCost(
                    SaveData,
                    A.Id
                ),
                GetPlantShopCost(
                    SaveData,
                    B.Id
                ),
                -1
            ) || A.Id - B.Id;

        case "RewardAsc":
            return ComparePlantCatalogueNumbers(
                GetPlantHarvestReward(
                    SaveData,
                    A.Id
                ),
                GetPlantHarvestReward(
                    SaveData,
                    B.Id
                ),
                1
            ) || A.Id - B.Id;

        case "RewardDesc":
            return ComparePlantCatalogueNumbers(
                GetPlantHarvestReward(
                    SaveData,
                    A.Id
                ),
                GetPlantHarvestReward(
                    SaveData,
                    B.Id
                ),
                -1
            ) || A.Id - B.Id;

        case "DphAsc":
            return ComparePlantCatalogueNumbers(
                GetPlantDewPerHour(
                    SaveData,
                    A.Id
                ),
                GetPlantDewPerHour(
                    SaveData,
                    B.Id
                ),
                1
            ) || A.Id - B.Id;

        case "DphDesc":
            return ComparePlantCatalogueNumbers(
                GetPlantDewPerHour(
                    SaveData,
                    A.Id
                ),
                GetPlantDewPerHour(
                    SaveData,
                    B.Id
                ),
                -1
            ) || A.Id - B.Id;

        case "IdAsc":
        default:
            return A.Id - B.Id;
    }
}


function ComparePlantCatalogueNumbers(
    A,
    B,
    Direction
) {
    const MissingA =
        A === null ||
        A === undefined ||
        A === "";

    const MissingB =
        B === null ||
        B === undefined ||
        B === "";

    const NumberA = Number(A);
    const NumberB = Number(B);

    const ValidA =
        !MissingA &&
        Number.isFinite(NumberA);

    const ValidB =
        !MissingB &&
        Number.isFinite(NumberB);

    if (!ValidA && !ValidB) {
        return 0;
    }

    if (!ValidA) {
        return 1;
    }

    if (!ValidB) {
        return -1;
    }

    return (NumberA - NumberB) *
        Direction;
}
