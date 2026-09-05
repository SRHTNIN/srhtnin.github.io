const FunctionalEffectAreas = [
    "Front",
    "Behind",
    "Cardinal",
    "Adjacent",
    "Farm"
];

const FunctionalEffectActiveTypes = [
    "Harvest",
    "Duplicate",
    "Plant",
    "Replant"
];

const FunctionalEffectPassiveTypes = [
    "GrowthAdvance",
    "DisableMutation",
    "DisableHarvest",
    "MutationChanceBonus",
    "CooldownReduction",
    "HarvestYieldBonus"
];

const FunctionalEffectTypes = [
    ...FunctionalEffectActiveTypes,
    ...FunctionalEffectPassiveTypes
];

const FunctionalEffectMinimumCooldown = 1000;

const FunctionalEffectHandlers = new Map();

const FunctionalDirectionOffsets = {
    North: [0, -1],
    East: [1, 0],
    South: [0, 1],
    West: [-1, 0]
};

const FunctionalCardinalOffsets = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
];

const FunctionalAdjacentOffsets = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
];


function IsFunctionalPlainObject(
    Value
) {
    return (
        Value !== null &&
        typeof Value === "object" &&
        !Array.isArray(Value)
    );
}


function GetPlantFunctionalEffects(
    Plant
) {
    const Functional =
        Plant?.Effects?.Functional;

    if (!Array.isArray(Functional)) {
        return [];
    }

    return Functional.filter(
        Effect =>
            IsFunctionalPlainObject(
                Effect
            ) &&
            typeof Effect.Type ===
                "string" &&
            Effect.Type.trim().length > 0
    );
}


function IsFunctionalPlant(
    Plant
) {
    return (
        GetPlantFunctionalEffects(
            Plant
        ).length > 0
    );
}


function IsKnownFunctionalEffectType(
    Type
) {
    return FunctionalEffectTypes.includes(
        String(Type ?? "")
    );
}


function IsFunctionalEffectActive(
    Effect
) {
    return FunctionalEffectActiveTypes.includes(
        String(Effect?.Type ?? "")
    );
}


function IsFunctionalEffectPassive(
    Effect
) {
    return FunctionalEffectPassiveTypes.includes(
        String(Effect?.Type ?? "")
    );
}


function GetFunctionalEffectArea(
    Effect,
    Field = "Area",
    Fallback = "Front"
) {
    const Area = String(
        Effect?.[Field] ?? Fallback
    );

    return FunctionalEffectAreas.includes(
        Area
    )
        ? Area
        : Fallback;
}


function DoesFunctionalEffectRequireMaturity(
    Effect
) {
    return Effect?.RequireMature !== false;
}


function GetFunctionalEffectCooldown(
    Effect
) {
    const Cooldown = Number(
        Effect?.Cooldown ?? 0
    );

    if (
        !Number.isFinite(Cooldown) ||
        Cooldown <= 0
    ) {
        return 0;
    }

    return Math.max(
        FunctionalEffectMinimumCooldown,
        Math.floor(Cooldown)
    );
}


function GetResolvedFunctionalEffectCooldown(
    SaveData,
    GardenIndex,
    PlotIndex,
    Effect,
    AtTime
) {
    const BaseCooldown =
        GetFunctionalEffectCooldown(
            Effect
        );

    if (BaseCooldown <= 0) {
        return 0;
    }

    const Accelerator =
        GetStrongestFunctionalEffectAffectingPlot(
            SaveData,
            GardenIndex,
            PlotIndex,
            "CooldownReduction",
            AtTime
        );

    const Reduction = Math.max(
        0,
        Math.min(
            1,
            GetFunctionalEffectAmount(
                Accelerator?.Effect
            )
        )
    );

    return Math.max(
        FunctionalEffectMinimumCooldown,
        Math.floor(
            BaseCooldown *
            (1 - Reduction)
        )
    );
}


function GetFunctionalEffectAmount(
    Effect,
    Fallback = 0
) {
    const Amount = Number(
        Effect?.Amount
    );

    return Number.isFinite(Amount)
        ? Amount
        : Fallback;
}


function GetFunctionalEffectKey(
    Effect,
    EffectIndex
) {
    const ExplicitKey =
        typeof Effect?.Key === "string"
            ? Effect.Key.trim()
            : "";

    if (ExplicitKey.length > 0) {
        return ExplicitKey;
    }

    return (
        String(
            Effect?.Type ?? "Effect"
        ) +
        ":" +
        String(EffectIndex)
    );
}


function RegisterFunctionalEffectHandler(
    Type,
    Handler
) {
    const NormalizedType =
        String(Type ?? "").trim();

    if (
        NormalizedType.length === 0 ||
        typeof Handler !== "function"
    ) {
        return false;
    }

    FunctionalEffectHandlers.set(
        NormalizedType,
        Handler
    );

    return true;
}


