const MaxMutationPasses = 100;


function CheckGardenMutations(
    SaveData,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    SaveData.MutationCooldowns ??= {};

    const Result = {
        Attempted: false,
        Changed: false,

        SuccessfulMutations: [],
        NewlyDiscoveredMutations: [],
        NewlyDiscoveredPlants: []
    };


    for (
        let Pass = 0;
        Pass < MaxMutationPasses;
        Pass++
    ) {
        const Candidates =
            FindGardenMutationCandidates(
                SaveData,
                AtTime
            )
                .filter(
                    Candidate =>
                        !IsMutationCandidateOnCooldown(
                            SaveData,
                            Candidate,
                            AtTime
                        )
                )
                .sort(
                    CompareMutationCandidates
                );


        if (Candidates.length === 0) {
            break;
        }


        const ReservedCells =
            new Set();

        const AcceptedCandidates = [];


        for (
            const Candidate
            of Candidates
        ) {
            if (
                Candidate.Cells.some(
                    Cell =>
                        ReservedCells.has(
                            Cell
                        )
                )
            ) {
                continue;
            }


            AcceptedCandidates.push(
                Candidate
            );


            for (
                const Cell
                of Candidate.Cells
            ) {
                ReservedCells.add(
                    Cell
                );
            }
        }


        if (
            AcceptedCandidates.length ===
            0
        ) {
            break;
        }


        let PassChanged = false;


        for (
            const Candidate
            of AcceptedCandidates
        ) {
            if (
                !DoesMutationCandidateStillMatch(
                    SaveData,
                    Candidate,
                    AtTime
                )
            ) {
                continue;
            }


            if (
                IsMutationCandidateOnCooldown(
                    SaveData,
                    Candidate,
                    AtTime
                )
            ) {
                continue;
            }


            Result.Attempted = true;

            StartMutationCandidateCooldown(
                SaveData,
                Candidate,
                AtTime
            );


            const Chance = Math.max(
                0,
                Math.min(
                    Number(
                        Candidate.Mutation.Chance ??
                        1
                    ),
                    1
                )
            );


            const Succeeded =
                GetSimulationRandom(
                    SaveData
                ) < Chance;


            if (Succeeded) {
                const NewlyDiscovered =
                    DiscoverMutationResult(
                        SaveData,
                        Candidate.Mutation
                    );


                const Changed =
                    ApplyMutationResult(
                        SaveData,
                        Candidate,
                        Candidate.Success,
                        AtTime
                    );


                Result.SuccessfulMutations.push(
                    Candidate.Mutation.Id
                );

                Result.NewlyDiscoveredMutations.push(
                    ...NewlyDiscovered.Mutations
                );

                Result.NewlyDiscoveredPlants.push(
                    ...NewlyDiscovered.Plants
                );


                if (Changed) {
                    Result.Changed = true;
                    PassChanged = true;
                }
            } else {
                const Changed =
                    ApplyMutationFailure(
                        SaveData,
                        Candidate,
                        AtTime
                    );


                if (Changed) {
                    Result.Changed = true;
                    PassChanged = true;
                }
            }
        }


        /*
         * Only rescan immediately if the board
         * actually changed. Failed attempts still
         * receive their cooldown, but do not cause
         * lower-priority overlapping recipes to be
         * attempted immediately afterwards.
         */

        if (!PassChanged) {
            break;
        }
    }


    Result.SuccessfulMutations = [
        ...new Set(
            Result.SuccessfulMutations
        )
    ];

    Result.NewlyDiscoveredMutations = [
        ...new Set(
            Result.NewlyDiscoveredMutations
        )
    ];

    Result.NewlyDiscoveredPlants = [
        ...new Set(
            Result.NewlyDiscoveredPlants
        )
    ];


    return Result;
}


function FindGardenMutationCandidates(
    SaveData,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    const Candidates = [];


    for (
        const Mutation
        of Object.values(
            MutationSets
        )
    ) {
        for (
            const Orientation
            of GetMutationOrientations(
                Mutation
            )
        ) {
            const PatternHeight =
                Orientation.Pattern.length;

            const PatternWidth =
                Orientation.Pattern[0]
                    ?.length ?? 0;


            if (
                PatternWidth === 0 ||
                PatternHeight === 0 ||
                PatternWidth >
                    SaveData.Garden.Width ||
                PatternHeight >
                    SaveData.Garden.Height
            ) {
                continue;
            }


            for (
                let OriginY = 0;
                OriginY <=
                    SaveData.Garden.Height -
                    PatternHeight;
                OriginY++
            ) {
                for (
                    let OriginX = 0;
                    OriginX <=
                        SaveData.Garden.Width -
                        PatternWidth;
                    OriginX++
                ) {
                    const Candidate =
                        CreateMutationCandidate(
                            SaveData,
                            Mutation,
                            Orientation,
                            OriginX,
                            OriginY,
                            AtTime
                        );


                    if (Candidate !== null) {
                        Candidates.push(
                            Candidate
                        );
                    }
                }
            }
        }
    }


    return Candidates;
}


