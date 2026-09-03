const MutationTimeFeePerMinute = 3;

const PlantKeysById = new Map();
const PlantsById = new Map();
const MutationsById = new Map();

let IndexedPlants = null;
let IndexedMutations = null;


function EnsureEconomyIndexes() {
    if (
        IndexedPlants === Plants &&
        IndexedMutations ===
            MutationSets
    ) {
        return;
    }


    PlantKeysById.clear();
    PlantsById.clear();
    MutationsById.clear();


    for (
        const [PlantKey, Plant]
        of Object.entries(Plants)
    ) {
        if (
            PlantsById.has(
                Plant.Id
            )
        ) {
            throw new Error(
                "Duplicate plant ID: " +
                Plant.Id
            );
        }

        PlantKeysById.set(
            Plant.Id,
            PlantKey
        );

        PlantsById.set(
            Plant.Id,
            Plant
        );
    }


    for (
        const Mutation
        of Object.values(
            MutationSets
        )
    ) {
        if (
            MutationsById.has(
                Mutation.Id
            )
        ) {
            throw new Error(
                "Duplicate mutation ID: " +
                Mutation.Id
            );
        }

        MutationsById.set(
            Mutation.Id,
            Mutation
        );
    }


    IndexedPlants = Plants;
    IndexedMutations =
        MutationSets;
}


function GetPlantKeyById(
    PlantId
) {
    EnsureEconomyIndexes();

    return PlantKeysById.get(
        Number(PlantId)
    ) ?? null;
}


function GetPlantById(
    PlantId
) {
    EnsureEconomyIndexes();

    return PlantsById.get(
        Number(PlantId)
    ) ?? null;
}


function GetMutationById(
    MutationId
) {
    EnsureEconomyIndexes();

    return MutationsById.get(
        Number(MutationId)
    ) ?? null;
}


function HasDiscoveredPlant(
    SaveData,
    PlantId
) {
    return SaveData.Discoveries.Plants.includes(
        Number(PlantId)
    );
}


function HasDiscoveredMutation(
    SaveData,
    MutationId
) {
    return SaveData.Discoveries.Mutations.includes(
        Number(MutationId)
    );
}


function DiscoverPlant(
    SaveData,
    PlantId
) {
    PlantId = Number(PlantId);

    if (
        !HasDiscoveredPlant(
            SaveData,
            PlantId
        )
    ) {
        SaveData.Discoveries.Plants.push(
            PlantId
        );
    }
}


function DiscoverMutation(
    SaveData,
    MutationId
) {
    MutationId = Number(
        MutationId
    );

    if (
        !HasDiscoveredMutation(
            SaveData,
            MutationId
        )
    ) {
        SaveData.Discoveries.Mutations.push(
            MutationId
        );
    }
}


function IsPlantAvailableInShop(
    SaveData,
    Plant
) {
    if (
        Plant.Shop?.ShopPlant ===
        true
    ) {
        return true;
    }

    return HasDiscoveredPlant(
        SaveData,
        Plant.Id
    );
}


function GetSeedCount(
    SaveData,
    PlantId
) {
    return Number(
        SaveData.Inventory.Seeds[
            String(PlantId)
        ] ?? 0
    );
}


function AddSeed(
    SaveData,
    PlantId,
    Amount = 1
) {
    const InventoryKey =
        String(PlantId);

    SaveData.Inventory.Seeds[
        InventoryKey
    ] ??= 0;

    SaveData.Inventory.Seeds[
        InventoryKey
    ] += Amount;
}


function TakeSeed(
    SaveData,
    PlantId,
    Amount = 1
) {
    const CurrentAmount =
        GetSeedCount(
            SaveData,
            PlantId
        );

    if (CurrentAmount < Amount) {
        return false;
    }

    SaveData.Inventory.Seeds[
        String(PlantId)
    ] = CurrentAmount - Amount;

    return true;
}