function UnregisterFunctionalEffectHandler(
    Type
) {
    return FunctionalEffectHandlers.delete(
        String(Type ?? "")
    );
}


function GetFunctionalEffectHandler(
    Type
) {
    return FunctionalEffectHandlers.get(
        String(Type ?? "")
    ) ?? null;
}


function HasFunctionalEffectHandler(
    Type
) {
    return (
        GetFunctionalEffectHandler(
            Type
        ) !== null
    );
}


function GetFunctionalGarden(
    SaveData,
    GardenIndex
) {
    if (
        !Array.isArray(
            SaveData?.Gardens
        )
    ) {
        return null;
    }

    return SaveData.Gardens[
        GardenIndex
    ] ?? null;
}


function GetFunctionalPlotCoordinates(
    Garden,
    PlotIndex
) {
    const Width = Math.max(
        1,
        Math.floor(
            Number(Garden?.Width) || 1
        )
    );

    return {
        X: PlotIndex % Width,
        Y: Math.floor(
            PlotIndex / Width
        )
    };
}


function GetFunctionalPlotIndex(
    Garden,
    X,
    Y
) {
    const Width = Math.max(
        1,
        Math.floor(
            Number(Garden?.Width) || 1
        )
    );

    const Height = Math.max(
        1,
        Math.floor(
            Number(Garden?.Height) || 1
        )
    );

    if (
        X < 0 ||
        Y < 0 ||
        X >= Width ||
        Y >= Height
    ) {
        return null;
    }

    return Y * Width + X;
}


function GetFunctionalPlotRotation(
    Plot
) {
    const Rotation = String(
        Plot?.Rotation ?? "East"
    );

    return FunctionalDirectionOffsets[
        Rotation
    ] !== undefined
        ? Rotation
        : "East";
}


function GetFunctionalOffsetIndexes(
    Garden,
    PlotIndex,
    Offsets
) {
    const Coordinates =
        GetFunctionalPlotCoordinates(
            Garden,
            PlotIndex
        );

    const Results = [];

    for (const [OffsetX, OffsetY] of Offsets) {
        const TargetIndex =
            GetFunctionalPlotIndex(
                Garden,
                Coordinates.X + OffsetX,
                Coordinates.Y + OffsetY
            );

        if (TargetIndex !== null) {
            Results.push(TargetIndex);
        }
    }

    return Results;
}


function GetFunctionalAreaPlotIndexes(
    SaveData,
    GardenIndex,
    OriginPlotIndex,
    Area,
    Rotation = null
) {
    const Garden =
        GetFunctionalGarden(
            SaveData,
            GardenIndex
        );

    if (Garden === null) {
        return [];
    }

    const NormalizedArea =
        FunctionalEffectAreas.includes(
            Area
        )
            ? Area
            : "Front";

    if (NormalizedArea === "Farm") {
        return Array.from(
            {
                length:
                    Garden.Plots?.length ?? 0
            },
            (_, PlotIndex) => PlotIndex
        );
    }

    if (NormalizedArea === "Cardinal") {
        return GetFunctionalOffsetIndexes(
            Garden,
            OriginPlotIndex,
            FunctionalCardinalOffsets
        );
    }

    if (NormalizedArea === "Adjacent") {
        return GetFunctionalOffsetIndexes(
            Garden,
            OriginPlotIndex,
            FunctionalAdjacentOffsets
        );
    }

    const Direction =
        Rotation === null
            ? GetFunctionalPlotRotation(
                Garden.Plots?.[
                    OriginPlotIndex
                ]
            )
            : GetFunctionalPlotRotation({
                Rotation
            });

    const [DirectionX, DirectionY] =
        FunctionalDirectionOffsets[
            Direction
        ];

    const Multiplier =
        NormalizedArea === "Behind"
            ? -1
            : 1;

    return GetFunctionalOffsetIndexes(
        Garden,
        OriginPlotIndex,
        [[
            DirectionX * Multiplier,
            DirectionY * Multiplier
        ]]
    );
}


function GetFunctionalAreaTargets(
    SaveData,
    GardenIndex,
    OriginPlotIndex,
    Area,
    Rotation = null
) {
    const Garden =
        GetFunctionalGarden(
            SaveData,
            GardenIndex
        );

    if (Garden === null) {
        return [];
    }

    return GetFunctionalAreaPlotIndexes(
        SaveData,
        GardenIndex,
        OriginPlotIndex,
        Area,
        Rotation
    ).map(
        PlotIndex => ({
            GardenIndex,
            PlotIndex,
            Plot:
                Garden.Plots[
                    PlotIndex
                ] ?? null
        })
    );
}


function IsFunctionalPlantMatureAtTime(
    Plot,
    Plant,
    AtTime
) {
    if (
        Plot === null ||
        Plant === null ||
        Plant === undefined
    ) {
        return false;
    }

    const GrowthTime = Math.max(
        0,
        Number(
            Plant.GrowthTime ?? 0
        ) || 0
    );

    return (
        Number(AtTime) -
        Number(
            Plot.PlantedAt ?? 0
        ) >= GrowthTime
    );
}