function CreateMutationCandidate(
    SaveData,
    Mutation,
    Orientation,
    OriginX,
    OriginY,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    const Captures = {};
    const Cells = [];


    for (
        let LocalY = 0;
        LocalY <
            Orientation.Pattern.length;
        LocalY++
    ) {
        for (
            let LocalX = 0;
            LocalX <
                Orientation.Pattern[
                    LocalY
                ].length;
            LocalX++
        ) {
            const PlotIndex =
                GetGardenPlotIndex(
                    SaveData,
                    OriginX + LocalX,
                    OriginY + LocalY
                );

            const Matcher =
                Orientation.Pattern[
                    LocalY
                ][
                    LocalX
                ];

            const Plot =
                SaveData.Garden.Plots[
                    PlotIndex
                ];


            Cells.push(
                PlotIndex
            );


            if (
                !DoesPlotMatchMutationMatcher(
                    Plot,
                    Matcher,
                    Mutation,
                    Captures,
                    AtTime
                )
            ) {
                return null;
            }
        }
    }


    return {
        Mutation: Mutation,

        Pattern:
            Orientation.Pattern,

        Success:
            Orientation.Success,

        Rotation:
            Orientation.Rotation,

        OriginX: OriginX,
        OriginY: OriginY,

        Cells: Cells,
        Captures: Captures,

        Priority:
            Number(
                Mutation.Priority ?? 0
            ),

        Specificity:
            GetMutationPatternSpecificity(
                Orientation.Pattern
            )
    };
}


function DoesMutationCandidateStillMatch(
    SaveData,
    Candidate,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    const RefreshedCandidate =
        CreateMutationCandidate(
            SaveData,
            Candidate.Mutation,
            {
                Pattern:
                    Candidate.Pattern,

                Success:
                    Candidate.Success,

                Rotation:
                    Candidate.Rotation
            },
            Candidate.OriginX,
            Candidate.OriginY,
            AtTime
        );


    if (RefreshedCandidate === null) {
        return false;
    }


    Candidate.Captures =
        RefreshedCandidate.Captures;


    return true;
}


function DoesPlotMatchMutationMatcher(
    Plot,
    Matcher,
    Mutation,
    Captures,
    AtTime
) {
    if (
        Matcher === null ||
        Matcher === "Any"
    ) {
        return true;
    }


    if (Matcher === "Empty") {
        return Plot === null;
    }


    if (Plot === null) {
        return false;
    }


    const Plant =
        Plants[Plot.Plant];

    if (Plant === undefined) {
        return false;
    }


    if (
        Mutation.AllowImmature !==
        true &&
        !IsMutationPlantMature(
            Plot,
            Plant,
            AtTime
        )
    ) {
        return false;
    }


    if (
        typeof Matcher ===
        "string"
    ) {
        return Plot.Plant === Matcher;
    }


    if (
        typeof Matcher !==
        "object"
    ) {
        return false;
    }


    if (
        typeof Matcher.Plant ===
        "string" &&
        Plot.Plant !==
            Matcher.Plant
    ) {
        return false;
    }


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


    if (
        typeof Matcher.Capture ===
        "string" &&
        Matcher.Capture.length > 0
    ) {
        Captures[
            Matcher.Capture
        ] = CloneMutationPlot(
            Plot
        );
    }


    return true;
}


function IsMutationPlantMature(
    Plot,
    Plant,
    AtTime
) {
    if (
        Number(
            Plant.GrowthTime ?? 0
        ) <= 0
    ) {
        return true;
    }


    return (
        AtTime -
        Number(
            Plot.PlantedAt ?? 0
        ) >=
        Plant.GrowthTime
    );
}


function ApplyMutationFailure(
    SaveData,
    Candidate,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    const Failure =
        Candidate.Mutation.Failure ??
        "Keep";


    if (Failure === "Keep") {
        return false;
    }


    if (Failure === "Clear") {
        let Changed = false;


        for (
            const PlotIndex
            of Candidate.Cells
        ) {
            if (
                SaveData.Garden.Plots[
                    PlotIndex
                ] !== null
            ) {
                SaveData.Garden.Plots[
                    PlotIndex
                ] = null;

                Changed = true;
            }
        }


        return Changed;
    }


    if (Array.isArray(Failure)) {
        return ApplyMutationResult(
            SaveData,
            Candidate,
            Failure,
            AtTime
        );
    }


    return false;
}


