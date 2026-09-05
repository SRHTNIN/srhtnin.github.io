const SimulationMinimumEventInterval = 1000;
const MaximumSimulationSteps = 250000;


function GetSimulationTime(
    SaveData
) {
    return GetSavedSimulationTime(
        SaveData
    );
}


function SetSimulationTime(
    SaveData,
    Time
) {
    SaveData.Simulation ??= {};

    SaveData.Simulation.LastProcessedAt =
        Math.max(
            0,
            Math.floor(
                Number(Time) || 0
            )
        );

    return SaveData.Simulation.LastProcessedAt;
}


function GetSimulationRandom(
    SaveData
) {
    SaveData.Simulation ??= {};

    let State = Number(
        SaveData.Simulation.RandomState ?? 0
    ) >>> 0;

    State = (
        State + 0x6D2B79F5
    ) >>> 0;

    SaveData.Simulation.RandomState =
        State;

    let Value = State;

    Value = Math.imul(
        Value ^ Value >>> 15,
        Value | 1
    );

    Value ^=
        Value +
        Math.imul(
            Value ^ Value >>> 7,
            Value | 61
        );

    return (
        (Value ^ Value >>> 14) >>> 0
    ) / 4294967296;
}


function MergeSimulationMutationResult(
    Target,
    Source
) {
    Target.Attempted =
        Target.Attempted ||
        Source.Attempted;

    Target.Changed =
        Target.Changed ||
        Source.Changed;

    Target.SuccessfulMutations.push(
        ...(Source.SuccessfulMutations ?? [])
    );

    Target.NewlyDiscoveredMutations.push(
        ...(Source.NewlyDiscoveredMutations ?? [])
    );

    Target.NewlyDiscoveredPlants.push(
        ...(Source.NewlyDiscoveredPlants ?? [])
    );
}


function CreateSimulationResult(
    StartTime,
    TargetTime
) {
    return {
        StartTime,
        TargetTime,
        Advanced: TargetTime > StartTime,
        Attempted: false,
        Changed: false,
        Dirty: false,
        CaughtUp: StartTime >= TargetTime,
        EndTime: StartTime,
        Steps: 0,
        SuccessfulMutations: [],
        NewlyDiscoveredMutations: [],
        NewlyDiscoveredPlants: []
    };
}


function FinalizeSimulationResult(
    Result
) {
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

    Result.Dirty =
        Result.Attempted ||
        Result.Changed;

    return Result;
}


function CheckAllGardenMutationsAtTime(
    SaveData,
    AtTime
) {
    const OriginalGardenIndex =
        SaveData.ActiveGardenIndex;

    const Result = {
        Attempted: false,
        Changed: false,
        SuccessfulMutations: [],
        NewlyDiscoveredMutations: [],
        NewlyDiscoveredPlants: []
    };

    for (
        let GardenIndex = 0;
        GardenIndex < SaveData.Gardens.length;
        GardenIndex++
    ) {
        SetActiveGardenIndex(
            SaveData,
            GardenIndex
        );

        const GardenResult =
            CheckGardenMutations(
                SaveData,
                AtTime
            );

        MergeSimulationMutationResult(
            Result,
            GardenResult
        );
    }

    SetActiveGardenIndex(
        SaveData,
        OriginalGardenIndex
    );

    return Result;
}


function GetNextPlantMaturityTime(
    SaveData,
    CurrentTime,
    TargetTime
) {
    let NextTime = null;

    for (const Garden of SaveData.Gardens) {
        for (const Plot of Garden.Plots) {
            if (Plot === null) {
                continue;
            }

            const Plant =
                Plants[Plot.Plant];

            if (Plant === undefined) {
                continue;
            }

            const GrowthTime = Math.max(
                0,
                Number(
                    Plant.GrowthTime ?? 0
                ) || 0
            );

            if (GrowthTime <= 0) {
                continue;
            }

            const MaturityTime =
                Number(
                    Plot.PlantedAt ?? 0
                ) +
                GrowthTime;

            if (
                MaturityTime <= CurrentTime ||
                MaturityTime > TargetTime
            ) {
                continue;
            }

            if (
                NextTime === null ||
                MaturityTime < NextTime
            ) {
                NextTime = MaturityTime;
            }
        }
    }

    return NextTime;
}