function EnsureFunctionalCooldowns(
    Plot
) {
    if (
        Plot === null ||
        typeof Plot !== "object" ||
        Array.isArray(Plot)
    ) {
        return null;
    }

    if (
        !IsFunctionalPlainObject(
            Plot.FunctionalCooldowns
        )
    ) {
        Plot.FunctionalCooldowns = {};
    }

    return Plot.FunctionalCooldowns;
}


function NormalizeFunctionalCooldownEntry(
    Value
) {
    if (
        Number.isFinite(
            Number(Value)
        )
    ) {
        return {
            StartedAt: 0,
            Until: Math.max(
                0,
                Math.floor(
                    Number(Value)
                )
            )
        };
    }

    if (!IsFunctionalPlainObject(Value)) {
        return null;
    }

    const StartedAt = Math.max(
        0,
        Math.floor(
            Number(
                Value.StartedAt ?? 0
            ) || 0
        )
    );

    const Until = Math.max(
        StartedAt,
        Math.floor(
            Number(
                Value.Until ?? 0
            ) || 0
        )
    );

    if (Until <= 0) {
        return null;
    }

    return {
        StartedAt,
        Until
    };
}


function GetFunctionalEffectCooldownState(
    Plot,
    Effect,
    EffectIndex,
    AtTime
) {
    const Cooldowns =
        EnsureFunctionalCooldowns(
            Plot
        );

    if (Cooldowns === null) {
        return null;
    }

    const EffectKey =
        GetFunctionalEffectKey(
            Effect,
            EffectIndex
        );

    const Entry =
        NormalizeFunctionalCooldownEntry(
            Cooldowns[EffectKey]
        );

    if (Entry === null) {
        delete Cooldowns[EffectKey];
        return null;
    }

    Cooldowns[EffectKey] = Entry;

    const Duration = Math.max(
        1,
        Entry.Until -
        Entry.StartedAt
    );

    const Progress = Math.max(
        0,
        Math.min(
            (
                Number(AtTime) -
                Entry.StartedAt
            ) / Duration,
            1
        )
    );

    return {
        Key: EffectKey,
        StartedAt: Entry.StartedAt,
        Until: Entry.Until,
        Remaining: Math.max(
            0,
            Entry.Until -
            Number(AtTime)
        ),
        Progress,
        Ready:
            Number(AtTime) >=
            Entry.Until
    };
}


function StartFunctionalEffectCooldown(
    Plot,
    Effect,
    EffectIndex,
    AtTime,
    ResolvedCooldown = null
) {
    const Cooldown =
        ResolvedCooldown === null
            ? GetFunctionalEffectCooldown(
                Effect
            )
            : Math.max(
                0,
                Math.floor(
                    Number(
                        ResolvedCooldown
                    ) || 0
                )
            );

    if (Cooldown <= 0) {
        return null;
    }

    const Cooldowns =
        EnsureFunctionalCooldowns(
            Plot
        );

    if (Cooldowns === null) {
        return null;
    }

    const EffectKey =
        GetFunctionalEffectKey(
            Effect,
            EffectIndex
        );

    const StartedAt = Math.max(
        0,
        Math.floor(
            Number(AtTime) || 0
        )
    );

    Cooldowns[EffectKey] = {
        StartedAt,
        Until:
            StartedAt + Cooldown
    };

    return GetFunctionalEffectCooldownState(
        Plot,
        Effect,
        EffectIndex,
        AtTime
    );
}


function IsFunctionalEffectOnCooldown(
    Plot,
    Effect,
    EffectIndex,
    AtTime
) {
    const State =
        GetFunctionalEffectCooldownState(
            Plot,
            Effect,
            EffectIndex,
            AtTime
        );

    return (
        State !== null &&
        !State.Ready
    );
}


function GetFunctionalPlantCooldownDisplayState(
    Plot,
    Plant,
    AtTime
) {
    if (
        !IsFunctionalPlantMatureAtTime(
            Plot,
            Plant,
            AtTime
        )
    ) {
        return null;
    }

    let BestState = null;

    const Effects =
        GetPlantFunctionalEffects(
            Plant
        );

    Effects.forEach(
        (Effect, EffectIndex) => {
            if (
                !IsFunctionalEffectActive(
                    Effect
                )
            ) {
                return;
            }

            const State =
                GetFunctionalEffectCooldownState(
                    Plot,
                    Effect,
                    EffectIndex,
                    AtTime
                );

            if (
                State === null ||
                State.Ready
            ) {
                return;
            }

            if (
                BestState === null ||
                State.Until <
                    BestState.Until
            ) {
                BestState = {
                    ...State,
                    Effect,
                    EffectIndex
                };
            }
        }
    );

    return BestState;
}


