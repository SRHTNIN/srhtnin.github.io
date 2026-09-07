function IsAdminPlainObject(Value) {
    return (
        Value !== null &&
        typeof Value === "object" &&
        !Array.isArray(Value)
    );
}


function ValidateAdminInteger(
    Value,
    Name,
    Minimum = null
) {
    if (
        !Number.isInteger(Value) ||
        (
            Minimum !== null &&
            Value < Minimum
        )
    ) {
        throw new Error(
            Name + " must be " +
            (
                Minimum === null
                    ? "an integer."
                    : "an integer of at least " +
                        Minimum + "."
            )
        );
    }
}


function ValidateAdminKey(
    Value,
    Name,
    MaximumLength = 64
) {
    if (
        typeof Value !== "string" ||
        Value.length === 0
    ) {
        throw new Error(
            Name + " cannot be empty."
        );
    }

    if (
        Value.length > MaximumLength ||
        !/^[A-Za-z0-9_-]+$/.test(Value)
    ) {
        throw new Error(
            Name +
            " may only contain letters, numbers, underscores and hyphens."
        );
    }
}


function ValidateAdminFunctionalEffects(
    Effects
) {
    const Functional =
        Effects?.Functional;

    if (Functional === undefined) {
        return true;
    }

    if (!Array.isArray(Functional)) {
        throw new Error(
            "Effects.Functional must be an array."
        );
    }

    if (Functional.length > 32) {
        throw new Error(
            "Effects.Functional cannot contain more than 32 effects."
        );
    }

    const SeenKeys = new Set();

    for (
        let EffectIndex = 0;
        EffectIndex < Functional.length;
        EffectIndex++
    ) {
        const Effect =
            Functional[EffectIndex];

        if (!IsAdminPlainObject(Effect)) {
            throw new Error(
                "Functional effect " +
                (EffectIndex + 1) +
                " must be an object."
            );
        }

        const EffectType = String(
            Effect.Type ?? ""
        ).trim();

        ValidateAdminKey(
            EffectType,
            "Functional effect type"
        );

        if (
            typeof IsKnownFunctionalEffectType ===
                "function" &&
            !IsKnownFunctionalEffectType(
                EffectType
            )
        ) {
            throw new Error(
                "Unknown functional effect type: " +
                EffectType +
                "."
            );
        }

        if (Effect.Key !== undefined) {
            const EffectKey = String(
                Effect.Key ?? ""
            ).trim();

            ValidateAdminKey(
                EffectKey,
                "Functional effect key"
            );

            if (SeenKeys.has(EffectKey)) {
                throw new Error(
                    "Functional effect keys must be unique within a plant."
                );
            }

            SeenKeys.add(EffectKey);
        }

        for (const Field of [
            "Area",
            "Source",
            "Target"
        ]) {
            if (Effect[Field] === undefined) {
                continue;
            }

            const Area = String(
                Effect[Field]
            );

            if (
                typeof FunctionalEffectAreas !==
                    "undefined" &&
                !FunctionalEffectAreas.includes(
                    Area
                )
            ) {
                throw new Error(
                    "Functional effect " +
                    Field.toLowerCase() +
                    " must be Front, Behind, Cardinal, Adjacent or Farm."
                );
            }
        }

        if (Effect.Cooldown !== undefined) {
            ValidateAdminInteger(
                Number(
                    Effect.Cooldown
                ),
                "Functional effect cooldown",
                typeof FunctionalEffectMinimumCooldown !==
                    "undefined"
                    ? FunctionalEffectMinimumCooldown
                    : 1000
            );
        }

        if (Effect.Amount !== undefined) {
            const Amount = Number(
                Effect.Amount
            );

            if (!Number.isFinite(Amount)) {
                throw new Error(
                    "Functional effect amount must be a number."
                );
            }

            if (
                [
                    "GrowthAdvance",
                    "MutationChanceBonus",
                    "CooldownReduction",
                    "HarvestYieldBonus"
                ].includes(EffectType) &&
                (Amount < 0 || Amount > 1)
            ) {
                throw new Error(
                    "Functional percentage amounts must be between 0 and 1."
                );
            }
        }

        for (const BooleanField of [
            "RequireMature",
            "RequireMatureSource",
            "RandomSource",
            "RandomTarget",
            "ExcludeFunctional",
            "ConsumeSeed"
        ]) {
            if (
                Effect[BooleanField] !== undefined &&
                typeof Effect[BooleanField] !==
                    "boolean"
            ) {
                throw new Error(
                    "Functional effect " +
                    BooleanField +
                    " must be On or Off."
                );
            }
        }

        if (
            typeof IsFunctionalEffectActive ===
                "function" &&
            IsFunctionalEffectActive(
                Effect
            ) &&
            Effect.Cooldown === undefined
        ) {
            throw new Error(
                "Active functional effects need a cooldown."
            );
        }
    }

    return true;
}