function GetNextMutationAttemptTime(
    SaveData,
    CurrentTime,
    TargetTime
) {
    const OriginalGardenIndex =
        SaveData.ActiveGardenIndex;

    let NextTime = null;

    for (
        let GardenIndex = 0;
        GardenIndex < SaveData.Gardens.length;
        GardenIndex++
    ) {
        SetActiveGardenIndex(
            SaveData,
            GardenIndex
        );

        const Candidates =
            FindGardenMutationCandidates(
                SaveData,
                CurrentTime
            );

        for (const Candidate of Candidates) {
            const CooldownUntil =
                GetMutationCandidateCooldownUntil(
                    SaveData,
                    Candidate
                );

            const AttemptTime =
                CooldownUntil > CurrentTime
                    ? CooldownUntil
                    : CurrentTime +
                        SimulationMinimumEventInterval;

            if (AttemptTime > TargetTime) {
                continue;
            }

            if (
                NextTime === null ||
                AttemptTime < NextTime
            ) {
                NextTime = AttemptTime;
            }
        }
    }

    SetActiveGardenIndex(
        SaveData,
        OriginalGardenIndex
    );

    return NextTime;
}


function GetNextSimulationEventTime(
    SaveData,
    CurrentTime,
    TargetTime
) {
    const MaturityTime =
        GetNextPlantMaturityTime(
            SaveData,
            CurrentTime,
            TargetTime
        );

    const MutationTime =
        GetNextMutationAttemptTime(
            SaveData,
            CurrentTime,
            TargetTime
        );

    if (MaturityTime === null) {
        return MutationTime;
    }

    if (MutationTime === null) {
        return MaturityTime;
    }

    return Math.min(
        MaturityTime,
        MutationTime
    );
}


function AdvanceGameSimulation(
    SaveData,
    TargetTime = Date.now()
) {
    const SafeTargetTime = Math.max(
        0,
        Math.floor(
            Number(TargetTime) ||
            Date.now()
        )
    );

    let CurrentTime = Math.min(
        GetSimulationTime(
            SaveData
        ),
        SafeTargetTime
    );

    const Result =
        CreateSimulationResult(
            CurrentTime,
            SafeTargetTime
        );

    SetSimulationTime(
        SaveData,
        CurrentTime
    );

    for (
        let Step = 0;
        Step < MaximumSimulationSteps;
        Step++
    ) {
        Result.Steps = Step + 1;

        const MutationResult =
            CheckAllGardenMutationsAtTime(
                SaveData,
                CurrentTime
            );

        MergeSimulationMutationResult(
            Result,
            MutationResult
        );

        if (CurrentTime >= SafeTargetTime) {
            Result.CaughtUp = true;
            break;
        }

        const NextTime =
            GetNextSimulationEventTime(
                SaveData,
                CurrentTime,
                SafeTargetTime
            );

        if (NextTime === null) {
            CurrentTime = SafeTargetTime;
            SetSimulationTime(
                SaveData,
                CurrentTime
            );
            Result.CaughtUp = true;
            break;
        }

        CurrentTime = Math.min(
            SafeTargetTime,
            Math.max(
                CurrentTime + 1,
                NextTime
            )
        );

        SetSimulationTime(
            SaveData,
            CurrentTime
        );
    }

    Result.EndTime =
        GetSimulationTime(
            SaveData
        );

    const FinalResult =
        FinalizeSimulationResult(
            Result
        );

    if (
        FinalResult.Dirty &&
        typeof WriteLocalSave ===
            "function"
    ) {
        WriteLocalSave(
            SaveData
        );
    }

    return FinalResult;
}