function GetFunctionalEffectsAffectingPlot(
    SaveData,
    GardenIndex,
    TargetPlotIndex,
    Type,
    AtTime
) {
    const Garden =
        GetFunctionalGarden(
            SaveData,
            GardenIndex
        );

    if (Garden === null) {
        return [];
    }

    const Results = [];

    Garden.Plots.forEach(
        (SourcePlot, SourcePlotIndex) => {
            if (SourcePlot === null) {
                return;
            }

            const SourcePlant =
                Plants?.[
                    SourcePlot.Plant
                ];

            if (SourcePlant === undefined) {
                return;
            }

            const Effects =
                GetPlantFunctionalEffects(
                    SourcePlant
                );

            Effects.forEach(
                (Effect, EffectIndex) => {
                    if (
                        String(
                            Effect.Type
                        ) !== String(Type)
                    ) {
                        return;
                    }

                    if (
                        DoesFunctionalEffectRequireMaturity(
                            Effect
                        ) &&
                        !IsFunctionalPlantMatureAtTime(
                            SourcePlot,
                            SourcePlant,
                            AtTime
                        )
                    ) {
                        return;
                    }

                    const Area =
                        GetFunctionalEffectArea(
                            Effect
                        );

                    const Targets =
                        GetFunctionalAreaPlotIndexes(
                            SaveData,
                            GardenIndex,
                            SourcePlotIndex,
                            Area
                        );

                    if (
                        !Targets.includes(
                            TargetPlotIndex
                        )
                    ) {
                        return;
                    }

                    Results.push({
                        GardenIndex,
                        SourcePlotIndex,
                        SourcePlot,
                        SourcePlant,
                        Effect,
                        EffectIndex
                    });
                }
            );
        }
    );

    return Results;
}


function GetStrongestFunctionalEffectAffectingPlot(
    SaveData,
    GardenIndex,
    TargetPlotIndex,
    Type,
    AtTime
) {
    const Effects =
        GetFunctionalEffectsAffectingPlot(
            SaveData,
            GardenIndex,
            TargetPlotIndex,
            Type,
            AtTime
        );

    if (Effects.length === 0) {
        return null;
    }

    return Effects.reduce(
        (Best, Candidate) =>
            Best === null ||
            GetFunctionalEffectAmount(
                Candidate.Effect
            ) >
                GetFunctionalEffectAmount(
                    Best.Effect
                )
                ? Candidate
                : Best,
        null
    );
}


function GetStrongestFunctionalEffectAffectingAnyPlot(
    SaveData,
    GardenIndex,
    TargetPlotIndexes,
    Type,
    AtTime
) {
    let Best = null;

    for (const PlotIndex of TargetPlotIndexes) {
        const Candidate =
            GetStrongestFunctionalEffectAffectingPlot(
                SaveData,
                GardenIndex,
                PlotIndex,
                Type,
                AtTime
            );

        if (
            Candidate !== null &&
            (
                Best === null ||
                GetFunctionalEffectAmount(
                    Candidate.Effect
                ) >
                    GetFunctionalEffectAmount(
                        Best.Effect
                    )
            )
        ) {
            Best = Candidate;
        }
    }

    return Best;
}



function DoesFunctionalPlantHaveEffectType(
    Plant,
    Type
) {
    return GetPlantFunctionalEffects(
        Plant
    ).some(
        Effect =>
            String(Effect.Type) ===
            String(Type)
    );
}


function CanFunctionalPlantUseAssignedSeed(
    Plant
) {
    return DoesFunctionalPlantHaveEffectType(
        Plant,
        "Plant"
    );
}


function GetFunctionalPercentageAmount(
    Effect,
    Fallback = 0
) {
    return Math.max(
        0,
        Math.min(
            1,
            GetFunctionalEffectAmount(
                Effect,
                Fallback
            )
        )
    );
}


function GetFunctionalRandomItem(
    SaveData,
    Items
) {
    if (!Array.isArray(Items) || Items.length === 0) {
        return null;
    }

    if (Items.length === 1) {
        return Items[0];
    }

    const Random =
        typeof GetSimulationRandom === "function"
            ? GetSimulationRandom(
                SaveData
            )
            : Math.random();

    return Items[
        Math.min(
            Items.length - 1,
            Math.floor(
                Random * Items.length
            )
        )
    ];
}


function AddFunctionalCurrencyReward(
    SaveData,
    Currency,
    Amount
) {
    const RewardAmount = Number(
        Amount
    );

    if (
        !Number.isFinite(RewardAmount) ||
        RewardAmount <= 0
    ) {
        return 0;
    }

    SaveData.Currency ??= {};
    SaveData.Currency[Currency] ??= 0;
    SaveData.Currency[Currency] += RewardAmount;

    SaveData.Statistics ??= {};
    SaveData.Statistics.CurrencyEarned ??= {};
    SaveData.Statistics.CurrencyEarned[
        Currency
    ] ??= 0;
    SaveData.Statistics.CurrencyEarned[
        Currency
    ] += RewardAmount;

    return RewardAmount;
}