function ValidateAdminPlant(
    Plant,
    Catalogue,
    EditingKey = null
) {
    if (!IsAdminPlainObject(Plant)) {
        throw new Error(
            "Plant data is invalid."
        );
    }

    ValidateAdminInteger(
        Number(Plant.Id),
        "ID",
        1
    );

    const PlantKey =
        String(
            Plant.PlantKey ?? ""
        ).trim();

    ValidateAdminKey(
        PlantKey,
        "Plant Key"
    );

    const ExistingAtId =
        Object.entries(
            Catalogue ?? {}
        ).find(
            ([, Candidate]) =>
                Number(Candidate?.Id) ===
                Number(Plant.Id)
        );

    if (
        ExistingAtId !== undefined &&
        ExistingAtId[0] !== PlantKey
    ) {
        throw new Error(
            "ID " + Plant.Id +
            " already belongs to " +
            ExistingAtId[0] + "."
        );
    }

    if (
        EditingKey !== null &&
        EditingKey !== PlantKey
    ) {
        throw new Error(
            "An existing Plant Key cannot be changed."
        );
    }

    if (
        EditingKey !== null &&
        Number(
            Catalogue?.[EditingKey]?.Id
        ) !== Number(Plant.Id)
    ) {
        throw new Error(
            "An existing plant ID cannot be changed."
        );
    }

    if (
        EditingKey === null &&
        Catalogue?.[PlantKey] !== undefined
    ) {
        throw new Error(
            "Plant Key " + PlantKey +
            " already exists."
        );
    }

    const Name =
        String(
            Plant.Name ?? ""
        ).trim();

    if (
        Name.length === 0 ||
        Name.length > 64
    ) {
        throw new Error(
            "Name must contain between 1 and 64 characters."
        );
    }

    if (
        typeof Plant.Description !==
        "string"
    ) {
        throw new Error(
            "Description must be text."
        );
    }

    if (!Array.isArray(Plant.Tags)) {
        throw new Error(
            "Tags must be an array."
        );
    }

    for (const Tag of Plant.Tags) {
        if (
            typeof Tag !== "string" ||
            Tag.trim().length === 0 ||
            Tag.trim().length > 64
        ) {
            throw new Error(
                "Tags contains an invalid tag."
            );
        }
    }

    ValidateAdminInteger(
        Number(Plant.GrowthTime),
        "Growth time",
        0
    );

    const HarvestMultiplier =
        Number(
            Plant.HarvestMultiplier
        );

    if (
        !Number.isFinite(
            HarvestMultiplier
        ) ||
        HarvestMultiplier < 0 ||
        HarvestMultiplier > 9999.9999
    ) {
        throw new Error(
            "Harvest multiplier must be between 0 and 9999.9999."
        );
    }

    if (!IsAdminPlainObject(Plant.Effects)) {
        throw new Error(
            "Effects JSON must be an object."
        );
    }

    ValidateAdminFunctionalEffects(
        Plant.Effects
    );

    if (
        Plant.DirectionalSprites !== undefined &&
        typeof Plant.DirectionalSprites !== "boolean"
    ) {
        throw new Error(
            "Directional sprites must be On or Off."
        );
    }

    if (Plant.ShopPlant === true) {
        ValidateAdminInteger(
            Number(Plant.BaseCost),
            "Base seed cost",
            0
        );
    }

    return true;
}


function GetAdminPlantKeyById(
    PlantId,
    PlantCatalogue
) {
    return Object.entries(
        PlantCatalogue ?? {}
    ).find(
        ([, Plant]) =>
            Number(Plant?.Id) ===
            Number(PlantId)
    )?.[0] ?? null;
}