function GetPlantShopCost(
    SaveData,
    PlantId,
    Cache = new Map(),
    Visiting = new Set()
) {
    PlantId = Number(PlantId);

    if (Cache.has(PlantId)) {
        return Cache.get(PlantId);
    }

    const Plant =
        GetPlantById(
            PlantId
        );

    if (Plant === null) {
        return null;
    }

    if (
        Plant.Shop?.ShopPlant ===
        true
    ) {
        if (
            Plant.Shop.BaseCost === null ||
            Plant.Shop.BaseCost === undefined ||
            Plant.Shop.BaseCost === ""
        ) {
            return null;
        }

        const BaseCost = Number(
            Plant.Shop.BaseCost
        );

        if (
            !Number.isFinite(BaseCost) ||
            BaseCost < 0
        ) {
            return null;
        }

        const Cost =
            Math.ceil(BaseCost);

        Cache.set(
            PlantId,
            Cost
        );

        return Cost;
    }

    if (
        !HasDiscoveredPlant(
            SaveData,
            PlantId
        )
    ) {
        return null;
    }

    if (Visiting.has(PlantId)) {
        return null;
    }

    Visiting.add(
        PlantId
    );

    let CheapestCost = null;


    for (
        const Mutation
        of Object.values(
            MutationSets
        )
    ) {
        if (
            !HasDiscoveredMutation(
                SaveData,
                Mutation.Id
            )
        ) {
            continue;
        }

        if (
            !Mutation.Relations
                ?.PlantsCreated
                ?.includes(
                    PlantId
                )
        ) {
            continue;
        }

        const IngredientCost =
            GetMutationIngredientCost(
                SaveData,
                Mutation,
                Cache,
                Visiting
            );

        if (IngredientCost === null) {
            continue;
        }

        const MutationCost =
            IngredientCost +
            GetMutationTimeFee(
                Mutation
            );

        if (
            CheapestCost === null ||
            MutationCost < CheapestCost
        ) {
            CheapestCost =
                MutationCost;
        }
    }


    Visiting.delete(
        PlantId
    );

    Cache.set(
        PlantId,
        CheapestCost
    );

    return CheapestCost;
}


function GetMutationIngredientCost(
    SaveData,
    Mutation,
    Cache,
    Visiting
) {
    let TotalCost = 0;


    for (
        const Row
        of Mutation.Pattern ?? []
    ) {
        for (
            const Matcher
            of Row
        ) {
            if (
                Matcher === null ||
                Matcher === "Empty" ||
                Matcher === "Any"
            ) {
                continue;
            }

            const MatcherCost =
                GetMatcherSeedCost(
                    SaveData,
                    Matcher,
                    Cache,
                    Visiting
                );

            if (MatcherCost === null) {
                return null;
            }

            TotalCost +=
                MatcherCost;
        }
    }


    return TotalCost;
}


function GetMatcherSeedCost(
    SaveData,
    Matcher,
    Cache,
    Visiting
) {
    if (typeof Matcher === "string") {
        const Plant =
            Plants[Matcher];

        if (Plant === undefined) {
            return null;
        }

        return GetPlantShopCost(
            SaveData,
            Plant.Id,
            Cache,
            Visiting
        );
    }


    if (
        typeof Matcher !== "object" ||
        Matcher === null
    ) {
        return null;
    }


    if (
        typeof Matcher.Plant ===
        "string"
    ) {
        const Plant =
            Plants[Matcher.Plant];

        if (Plant === undefined) {
            return null;
        }

        return GetPlantShopCost(
            SaveData,
            Plant.Id,
            Cache,
            Visiting
        );
    }


    let CheapestCost = null;


    for (
        const Plant
        of Object.values(Plants)
    ) {
        if (
            !IsPlantAvailableInShop(
                SaveData,
                Plant
            )
        ) {
            continue;
        }

        if (
            !DoesPlantMatchRecipeMatcher(
                Plant,
                Matcher
            )
        ) {
            continue;
        }

        const Cost =
            GetPlantShopCost(
                SaveData,
                Plant.Id,
                Cache,
                Visiting
            );

        if (Cost === null) {
            continue;
        }

        if (
            CheapestCost === null ||
            Cost < CheapestCost
        ) {
            CheapestCost = Cost;
        }
    }


    return CheapestCost;
}