function IsGardenPlotHarvestDisabled(
    SaveData,
    GardenIndex,
    PlotIndex,
    AtTime
) {
    return (
        GetStrongestFunctionalEffectAffectingPlot(
            SaveData,
            GardenIndex,
            PlotIndex,
            "DisableHarvest",
            AtTime
        ) !== null
    );
}


function IsGardenPlotMutationDisabled(
    SaveData,
    GardenIndex,
    PlotIndex,
    AtTime
) {
    return (
        GetStrongestFunctionalEffectAffectingPlot(
            SaveData,
            GardenIndex,
            PlotIndex,
            "DisableMutation",
            AtTime
        ) !== null
    );
}


function DoesMutationPatternInvolveDisableMutation(
    SaveData,
    GardenIndex,
    OriginX,
    OriginY,
    Pattern
) {
    const Garden =
        GetFunctionalGarden(
            SaveData,
            GardenIndex
        );

    if (
        Garden === null ||
        !Array.isArray(Pattern)
    ) {
        return false;
    }

    for (
        let LocalY = 0;
        LocalY < Pattern.length;
        LocalY++
    ) {
        const Row = Pattern[LocalY];

        if (!Array.isArray(Row)) {
            continue;
        }

        for (
            let LocalX = 0;
            LocalX < Row.length;
            LocalX++
        ) {
            const Matcher = Row[LocalX];

            if (
                Matcher === null ||
                Matcher === "Any" ||
                Matcher === "Empty"
            ) {
                continue;
            }

            const PlotIndex =
                GetFunctionalPlotIndex(
                    Garden,
                    OriginX + LocalX,
                    OriginY + LocalY
                );

            if (PlotIndex === null) {
                continue;
            }

            const Plot =
                Garden.Plots?.[PlotIndex] ?? null;

            if (Plot === null) {
                continue;
            }

            const Plant =
                Plants?.[Plot.Plant];

            if (
                Plant !== undefined &&
                DoesFunctionalPlantHaveEffectType(
                    Plant,
                    "DisableMutation"
                )
            ) {
                return true;
            }
        }
    }

    return false;
}


function GetGardenPlotGrowthAdvance(
    SaveData,
    GardenIndex,
    PlotIndex,
    AtTime
) {
    const Effect =
        GetStrongestFunctionalEffectAffectingPlot(
            SaveData,
            GardenIndex,
            PlotIndex,
            "GrowthAdvance",
            AtTime
        );

    return GetFunctionalPercentageAmount(
        Effect?.Effect
    );
}


function GetGardenPlotHarvestYieldBonus(
    SaveData,
    GardenIndex,
    PlotIndex,
    AtTime
) {
    const Effect =
        GetStrongestFunctionalEffectAffectingPlot(
            SaveData,
            GardenIndex,
            PlotIndex,
            "HarvestYieldBonus",
            AtTime
        );

    return GetFunctionalPercentageAmount(
        Effect?.Effect
    );
}


function PlantGardenPlot(
    SaveData,
    GardenIndex,
    PlotIndex,
    PlantKey,
    AtTime,
    Options = {}
) {
    const Garden =
        GetFunctionalGarden(
            SaveData,
            GardenIndex
        );

    const Plant =
        Plants?.[PlantKey];

    if (
        Garden === null ||
        Plant === undefined ||
        Garden.Plots?.[PlotIndex] !== null
    ) {
        return {
            Changed: false,
            Planted: false
        };
    }

    const ConsumeSeed =
        Options.ConsumeSeed === true;

    if (ConsumeSeed) {
        if (
            typeof TakeSeed !== "function" ||
            !TakeSeed(
                SaveData,
                Plant.Id,
                1
            )
        ) {
            return {
                Changed: false,
                Planted: false,
                MissingSeed: true
            };
        }
    }

    const GrowthAdvance =
        Options.ApplyGrowthAdvance === false
            ? 0
            : GetGardenPlotGrowthAdvance(
                SaveData,
                GardenIndex,
                PlotIndex,
                AtTime
            );

    const GrowthTime = Math.max(
        0,
        Number(
            Plant.GrowthTime ?? 0
        ) || 0
    );

    const PlantedAt =
        Number(AtTime) -
        GrowthTime * GrowthAdvance;

    const Rotation =
        FunctionalDirectionOffsets[
            Options.Rotation
        ] !== undefined
            ? Options.Rotation
            : "East";

    Garden.Plots[PlotIndex] = {
        Plant: PlantKey,
        PlantedAt,
        Rotation
    };

    return {
        Changed: true,
        Planted: true,
        PlantKey,
        PlotIndex,
        GrowthAdvance,
        PlantedAt
    };
}