function ValidateAdminMutationMatrix(
    Matrix,
    Name,
    Width = null,
    Height = null
) {
    if (
        !Array.isArray(Matrix) ||
        Matrix.length < 1 ||
        Matrix.length > 7
    ) {
        throw new Error(
            Name +
            " must contain between 1 and 7 rows."
        );
    }

    const MatrixWidth =
        Array.isArray(Matrix[0])
            ? Matrix[0].length
            : 0;

    if (
        MatrixWidth < 1 ||
        MatrixWidth > 7
    ) {
        throw new Error(
            Name +
            " rows must contain between 1 and 7 cells."
        );
    }

    for (const Row of Matrix) {
        if (
            !Array.isArray(Row) ||
            Row.length !== MatrixWidth
        ) {
            throw new Error(
                Name +
                " must be rectangular."
            );
        }
    }

    if (
        Width !== null &&
        MatrixWidth !== Width
    ) {
        throw new Error(
            Name +
            " width must match the pattern."
        );
    }

    if (
        Height !== null &&
        Matrix.length !== Height
    ) {
        throw new Error(
            Name +
            " height must match the pattern."
        );
    }

    return {
        Width: MatrixWidth,
        Height: Matrix.length
    };
}


function ValidateAdminMutationTagList(
    Value,
    Name
) {
    if (!Array.isArray(Value)) {
        throw new Error(
            Name + " must be an array."
        );
    }

    for (const Tag of Value) {
        if (
            typeof Tag !== "string" ||
            Tag.trim().length === 0 ||
            Tag.trim().length > 64
        ) {
            throw new Error(
                Name +
                " contains an invalid tag."
            );
        }
    }
}


function ValidateAdminCaptureName(
    Capture
) {
    if (
        typeof Capture !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_]*$/.test(
            Capture
        )
    ) {
        throw new Error(
            "Capture names must start with a letter and contain only letters, numbers and underscores."
        );
    }
}


function GetAdminValidationListReference(
    Value
) {
    if (typeof Value !== "string") {
        return null;
    }

    const Match =
        /^List:([1-9][0-9]*)$/.exec(
            Value
        );

    return Match === null
        ? null
        : Number(Match[1]);
}


function ValidateAdminMutationLists(
    Lists,
    PlantCatalogue
) {
    if (!Array.isArray(Lists)) {
        throw new Error(
            "Lists must be an array."
        );
    }

    if (Lists.length > 64) {
        throw new Error(
            "A mutation can contain at most 64 lists."
        );
    }

    const ValidTags =
        new Set(
            Object.values(
                PlantCatalogue ?? {}
            ).flatMap(
                Plant =>
                    Array.isArray(Plant?.Tags)
                        ? Plant.Tags
                        : []
            ).filter(
                Tag =>
                    typeof Tag === "string" &&
                    Tag.trim() !== ""
            ).map(
                Tag => Tag.trim()
            )
        );

    for (
        let ListIndex = 0;
        ListIndex < Lists.length;
        ListIndex++
    ) {
        const List = Lists[ListIndex];
        const ListNumber = ListIndex + 1;

        if (!IsAdminPlainObject(List)) {
            throw new Error(
                "List " +
                ListNumber +
                " is invalid."
            );
        }

        if (
            List.Mode !== "Once" &&
            List.Mode !== "Any"
        ) {
            throw new Error(
                "List " +
                ListNumber +
                " mode must be Once or Any."
            );
        }

        if (
            !Array.isArray(List.Items) ||
            List.Items.length < 1 ||
            List.Items.length > 64
        ) {
            throw new Error(
                "List " +
                ListNumber +
                " must contain between 1 and 64 items."
            );
        }

        for (
            let ItemIndex = 0;
            ItemIndex < List.Items.length;
            ItemIndex++
        ) {
            const Item =
                List.Items[ItemIndex];

            const ItemName =
                "List " +
                ListNumber +
                " item " +
                (ItemIndex + 1);

            if (!IsAdminPlainObject(Item)) {
                throw new Error(
                    ItemName +
                    " is invalid."
                );
            }

            if (
                ![
                    "Any",
                    "Empty",
                    "Plant",
                    "Tag"
                ].includes(Item.Type)
            ) {
                throw new Error(
                    ItemName +
                    " has an invalid type."
                );
            }

            if (Item.Type === "Plant") {
                if (
                    typeof Item.Value !==
                        "string" ||
                    PlantCatalogue?.[
                        Item.Value
                    ] === undefined
                ) {
                    throw new Error(
                        ItemName +
                        " references an unknown plant."
                    );
                }
            }

            if (Item.Type === "Tag") {
                const Tag =
                    typeof Item.Value ===
                        "string"
                        ? Item.Value.trim()
                        : "";

                if (
                    Tag.length === 0 ||
                    Tag.length > 64
                ) {
                    throw new Error(
                        ItemName +
                        " contains an invalid tag."
                    );
                }

                if (!ValidTags.has(Tag)) {
                    throw new Error(
                        ItemName +
                        " references a tag that no plant has: " +
                        Tag
                    );
                }
            }
        }
    }
}