function ApplyMutationResult(
    SaveData,
    Candidate,
    ResultMatrix,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    if (!Array.isArray(ResultMatrix)) {
        return false;
    }


    const NormalizedResult =
        NormalizeMutationMatrix(
            ResultMatrix,
            Candidate.Pattern[0]
                ?.length ?? 0,
            Candidate.Pattern.length,
            "Keep"
        );


    let Changed = false;


    for (
        let LocalY = 0;
        LocalY <
            NormalizedResult.length;
        LocalY++
    ) {
        for (
            let LocalX = 0;
            LocalX <
                NormalizedResult[
                    LocalY
                ].length;
            LocalX++
        ) {
            const ResultValue =
                NormalizedResult[
                    LocalY
                ][
                    LocalX
                ];


            if (
                ResultValue === null ||
                ResultValue === "Keep"
            ) {
                continue;
            }


            const PlotIndex =
                GetGardenPlotIndex(
                    SaveData,
                    Candidate.OriginX +
                        LocalX,
                    Candidate.OriginY +
                        LocalY
                );


            const NewPlot =
                CreateMutationResultPlot(
                    ResultValue,
                    Candidate.Captures,
                    AtTime
                );


            if (
                ResultValue === "Empty"
            ) {
                if (
                    SaveData.Garden.Plots[
                        PlotIndex
                    ] !== null
                ) {
                    SaveData.Garden.Plots[
                        PlotIndex
                    ] = null;

                    Changed = true;
                }

                continue;
            }


            if (NewPlot === undefined) {
                continue;
            }


            SaveData.Garden.Plots[
                PlotIndex
            ] = NewPlot;

            Changed = true;
        }
    }


    return Changed;
}


function CreateMutationResultPlot(
    ResultValue,
    Captures,
    AtTime
) {
    if (
        typeof ResultValue ===
        "string"
    ) {
        if (
            ResultValue.startsWith(
                "$"
            )
        ) {
            const CaptureName =
                ResultValue.slice(1);

            return Captures[
                CaptureName
            ] === undefined
                ? undefined
                : CloneMutationPlot(
                    Captures[
                        CaptureName
                    ]
                );
        }


        if (
            Plants[ResultValue] ===
            undefined
        ) {
            return undefined;
        }


        return {
            Plant: ResultValue,
            PlantedAt: AtTime
        };
    }


    if (
        typeof ResultValue !==
        "object" ||
        ResultValue === null
    ) {
        return undefined;
    }


    if (
        typeof ResultValue.Plant !==
        "string"
    ) {
        return undefined;
    }


    if (
        ResultValue.Plant.startsWith(
            "$"
        )
    ) {
        const CaptureName =
            ResultValue.Plant.slice(1);

        const CapturedPlot =
            Captures[CaptureName];


        if (CapturedPlot === undefined) {
            return undefined;
        }


        return CloneMutationPlot(
            CapturedPlot
        );
    }


    if (
        Plants[
            ResultValue.Plant
        ] === undefined
    ) {
        return undefined;
    }


    return {
        Plant: ResultValue.Plant,
        PlantedAt: AtTime
    };
}


function DiscoverMutationResult(
    SaveData,
    Mutation
) {
    const NewMutations = [];
    const NewPlants = [];


    if (
        !HasDiscoveredMutation(
            SaveData,
            Mutation.Id
        )
    ) {
        DiscoverMutation(
            SaveData,
            Mutation.Id
        );

        NewMutations.push(
            Mutation.Id
        );
    }


    for (
        const PlantId
        of Mutation.Relations
            ?.PlantsCreated ?? []
    ) {
        if (
            HasDiscoveredPlant(
                SaveData,
                PlantId
            )
        ) {
            continue;
        }


        DiscoverPlant(
            SaveData,
            PlantId
        );

        NewPlants.push(
            PlantId
        );
    }


    SaveData.Discoveries.Plants.sort(
        (A, B) => A - B
    );

    SaveData.Discoveries.Mutations.sort(
        (A, B) => A - B
    );


    return {
        Mutations: NewMutations,
        Plants: NewPlants
    };
}


function CompareMutationCandidates(
    A,
    B
) {
    return (
        B.Priority - A.Priority ||
        B.Specificity -
            A.Specificity ||
        A.Mutation.Id -
            B.Mutation.Id ||
        A.OriginY - B.OriginY ||
        A.OriginX - B.OriginX ||
        A.Rotation - B.Rotation
    );
}


function GetMutationPatternSpecificity(
    Pattern
) {
    let Specificity = 0;


    for (
        const Row
        of Pattern
    ) {
        for (
            const Matcher
            of Row
        ) {
            if (
                Matcher === null ||
                Matcher === "Any"
            ) {
                continue;
            }


            if (Matcher === "Empty") {
                Specificity += 2;
                continue;
            }


            if (
                typeof Matcher ===
                "string"
            ) {
                Specificity += 8;
                continue;
            }


            if (
                typeof Matcher !==
                "object"
            ) {
                continue;
            }


            if (
                typeof Matcher.Plant ===
                "string"
            ) {
                Specificity += 8;
            }


            Specificity +=
                (
                    Matcher.Tags
                        ?.length ?? 0
                ) * 3;

            Specificity +=
                (
                    Matcher.TagsAny
                        ?.length ?? 0
                ) * 2;

            Specificity +=
                Matcher.TagsNot
                    ?.length ?? 0;
        }
    }


    return Specificity;
}