function HarvestGardenPlot(
    SaveData,
    GardenIndex,
    PlotIndex,
    AtTime,
    Options = {}
) {
    const Garden =
        GetFunctionalGarden(
            SaveData,
            GardenIndex
        );

    const Plot =
        Garden?.Plots?.[PlotIndex] ?? null;

    if (Plot === null) {
        return {
            Changed: false,
            Harvested: false
        };
    }

    const Plant =
        Plants?.[Plot.Plant];

    if (
        Plant === undefined ||
        !IsFunctionalPlantMatureAtTime(
            Plot,
            Plant,
            AtTime
        )
    ) {
        return {
            Changed: false,
            Harvested: false,
            Immature: Plant !== undefined
        };
    }

    if (
        Options.ExcludeFunctional === true &&
        IsFunctionalPlant(
            Plant
        )
    ) {
        return {
            Changed: false,
            Harvested: false,
            Excluded: true
        };
    }

    if (
        IsGardenPlotHarvestDisabled(
            SaveData,
            GardenIndex,
            PlotIndex,
            AtTime
        )
    ) {
        return {
            Changed: false,
            Harvested: false,
            Disabled: true
        };
    }

    const BaseReward =
        typeof GetPlantHarvestReward === "function"
            ? GetPlantHarvestReward(
                SaveData,
                Plant.Id
            )
            : null;

    if (BaseReward === null) {
        return {
            Changed: false,
            Harvested: false,
            RewardUnavailable: true
        };
    }

    const YieldBonus =
        GetGardenPlotHarvestYieldBonus(
            SaveData,
            GardenIndex,
            PlotIndex,
            AtTime
        );

    const RewardAmount = Math.ceil(
        BaseReward *
        (1 + YieldBonus)
    );

    AddFunctionalCurrencyReward(
        SaveData,
        "Dew",
        RewardAmount
    );

    Garden.Plots[PlotIndex] = null;

    return {
        Changed: true,
        Harvested: true,
        Plant,
        PlantKey: Plot.Plant,
        Rotation:
            GetFunctionalPlotRotation(
                Plot
            ),
        RewardAmount,
        YieldBonus
    };
}


function GetFunctionalEligibleSourceTargets(
    SaveData,
    Targets,
    AtTime,
    RequireMature = true
) {
    return Targets.filter(
        Target => {
            const Plot = Target.Plot;

            if (Plot === null) {
                return false;
            }

            const Plant =
                Plants?.[Plot.Plant];

            if (Plant === undefined) {
                return false;
            }

            return (
                !RequireMature ||
                IsFunctionalPlantMatureAtTime(
                    Plot,
                    Plant,
                    AtTime
                )
            );
        }
    );
}


function SelectFunctionalTarget(
    SaveData,
    Targets,
    Random
) {
    if (Targets.length === 0) {
        return null;
    }

    return Random === true
        ? GetFunctionalRandomItem(
            SaveData,
            Targets
        )
        : Targets[0];
}


function HandleFunctionalHarvest(
    Context
) {
    const Targets =
        Context.GetTargets();

    let Changed = false;

    for (const Target of Targets) {
        const Result =
            HarvestGardenPlot(
                Context.SaveData,
                Target.GardenIndex,
                Target.PlotIndex,
                Context.AtTime,
                {
                    ExcludeFunctional:
                        Context.Effect.ExcludeFunctional === true
                }
            );

        Changed =
            Changed ||
            Result.Changed === true;
    }

    return {Changed};
}


function HandleFunctionalDuplicate(
    Context
) {
    const SourceArea =
        GetFunctionalEffectArea(
            Context.Effect,
            "Source",
            "Behind"
        );

    const TargetArea =
        GetFunctionalEffectArea(
            Context.Effect,
            "Target",
            "Front"
        );

    const Sources =
        GetFunctionalEligibleSourceTargets(
            Context.SaveData,
            GetFunctionalAreaTargets(
                Context.SaveData,
                Context.GardenIndex,
                Context.PlotIndex,
                SourceArea
            ),
            Context.AtTime,
            Context.Effect.RequireMatureSource !== false
        );

    const EmptyTargets =
        GetFunctionalAreaTargets(
            Context.SaveData,
            Context.GardenIndex,
            Context.PlotIndex,
            TargetArea
        ).filter(
            Target => Target.Plot === null
        );

    const Source =
        SelectFunctionalTarget(
            Context.SaveData,
            Sources,
            Context.Effect.RandomSource === true
        );

    const Target =
        SelectFunctionalTarget(
            Context.SaveData,
            EmptyTargets,
            Context.Effect.RandomTarget === true
        );

    if (
        Source === null ||
        Target === null
    ) {
        return {Changed: false};
    }

    return PlantGardenPlot(
        Context.SaveData,
        Context.GardenIndex,
        Target.PlotIndex,
        Source.Plot.Plant,
        Context.AtTime,
        {
            ConsumeSeed: false
        }
    );
}