function GetAdminMutationListReferenceCounts(
    Matrix
) {
    const Counts = new Map();

    for (const Row of Matrix ?? []) {
        if (!Array.isArray(Row)) {
            continue;
        }

        for (const Cell of Row) {
            const ListNumber =
                GetAdminValidationListReference(
                    Cell
                );

            if (ListNumber === null) {
                continue;
            }

            Counts.set(
                ListNumber,
                (Counts.get(ListNumber) ?? 0) + 1
            );
        }
    }

    return Counts;
}


function ValidateAdminMutationResultListReferences(
    Result,
    Pattern,
    Name
) {
    const PatternCounts =
        GetAdminMutationListReferenceCounts(
            Pattern
        );

    const ResultCounts =
        GetAdminMutationListReferenceCounts(
            Result
        );

    for (
        const [ListNumber, Count]
        of ResultCounts
    ) {
        const PatternCount =
            PatternCounts.get(ListNumber) ?? 0;

        if (Count > PatternCount) {
            throw new Error(
                Name +
                " uses List:" +
                ListNumber +
                " " +
                Count +
                " times, but the pattern only matches it " +
                PatternCount +
                " times."
            );
        }
    }
}


function ValidateAdminMutationOnceListCapacity(
    Lists,
    Pattern
) {
    const PatternCounts =
        GetAdminMutationListReferenceCounts(
            Pattern
        );

    for (
        let ListIndex = 0;
        ListIndex < Lists.length;
        ListIndex++
    ) {
        const List = Lists[ListIndex];

        if (List?.Mode !== "Once") {
            continue;
        }

        const ListNumber = ListIndex + 1;
        const ReferenceCount =
            PatternCounts.get(ListNumber) ?? 0;

        if (
            ReferenceCount >
            (List.Items?.length ?? 0)
        ) {
            throw new Error(
                "List:" +
                ListNumber +
                " is Once and is referenced " +
                ReferenceCount +
                " times, but only has " +
                (List.Items?.length ?? 0) +
                " items."
            );
        }
    }
}


function ValidateAdminMutationPatternCell(
    Cell,
    PlantCatalogue,
    Captures,
    ListCount
) {
    if (
        Cell === null ||
        Cell === "Any" ||
        Cell === "Empty"
    ) {
        return;
    }

    if (typeof Cell === "string") {
        const ListNumber =
            GetAdminValidationListReference(
                Cell
            );

        if (ListNumber !== null) {
            if (ListNumber > ListCount) {
                throw new Error(
                    "Pattern references list " +
                    ListNumber +
                    ", but only " +
                    ListCount +
                    " lists exist."
                );
            }

            return;
        }

        if (
            PlantCatalogue?.[Cell] ===
            undefined
        ) {
            throw new Error(
                "Pattern references unknown plant: " +
                Cell
            );
        }

        return;
    }

    if (!IsAdminPlainObject(Cell)) {
        throw new Error(
            "Pattern contains an invalid matcher."
        );
    }

    if (
        Cell.Plant !== undefined &&
        (
            typeof Cell.Plant !==
                "string" ||
            PlantCatalogue?.[
                Cell.Plant
            ] === undefined
        )
    ) {
        throw new Error(
            "Pattern matcher references an unknown plant."
        );
    }

    for (
        const TagField
        of [
            "Tags",
            "TagsAny",
            "TagsNot"
        ]
    ) {
        if (Cell[TagField] !== undefined) {
            ValidateAdminMutationTagList(
                Cell[TagField],
                TagField
            );
        }
    }

    if (Cell.Capture !== undefined) {
        ValidateAdminCaptureName(
            Cell.Capture
        );

        Captures.add(
            Cell.Capture
        );
    }
}