function DoesPlantMatchRecipeMatcher(
    Plant,
    Matcher
) {
    const Tags =
        Plant.Tags ?? [];

    if (
        Array.isArray(
            Matcher.Tags
        ) &&
        !Matcher.Tags.every(
            Tag =>
                Tags.includes(Tag)
        )
    ) {
        return false;
    }

    if (
        Array.isArray(
            Matcher.TagsAny
        ) &&
        Matcher.TagsAny.length > 0 &&
        !Matcher.TagsAny.some(
            Tag =>
                Tags.includes(Tag)
        )
    ) {
        return false;
    }

    if (
        Array.isArray(
            Matcher.TagsNot
        ) &&
        Matcher.TagsNot.some(
            Tag =>
                Tags.includes(Tag)
        )
    ) {
        return false;
    }

    return true;
}


function GetMutationTimeFee(
    Mutation
) {
    const MutationTime = Number(
        Mutation.MutationTime ??
        Mutation.Cooldown ??
        0
    );

    if (
        !Number.isFinite(
            MutationTime
        ) ||
        MutationTime <= 0
    ) {
        return 0;
    }

    return Math.ceil(
        MutationTime /
        60000 *
        MutationTimeFeePerMinute
    );
}


function GetPlantHarvestMultiplier(
    PlantId
) {
    const Plant =
        typeof PlantId === "object" &&
        PlantId !== null
            ? PlantId
            : GetPlantById(
                PlantId
            );

    if (Plant === null) {
        return 1.5;
    }

    const Multiplier = Number(
        Plant.HarvestMultiplier ??
        1.5
    );

    return (
        Number.isFinite(Multiplier) &&
        Multiplier >= 0
    )
        ? Multiplier
        : 1.5;
}


function GetPlantHarvestReward(
    SaveData,
    PlantId
) {
    const Cost =
        GetPlantShopCost(
            SaveData,
            PlantId
        );

    if (Cost === null) {
        return null;
    }

    return Math.ceil(
        Cost *
        GetPlantHarvestMultiplier(
            PlantId
        )
    );
}


function GetPlantDewPerHour(
    SaveData,
    PlantId
) {
    const Plant =
        GetPlantById(
            PlantId
        );

    if (Plant === null) {
        return null;
    }


    const GrowthTime = Number(
        Plant.GrowthTime
    );

    if (
        !Number.isFinite(
            GrowthTime
        ) ||
        GrowthTime <= 0
    ) {
        return null;
    }


    const Cost =
        GetPlantShopCost(
            SaveData,
            PlantId
        );

    const Reward =
        GetPlantHarvestReward(
            SaveData,
            PlantId
        );

    if (
        Cost === null ||
        Reward === null
    ) {
        return null;
    }


    const Profit =
        Reward - Cost;

    return (
        Profit * 3600000 /
        GrowthTime
    );
}


function FormatDewPerHour(
    DewPerHour
) {
    if (
        DewPerHour === null ||
        !Number.isFinite(
            DewPerHour
        )
    ) {
        return "Unavailable";
    }

    return (
        DewPerHour.toLocaleString(
            undefined,
            {
                maximumFractionDigits: 2
            }
        ) +
        " Dew"
    );
}

function GetCataloguePlantById(
    PlantId,
    PlantCatalogue = Plants
) {
    PlantId = Number(PlantId);

    for (
        const Plant
        of Object.values(
            PlantCatalogue
        )
    ) {
        if (Number(Plant.Id) === PlantId) {
            return Plant;
        }
    }

    return null;
}