function HandleFunctionalPlant(
    Context
) {
    const AssignedSeed =
        typeof Context.Plot.AssignedSeed === "string"
            ? Context.Plot.AssignedSeed
            : null;

    if (
        AssignedSeed === null ||
        Plants?.[AssignedSeed] === undefined
    ) {
        return {Changed: false};
    }

    const TargetArea =
        GetFunctionalEffectArea(
            Context.Effect,
            "Target",
            "Front"
        );

    const EmptyTargets =
        GetFunctionalAreaTargets(
            Context.SaveData,
            Context.GardenIndex,
            Context.PlotIndex,
            TargetArea
        ).filter(
            Target => Target.Plot === null
        );

    const Target =
        SelectFunctionalTarget(
            Context.SaveData,
            EmptyTargets,
            Context.Effect.RandomTarget === true
        );

    if (Target === null) {
        return {Changed: false};
    }

    return PlantGardenPlot(
        Context.SaveData,
        Context.GardenIndex,
        Target.PlotIndex,
        AssignedSeed,
        Context.AtTime,
        {
            ConsumeSeed: true
        }
    );
}


function HandleFunctionalReplant(
    Context
) {
    const Targets =
        Context.GetTargets();

    let Changed = false;

    for (const Target of Targets) {
        const ExistingPlot = Target.Plot;

        if (ExistingPlot === null) {
            continue;
        }

        const ExistingPlant =
            Plants?.[ExistingPlot.Plant];

        if (ExistingPlant === undefined) {
            continue;
        }

        const ConsumeSeed =
            Context.Effect.ConsumeSeed !== false;

        if (
            ConsumeSeed &&
            (
                typeof GetSeedCount !== "function" ||
                GetSeedCount(
                    Context.SaveData,
                    ExistingPlant.Id
                ) < 1
            )
        ) {
            continue;
        }

        const Rotation =
            GetFunctionalPlotRotation(
                ExistingPlot
            );

        const HarvestResult =
            HarvestGardenPlot(
                Context.SaveData,
                Target.GardenIndex,
                Target.PlotIndex,
                Context.AtTime,
                {
                    ExcludeFunctional:
                        Context.Effect.ExcludeFunctional === true
                }
            );

        if (!HarvestResult.Harvested) {
            continue;
        }

        const PlantResult =
            PlantGardenPlot(
                Context.SaveData,
                Target.GardenIndex,
                Target.PlotIndex,
                HarvestResult.PlantKey,
                Context.AtTime,
                {
                    ConsumeSeed,
                    Rotation
                }
            );

        Changed =
            Changed ||
            HarvestResult.Changed === true ||
            PlantResult.Changed === true;
    }

    return {Changed};
}


function SetFunctionalPlantAssignedSeed(
    Plot,
    PlantKey
) {
    if (
        Plot === null ||
        typeof Plot !== "object" ||
        Plants?.[PlantKey] === undefined
    ) {
        return false;
    }

    Plot.AssignedSeed = PlantKey;
    return true;
}


function ClearFunctionalPlantAssignedSeed(
    Plot
) {
    if (
        Plot === null ||
        typeof Plot !== "object"
    ) {
        return false;
    }

    delete Plot.AssignedSeed;
    return true;
}


RegisterFunctionalEffectHandler(
    "Harvest",
    HandleFunctionalHarvest
);

RegisterFunctionalEffectHandler(
    "Duplicate",
    HandleFunctionalDuplicate
);

RegisterFunctionalEffectHandler(
    "Plant",
    HandleFunctionalPlant
);

RegisterFunctionalEffectHandler(
    "Replant",
    HandleFunctionalReplant
);


function CreateFunctionalProcessingResult() {
    return {
        Attempted: false,
        Changed: false,
        Activations: []
    };
}


function MergeFunctionalHandlerResult(
    Result,
    HandlerResult
) {
    if (HandlerResult === true) {
        Result.Changed = true;
        return;
    }

    if (!IsFunctionalPlainObject(HandlerResult)) {
        return;
    }

    Result.Changed =
        Result.Changed ||
        HandlerResult.Changed === true;
}