function ValidateAdminMutationResultCell(
    Cell,
    PlantCatalogue,
    Captures,
    ListCount
) {
    if (
        Cell === null ||
        Cell === "Keep" ||
        Cell === "Empty"
    ) {
        return;
    }

    let PlantValue = null;

    if (typeof Cell === "string") {
        const ListNumber =
            GetAdminValidationListReference(
                Cell
            );

        if (ListNumber !== null) {
            if (ListNumber > ListCount) {
                throw new Error(
                    "Result references list " +
                    ListNumber +
                    ", but only " +
                    ListCount +
                    " lists exist."
                );
            }

            return;
        }

        PlantValue = Cell;
    } else if (
        IsAdminPlainObject(Cell) &&
        typeof Cell.Plant === "string"
    ) {
        PlantValue = Cell.Plant;
    }

    if (PlantValue === null) {
        throw new Error(
            "Result contains an invalid value."
        );
    }

    if (PlantValue.startsWith("$")) {
        const Capture =
            PlantValue.slice(1);

        if (!Captures.has(Capture)) {
            throw new Error(
                "Result references unknown capture: " +
                Capture
            );
        }

        return;
    }

    if (
        PlantCatalogue?.[
            PlantValue
        ] === undefined
    ) {
        throw new Error(
            "Result references unknown plant: " +
            PlantValue
        );
    }
}


function ValidateAdminMutationRelations(
    Relations,
    PlantCatalogue
) {
    if (!IsAdminPlainObject(Relations)) {
        throw new Error(
            "Relations must be an object."
        );
    }

    const ValidIds =
        new Set(
            Object.values(
                PlantCatalogue ?? {}
            ).map(
                Plant =>
                    Number(Plant.Id)
            )
        );

    for (
        const Name
        of [
            "PlantsUsed",
            "PlantsCreated"
        ]
    ) {
        const Values =
            Relations[Name] ?? [];

        if (!Array.isArray(Values)) {
            throw new Error(
                Name + " must be an array."
            );
        }

        for (const PlantId of Values) {
            if (
                !Number.isInteger(
                    Number(PlantId)
                ) ||
                !ValidIds.has(
                    Number(PlantId)
                )
            ) {
                throw new Error(
                    Name +
                    " references a plant that does not exist."
                );
            }
        }
    }
}