function GetCataloguePlantCostInfo(
    PlantId,
    PlantCatalogue = Plants,
    MutationCatalogue = MutationSets,
    Cache = new Map(),
    Visiting = new Set()
) {
    PlantId = Number(PlantId);

    if (Cache.has(PlantId)) {
        return Cache.get(PlantId);
    }

    const Plant =
        GetCataloguePlantById(
            PlantId,
            PlantCatalogue
        );

    if (Plant === null) {
        return null;
    }

    if (Plant.Shop?.ShopPlant === true) {
        if (
            Plant.Shop.BaseCost === null ||
            Plant.Shop.BaseCost === undefined ||
            Plant.Shop.BaseCost === ""
        ) {
            return null;
        }

        const BaseCost = Number(
            Plant.Shop.BaseCost
        );

        if (
            !Number.isFinite(BaseCost) ||
            BaseCost < 0
        ) {
            return null;
        }

        const Info = {
            Cost: Math.ceil(BaseCost),
            SourceType: "Base",
            SourceMutation: null
        };

        Cache.set(PlantId, Info);
        return Info;
    }

    if (Visiting.has(PlantId)) {
        return null;
    }

    Visiting.add(PlantId);

    let CheapestInfo = null;

    for (
        const [MutationKey, Mutation]
        of Object.entries(
            MutationCatalogue
        )
    ) {
        if (Mutation.Archived === true) {
            continue;
        }

        if (
            !Mutation.Relations
                ?.PlantsCreated
                ?.includes(PlantId)
        ) {
            continue;
        }

        const IngredientCost =
            GetCatalogueMutationIngredientCost(
                Mutation,
                PlantCatalogue,
                MutationCatalogue,
                Cache,
                Visiting
            );

        if (IngredientCost === null) {
            continue;
        }

        const Cost =
            IngredientCost +
            GetMutationTimeFee(
                Mutation
            );

        if (
            CheapestInfo === null ||
            Cost < CheapestInfo.Cost
        ) {
            CheapestInfo = {
                Cost: Cost,
                SourceType: "Mutation",
                SourceMutation: {
                    Id: Number(
                        Mutation.Id
                    ),
                    MutationKey: MutationKey,
                    Name:
                        Mutation.Name ??
                        MutationKey
                }
            };
        }
    }

    Visiting.delete(PlantId);
    Cache.set(PlantId, CheapestInfo);

    return CheapestInfo;
}


function GetCatalogueMutationIngredientCost(
    Mutation,
    PlantCatalogue,
    MutationCatalogue,
    Cache,
    Visiting
) {
    let TotalCost = 0;

    for (const Row of Mutation.Pattern ?? []) {
        for (const Matcher of Row) {
            if (
                Matcher === null ||
                Matcher === "Empty" ||
                Matcher === "Any"
            ) {
                continue;
            }

            const MatcherCost =
                GetCatalogueMatcherSeedCost(
                    Matcher,
                    PlantCatalogue,
                    MutationCatalogue,
                    Cache,
                    Visiting
                );

            if (MatcherCost === null) {
                return null;
            }

            TotalCost += MatcherCost;
        }
    }

    return TotalCost;
}


function GetCatalogueMatcherSeedCost(
    Matcher,
    PlantCatalogue,
    MutationCatalogue,
    Cache,
    Visiting
) {
    if (typeof Matcher === "string") {
        const Plant =
            PlantCatalogue[Matcher];

        if (
            Plant === undefined ||
            Plant.Archived === true
        ) {
            return null;
        }

        return GetCataloguePlantCostInfo(
            Plant.Id,
            PlantCatalogue,
            MutationCatalogue,
            Cache,
            Visiting
        )?.Cost ?? null;
    }

    if (
        typeof Matcher !== "object" ||
        Matcher === null
    ) {
        return null;
    }

    if (typeof Matcher.Plant === "string") {
        const Plant =
            PlantCatalogue[Matcher.Plant];

        if (
            Plant === undefined ||
            Plant.Archived === true
        ) {
            return null;
        }

        return GetCataloguePlantCostInfo(
            Plant.Id,
            PlantCatalogue,
            MutationCatalogue,
            Cache,
            Visiting
        )?.Cost ?? null;
    }

    let CheapestCost = null;

    for (
        const Plant
        of Object.values(
            PlantCatalogue
        )
    ) {
        if (Plant.Archived === true) {
            continue;
        }

        if (
            !DoesPlantMatchRecipeMatcher(
                Plant,
                Matcher
            )
        ) {
            continue;
        }

        const Cost =
            GetCataloguePlantCostInfo(
                Plant.Id,
                PlantCatalogue,
                MutationCatalogue,
                Cache,
                Visiting
            )?.Cost ?? null;

        if (Cost === null) {
            continue;
        }

        if (
            CheapestCost === null ||
            Cost < CheapestCost
        ) {
            CheapestCost = Cost;
        }
    }

    return CheapestCost;
}