function ProcessFunctionalEffectsAtTime(
    SaveData,
    AtTime
) {
    const Result =
        CreateFunctionalProcessingResult();

    if (
        !Array.isArray(
            SaveData?.Gardens
        )
    ) {
        return Result;
    }

    for (
        let GardenIndex = 0;
        GardenIndex < SaveData.Gardens.length;
        GardenIndex++
    ) {
        const Garden =
            SaveData.Gardens[
                GardenIndex
            ];

        for (
            let PlotIndex = 0;
            PlotIndex < Garden.Plots.length;
            PlotIndex++
        ) {
            const Plot =
                Garden.Plots[
                    PlotIndex
                ];

            if (Plot === null) {
                continue;
            }

            const Plant =
                Plants?.[Plot.Plant];

            if (Plant === undefined) {
                continue;
            }

            const Effects =
                GetPlantFunctionalEffects(
                    Plant
                );

            for (
                let EffectIndex = 0;
                EffectIndex < Effects.length;
                EffectIndex++
            ) {
                const Effect =
                    Effects[EffectIndex];

                if (
                    !IsFunctionalEffectActive(
                        Effect
                    )
                ) {
                    continue;
                }

                if (
                    DoesFunctionalEffectRequireMaturity(
                        Effect
                    ) &&
                    !IsFunctionalPlantMatureAtTime(
                        Plot,
                        Plant,
                        AtTime
                    )
                ) {
                    continue;
                }

                const Handler =
                    GetFunctionalEffectHandler(
                        Effect.Type
                    );

                if (Handler === null) {
                    continue;
                }

                if (
                    IsFunctionalEffectOnCooldown(
                        Plot,
                        Effect,
                        EffectIndex,
                        AtTime
                    )
                ) {
                    continue;
                }

                Result.Attempted = true;

                const ResolvedCooldown =
                    GetResolvedFunctionalEffectCooldown(
                        SaveData,
                        GardenIndex,
                        PlotIndex,
                        Effect,
                        AtTime
                    );

                StartFunctionalEffectCooldown(
                    Plot,
                    Effect,
                    EffectIndex,
                    AtTime,
                    ResolvedCooldown
                );

                const HandlerResult =
                    Handler({
                        SaveData,
                        GardenIndex,
                        Garden,
                        PlotIndex,
                        Plot,
                        Plant,
                        Effect,
                        EffectIndex,
                        AtTime,
                        GetTargets: (
                            Area = null
                        ) =>
                            GetFunctionalAreaTargets(
                                SaveData,
                                GardenIndex,
                                PlotIndex,
                                Area ??
                                GetFunctionalEffectArea(
                                    Effect
                                )
                            )
                    });

                MergeFunctionalHandlerResult(
                    Result,
                    HandlerResult
                );

                Result.Activations.push({
                    GardenIndex,
                    PlotIndex,
                    PlantKey:
                        Plot.Plant,
                    Type:
                        Effect.Type,
                    EffectIndex,
                    AtTime
                });

                if (
                    Garden.Plots[PlotIndex] !==
                        Plot
                ) {
                    break;
                }
            }
        }
    }

    return Result;
}


function GetNextFunctionalEffectEventTime(
    SaveData,
    CurrentTime,
    TargetTime
) {
    if (
        !Array.isArray(
            SaveData?.Gardens
        )
    ) {
        return null;
    }

    let NextTime = null;

    for (
        let GardenIndex = 0;
        GardenIndex < SaveData.Gardens.length;
        GardenIndex++
    ) {
        const Garden =
            SaveData.Gardens[
                GardenIndex
            ];

        for (
            let PlotIndex = 0;
            PlotIndex < Garden.Plots.length;
            PlotIndex++
        ) {
            const Plot =
                Garden.Plots[
                    PlotIndex
                ];

            if (Plot === null) {
                continue;
            }

            const Plant =
                Plants?.[Plot.Plant];

            if (Plant === undefined) {
                continue;
            }

            const Effects =
                GetPlantFunctionalEffects(
                    Plant
                );

            if (Effects.length === 0) {
                continue;
            }

            const MaturityTime =
                Number(
                    Plot.PlantedAt ?? 0
                ) +
                Math.max(
                    0,
                    Number(
                        Plant.GrowthTime ?? 0
                    ) || 0
                );

            for (
                let EffectIndex = 0;
                EffectIndex < Effects.length;
                EffectIndex++
            ) {
                const Effect =
                    Effects[EffectIndex];

                if (
                    !IsFunctionalEffectActive(
                        Effect
                    ) ||
                    !HasFunctionalEffectHandler(
                        Effect.Type
                    )
                ) {
                    continue;
                }

                let EventTime;

                if (
                    DoesFunctionalEffectRequireMaturity(
                        Effect
                    ) &&
                    MaturityTime > CurrentTime
                ) {
                    EventTime = MaturityTime;
                } else {
                    const CooldownState =
                        GetFunctionalEffectCooldownState(
                            Plot,
                            Effect,
                            EffectIndex,
                            CurrentTime
                        );

                    if (
                        CooldownState === null ||
                        CooldownState.Ready
                    ) {
                        EventTime = CurrentTime;
                    } else {
                        EventTime =
                            CooldownState.Until;
                    }
                }

                if (
                    EventTime <= CurrentTime ||
                    EventTime > TargetTime
                ) {
                    continue;
                }

                if (
                    NextTime === null ||
                    EventTime < NextTime
                ) {
                    NextTime = EventTime;
                }
            }
        }
    }

    return NextTime;
}