function ValidateAdminMutation(
    Mutation,
    MutationCatalogue,
    PlantCatalogue,
    EditingKey = null
) {
    if (!IsAdminPlainObject(Mutation)) {
        throw new Error(
            "Mutation data is invalid."
        );
    }

    ValidateAdminInteger(
        Number(Mutation.Id),
        "ID",
        1
    );

    const MutationKey =
        String(
            Mutation.MutationKey ?? ""
        ).trim();

    ValidateAdminKey(
        MutationKey,
        "Mutation Key"
    );

    const ExistingAtId =
        Object.entries(
            MutationCatalogue ?? {}
        ).find(
            ([, Candidate]) =>
                Number(Candidate?.Id) ===
                Number(Mutation.Id)
        );

    if (
        ExistingAtId !== undefined &&
        ExistingAtId[0] !== MutationKey
    ) {
        throw new Error(
            "ID " + Mutation.Id +
            " already belongs to " +
            ExistingAtId[0] + "."
        );
    }

    if (
        EditingKey !== null &&
        EditingKey !== MutationKey
    ) {
        throw new Error(
            "An existing Mutation Key cannot be changed."
        );
    }

    if (
        EditingKey !== null &&
        Number(
            MutationCatalogue
                ?.[EditingKey]?.Id
        ) !== Number(Mutation.Id)
    ) {
        throw new Error(
            "An existing mutation ID cannot be changed."
        );
    }

    if (
        EditingKey === null &&
        MutationCatalogue?.[
            MutationKey
        ] !== undefined
    ) {
        throw new Error(
            "Mutation Key " +
            MutationKey +
            " already exists."
        );
    }

    const Name =
        String(
            Mutation.Name ?? ""
        ).trim();

    if (
        Name.length === 0 ||
        Name.length > 128
    ) {
        throw new Error(
            "Name must contain between 1 and 128 characters."
        );
    }

    if (
        typeof Mutation.Description !==
        "string"
    ) {
        throw new Error(
            "Description must be text."
        );
    }

    if (
        Mutation.Hint !== null &&
        Mutation.Hint !== undefined &&
        typeof Mutation.Hint !== "string"
    ) {
        throw new Error(
            "Hint must be text."
        );
    }

    ValidateAdminInteger(
        Number(Mutation.Priority),
        "Priority"
    );

    const Chance =
        Number(
            Mutation.Chance
        );

    if (
        !Number.isFinite(Chance) ||
        Chance < 0 ||
        Chance > 1
    ) {
        throw new Error(
            "Chance must be between 0 and 100%."
        );
    }

    ValidateAdminInteger(
        Number(Mutation.Cooldown),
        "Cooldown",
        0
    );

    if (
        Mutation.Rotation !== "None" &&
        Mutation.Rotation !== "Any"
    ) {
        throw new Error(
            "Rotation must be None or Any."
        );
    }

    ValidateAdminMutationLists(
        Mutation.Lists ?? [],
        PlantCatalogue
    );

    const ListCount =
        (Mutation.Lists ?? []).length;

    const PatternSize =
        ValidateAdminMutationMatrix(
            Mutation.Pattern,
            "Pattern"
        );

    const Captures =
        new Set();

    for (const Row of Mutation.Pattern) {
        for (const Cell of Row) {
            ValidateAdminMutationPatternCell(
                Cell,
                PlantCatalogue,
                Captures,
                ListCount
            );
        }
    }

    ValidateAdminMutationOnceListCapacity(
        Mutation.Lists ?? [],
        Mutation.Pattern
    );

    ValidateAdminMutationMatrix(
        Mutation.Success,
        "Success result",
        PatternSize.Width,
        PatternSize.Height
    );

    for (const Row of Mutation.Success) {
        for (const Cell of Row) {
            ValidateAdminMutationResultCell(
                Cell,
                PlantCatalogue,
                Captures,
                ListCount
            );
        }
    }

    ValidateAdminMutationResultListReferences(
        Mutation.Success,
        Mutation.Pattern,
        "Success result"
    );

    if (
        Mutation.Failure !== "Keep" &&
        Mutation.Failure !== "Clear"
    ) {
        ValidateAdminMutationMatrix(
            Mutation.Failure,
            "Failure result",
            PatternSize.Width,
            PatternSize.Height
        );

        for (const Row of Mutation.Failure) {
            for (const Cell of Row) {
                ValidateAdminMutationResultCell(
                    Cell,
                    PlantCatalogue,
                    Captures,
                    ListCount
                );
            }
        }

        ValidateAdminMutationResultListReferences(
            Mutation.Failure,
            Mutation.Pattern,
            "Failure result"
        );
    }

    ValidateAdminMutationRelations(
        Mutation.Relations ?? {},
        PlantCatalogue
    );

    return true;
}


function DownloadAdminJson(
    FileName,
    Data
) {
    const BlobData =
        new Blob(
            [
                JSON.stringify(
                    Data,
                    null,
                    4
                ) + "\n"
            ],
            {
                type: "application/json"
            }
        );

    const Url =
        URL.createObjectURL(
            BlobData
        );

    const Link =
        document.createElement("a");

    Link.href = Url;
    Link.download = FileName;
    Link.click();

    URL.revokeObjectURL(Url);
}


function ReadAdminJsonFile(File) {
    return new Promise(
        (Resolve, Reject) => {
            const Reader =
                new FileReader();

            Reader.onload = () => {
                try {
                    Resolve(
                        JSON.parse(
                            String(
                                Reader.result ?? ""
                            )
                        )
                    );
                } catch (Error) {
                    Reject(
                        new Error(
                            "The selected file is not valid JSON."
                        )
                    );
                }
            };

            Reader.onerror = () => {
                Reject(
                    new Error(
                        "Couldn't read the selected JSON file."
                    )
                );
            };

            Reader.readAsText(File);
        }
    );
}