function GetMutationCandidateCooldownUntil(
    SaveData,
    Candidate
) {
    return Number(
        SaveData.MutationCooldowns[
            GetMutationCooldownKey(
                Candidate
            )
        ] ?? 0
    );
}


function IsMutationCandidateOnCooldown(
    SaveData,
    Candidate,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    return (
        GetMutationCandidateCooldownUntil(
            SaveData,
            Candidate
        ) > AtTime
    );
}


function StartMutationCandidateCooldown(
    SaveData,
    Candidate,
    AtTime = GetSimulationTime(
        SaveData
    )
) {
    const Cooldown = Math.max(
        SimulationMinimumEventInterval,
        Number(
            Candidate.Mutation.Cooldown ??
            0
        ) || 0
    );

    SaveData.MutationCooldowns[
        GetMutationCooldownKey(
            Candidate
        )
    ] = AtTime + Cooldown;
}


function GetMutationCooldownKey(
    Candidate
) {
    const Cells = [
        ...Candidate.Cells
    ].sort(
        (A, B) => A - B
    );


    return (
        Candidate.Mutation.Id +
        ":" +
        Cells.join(",")
    );
}


function GetMutationOrientations(
    Mutation
) {
    const BasePattern =
        NormalizeMutationMatrix(
            Mutation.Pattern ?? [],
            null,
            null,
            "Any"
        );


    if (BasePattern.length === 0) {
        return [];
    }


    const BaseSuccess =
        NormalizeMutationMatrix(
            Mutation.Success ?? [],
            BasePattern[0].length,
            BasePattern.length,
            "Keep"
        );


    const RotationCount =
        Mutation.Rotation === "Any"
            ? 4
            : 1;

    const Orientations = [];
    const Seen = new Set();

    let Pattern = BasePattern;
    let Success = BaseSuccess;


    for (
        let RotationIndex = 0;
        RotationIndex < RotationCount;
        RotationIndex++
    ) {
        const Signature =
            JSON.stringify(Pattern) +
            "|" +
            JSON.stringify(Success);


        if (!Seen.has(Signature)) {
            Seen.add(Signature);

            Orientations.push({
                Pattern: Pattern,
                Success: Success,
                Rotation:
                    RotationIndex * 90
            });
        }


        Pattern =
            RotateMutationMatrixClockwise(
                Pattern
            );

        Success =
            RotateMutationMatrixClockwise(
                Success
            );
    }


    return Orientations;
}


function NormalizeMutationMatrix(
    Matrix,
    Width = null,
    Height = null,
    FillValue = "Any"
) {
    if (!Array.isArray(Matrix)) {
        return [];
    }


    const TargetHeight =
        Height ?? Matrix.length;

    const TargetWidth =
        Width ?? Math.max(
            0,
            ...Matrix.map(
                Row =>
                    Array.isArray(Row)
                        ? Row.length
                        : 0
            )
        );


    const Normalized = [];


    for (
        let Y = 0;
        Y < TargetHeight;
        Y++
    ) {
        const SourceRow =
            Array.isArray(Matrix[Y])
                ? Matrix[Y]
                : [];

        const Row = [];


        for (
            let X = 0;
            X < TargetWidth;
            X++
        ) {
            Row.push(
                X < SourceRow.length
                    ? SourceRow[X]
                    : FillValue
            );
        }


        Normalized.push(
            Row
        );
    }


    return Normalized;
}


function RotateMutationMatrixClockwise(
    Matrix
) {
    if (
        Matrix.length === 0 ||
        Matrix[0].length === 0
    ) {
        return [];
    }


    const Height = Matrix.length;
    const Width = Matrix[0].length;

    const Rotated = [];


    for (
        let X = 0;
        X < Width;
        X++
    ) {
        const Row = [];


        for (
            let Y = Height - 1;
            Y >= 0;
            Y--
        ) {
            Row.push(
                Matrix[Y][X]
            );
        }


        Rotated.push(
            Row
        );
    }


    return Rotated;
}


function GetGardenPlotIndex(
    SaveData,
    X,
    Y
) {
    return (
        Y *
        SaveData.Garden.Width +
        X
    );
}


function CloneMutationPlot(
    Plot
) {
    if (Plot === null) {
        return null;
    }


    return JSON.parse(
        JSON.stringify(
            Plot
        )
    );
}
