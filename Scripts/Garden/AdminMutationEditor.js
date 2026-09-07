let AdminMutationCatalogue = {};
let AdminMutationPlantCatalogue = {};
let AdminMutationEditingKey = null;
let AdminMutationSavePending = false;

let AdminMutationPattern = [
    ["Any", "Empty", "Any"]
];

let AdminMutationResult = [
    ["Keep", "Keep", "Keep"]
];

let AdminMutationLists = [];

let AdminMutationSelectedCell = null;


async function StartAdminMutationEditor() {
    try {
        const Status =
            await GetAdminStatus();

        if (
            Status.Success !== true ||
            Status.IsAdmin !== true
        ) {
            SetAdminMutationMessage(
                "Admin access required."
            );

            return;
        }

        BindAdminMutationEditor();
        await LoadAdminMutationData();
    } catch (Error) {
        console.error(
            "Couldn't start Mutation editor:",
            Error
        );

        SetAdminMutationMessage(
            Error.message ??
            "Couldn't load the Mutation editor."
        );
    }
}


function BindAdminMutationEditor() {
    document.getElementById(
        "AdminMutationSelect"
    ).addEventListener(
        "change",
        Event => {
            const MutationKey =
                Event.target.value;

            if (MutationKey === "") {
                StartNewAdminMutation();
                return;
            }

            LoadAdminMutationIntoForm(
                MutationKey
            );
        }
    );

    document.getElementById(
        "AdminMutationNewButton"
    ).addEventListener(
        "click",
        StartNewAdminMutation
    );

    document.getElementById(
        "AdminMutationDuplicateButton"
    ).addEventListener(
        "click",
        DuplicateAdminMutation
    );

    document.getElementById(
        "AdminMutationImportButton"
    ).addEventListener(
        "click",
        () => {
            document.getElementById(
                "AdminMutationImportFile"
            ).click();
        }
    );

    document.getElementById(
        "AdminMutationImportFile"
    ).addEventListener(
        "change",
        ImportAdminMutationJson
    );

    document.getElementById(
        "AdminMutationExportButton"
    ).addEventListener(
        "click",
        ExportAdminMutationJson
    );

    document.getElementById(
        "AdminMutationResizeButton"
    ).addEventListener(
        "click",
        ResizeAdminMutationRecipe
    );

    document.getElementById(
        "AdminMutationAddListButton"
    ).addEventListener(
        "click",
        AddAdminMutationList
    );

    document.getElementById(
        "AdminMutationAllowImmature"
    ).addEventListener(
        "change",
        RenderAdminMutationGrids
    );

    document.getElementById(
        "AdminMutationForm"
    ).addEventListener(
        "submit",
        SaveAdminMutation
    );

    document.getElementById(
        "AdminMutationPatternCellType"
    ).addEventListener(
        "change",
        UpdateAdminMutationPatternControlVisibility
    );

    document.getElementById(
        "AdminMutationResultCellType"
    ).addEventListener(
        "change",
        UpdateAdminMutationResultControlVisibility
    );

    for (
        const ElementId
        of [
            "AdminMutationPatternCellType",
            "AdminMutationPatternPlant",
            "AdminMutationPatternList",
            "AdminMutationMatcherPlant",
            "AdminMutationMatcherTags",
            "AdminMutationMatcherTagsAny",
            "AdminMutationMatcherTagsNot",
            "AdminMutationMatcherCapture"
        ]
    ) {
        document.getElementById(
            ElementId
        ).addEventListener(
            "input",
            ApplyAdminMutationSelectedPatternCell
        );

        document.getElementById(
            ElementId
        ).addEventListener(
            "change",
            ApplyAdminMutationSelectedPatternCell
        );
    }

    for (
        const ElementId
        of [
            "AdminMutationResultCellType",
            "AdminMutationResultPlant",
            "AdminMutationResultList",
            "AdminMutationResultCapture"
        ]
    ) {
        document.getElementById(
            ElementId
        ).addEventListener(
            "input",
            ApplyAdminMutationSelectedResultCell
        );

        document.getElementById(
            ElementId
        ).addEventListener(
            "change",
            ApplyAdminMutationSelectedResultCell
        );
    }

    document.getElementById(
        "AdminMutationFailureType"
    ).addEventListener(
        "change",
        () => {
            UpdateAdminMutationFailureVisibility();
            RenderAdminMutationJsonPreview();
        }
    );

    document.getElementById(
        "AdminMutationForm"
    ).addEventListener(
        "input",
        RenderAdminMutationJsonPreview
    );

    document.getElementById(
        "AdminMutationForm"
    ).addEventListener(
        "change",
        RenderAdminMutationJsonPreview
    );

    for (
        const ElementId
        of [
            "AdminMutationCooldownHours",
            "AdminMutationCooldownMinutes",
            "AdminMutationCooldownSeconds"
        ]
    ) {
        document.getElementById(
            ElementId
        ).addEventListener(
            "input",
            () => {
                SyncAdminMutationCooldown();
                RenderAdminMutationJsonPreview();
            }
        );

        document.getElementById(
            ElementId
        ).addEventListener(
            "change",
            () => {
                SyncAdminMutationCooldown();
                RenderAdminMutationJsonPreview();
            }
        );
    }
}


async function AdminMutationRequest(
    Action,
    Data = {}
) {
    const SaveKey =
        localStorage.getItem(
            SaveKeyName
        );

    if (
        typeof SaveKey !== "string" ||
        !/^[0-9A-Fa-f]{64}$/.test(
            SaveKey
        )
    ) {
        throw new Error(
            "A valid Account Key is required."
        );
    }

    const Response = await fetch(
        ApiUrl +
        "/AdminMutations.php",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                SaveKey: SaveKey,
                Action: Action,
                ...Data
            })
        }
    );

    let Result;

    try {
        Result = await Response.json();
    } catch (Error) {
        throw new Error(
            "Mutation admin API returned invalid JSON."
        );
    }

    if (
        !Response.ok ||
        Result.Success !== true
    ) {
        throw new Error(
            Result.Error ??
            "Mutation admin request failed."
        );
    }

    return Result;
}


async function AdminMutationPlantRequest() {
    const SaveKey =
        localStorage.getItem(
            SaveKeyName
        );

    const Response = await fetch(
        ApiUrl +
        "/AdminPlants.php",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                SaveKey: SaveKey,
                Action: "List"
            })
        }
    );

    const Result =
        await Response.json();

    if (
        !Response.ok ||
        Result.Success !== true
    ) {
        throw new Error(
            Result.Error ??
            "Couldn't load plants for the Mutation editor."
        );
    }

    return Result;
}


async function LoadAdminMutationData(
    PreferredMutationKey = null
) {
    SetAdminMutationMessage(
        "Loading mutation data..."
    );

    const [
        PlantResult,
        MutationResult
    ] = await Promise.all([
        AdminMutationPlantRequest(),
        AdminMutationRequest(
            "List"
        )
    ]);

    AdminMutationPlantCatalogue =
        PlantResult.Plants ?? {};

    AdminMutationCatalogue =
        MutationResult.Mutations ?? {};

    Plants =
        AdminMutationPlantCatalogue;

    MutationSets =
        AdminMutationCatalogue;

    PopulateAdminMutationPlantControls();
    PopulateAdminMutationTagOptions();
    RenderAdminMutationRelationChecklists();
    RenderAdminMutationSelect();
    RenderAdminMutationDuplicateSelect();

    const Keys =
        GetSortedAdminMutationKeys();

    const MutationKey =
        PreferredMutationKey !== null &&
        AdminMutationCatalogue[
            PreferredMutationKey
        ] !== undefined
            ? PreferredMutationKey
            : Keys[0] ?? null;

    if (MutationKey === null) {
        StartNewAdminMutation();
    } else {
        LoadAdminMutationIntoForm(
            MutationKey
        );
    }

    SetAdminMutationMessage(
        Keys.length === 1
            ? "1 mutation loaded."
            : Keys.length +
                " mutations loaded."
    );
}


function GetSortedAdminMutationKeys() {
    return Object.keys(
        AdminMutationCatalogue
    ).sort(
        (A, B) => {
            const MutationA =
                AdminMutationCatalogue[A];

            const MutationB =
                AdminMutationCatalogue[B];

            return (
                Number(MutationA.Id) -
                    Number(MutationB.Id) ||
                A.localeCompare(B)
            );
        }
    );
}


function GetSortedAdminPlants() {
    return Object.entries(
        AdminMutationPlantCatalogue
    ).sort(
        (A, B) =>
            Number(A[1].Id) -
                Number(B[1].Id) ||
            A[0].localeCompare(B[0])
    );
}


function RenderAdminMutationSelect() {
    const Select =
        document.getElementById(
            "AdminMutationSelect"
        );

    Select.replaceChildren();

    for (
        const MutationKey
        of GetSortedAdminMutationKeys()
    ) {
        const Mutation =
            AdminMutationCatalogue[
                MutationKey
            ];

        const Option =
            document.createElement(
                "option"
            );

        Option.value =
            MutationKey;

        Option.textContent =
            String(
                Mutation.Id
            ).padStart(
                3,
                "0"
            ) +
            " — " +
            Mutation.Name +
            (
                Mutation.Archived === true
                    ? " (archived)"
                    : ""
            );

        Select.appendChild(
            Option
        );
    }
}


function RenderAdminMutationDuplicateSelect() {
    const Select =
        document.getElementById(
            "AdminMutationDuplicateSelect"
        );

    if (Select === null) {
        return;
    }

    const PreviousValue =
        Select.value;

    Select.replaceChildren();

    for (
        const MutationKey
        of GetSortedAdminMutationKeys()
    ) {
        const Mutation =
            AdminMutationCatalogue[
                MutationKey
            ];

        const Option =
            document.createElement(
                "option"
            );

        Option.value =
            MutationKey;

        Option.textContent =
            String(
                Mutation.Id
            ).padStart(
                3,
                "0"
            ) +
            " — " +
            Mutation.Name +
            (
                Mutation.Archived === true
                    ? " (archived)"
                    : ""
            );

        Select.appendChild(
            Option
        );
    }

    if (
        PreviousValue !== "" &&
        AdminMutationCatalogue[
            PreviousValue
        ] !== undefined
    ) {
        Select.value =
            PreviousValue;
    }
}


function PopulateAdminMutationPlantControls() {
    for (
        const ElementId
        of [
            "AdminMutationPatternPlant",
            "AdminMutationMatcherPlant",
            "AdminMutationResultPlant"
        ]
    ) {
        const Select =
            document.getElementById(
                ElementId
            );

        Select.replaceChildren();

        if (
            ElementId ===
            "AdminMutationMatcherPlant"
        ) {
            const None =
                document.createElement(
                    "option"
                );

            None.value = "";
            None.textContent =
                "Any plant";

            Select.appendChild(
                None
            );
        }

        for (
            const [
                PlantKey,
                Plant
            ]
            of GetSortedAdminPlants()
        ) {
            const Option =
                document.createElement(
                    "option"
                );

            Option.value =
                PlantKey;

            Option.textContent =
                String(
                    Plant.Id
                ).padStart(
                    3,
                    "0"
                ) +
                " — " +
                Plant.Name;

            Select.appendChild(
                Option
            );
        }
    }
}


function GetAdminMutationTags() {
    return [
        ...new Set(
            Object.values(
                AdminMutationPlantCatalogue
            ).flatMap(
                Plant =>
                    Array.isArray(Plant.Tags)
                        ? Plant.Tags
                        : []
            ).filter(
                Tag =>
                    typeof Tag === "string" &&
                    Tag.trim() !== ""
            ).map(
                Tag => Tag.trim()
            )
        )
    ].sort(
        (A, B) => A.localeCompare(B)
    );
}


function PopulateAdminMutationTagOptions() {
    const Datalist =
        document.getElementById(
            "AdminMutationTagOptions"
        );

    Datalist.replaceChildren();

    for (const Tag of GetAdminMutationTags()) {
        const Option =
            document.createElement(
                "option"
            );

        Option.value = Tag;
        Datalist.appendChild(Option);
    }
}


function RenderAdminMutationRelationChecklists() {
    for (
        const [
            ContainerId,
            RelationName
        ]
        of [
            [
                "AdminMutationPlantsUsed",
                "PlantsUsed"
            ],
            [
                "AdminMutationPlantsCreated",
                "PlantsCreated"
            ]
        ]
    ) {
        const Container =
            document.getElementById(
                ContainerId
            );

        Container.replaceChildren();

        for (
            const [
                PlantKey,
                Plant
            ]
            of GetSortedAdminPlants()
        ) {
            const Label =
                document.createElement(
                    "label"
                );

            Label.className =
                "AdminPlantChecklistItem";

            const Input =
                document.createElement(
                    "input"
                );

            Input.type =
                "checkbox";

            Input.value =
                String(
                    Plant.Id
                );

            Input.dataset.relation =
                RelationName;

            Input.dataset.plantKey =
                PlantKey;

            Input.addEventListener(
                "change",
                RenderAdminMutationJsonPreview
            );

            const Text =
                document.createElement(
                    "span"
                );

            Text.textContent =
                String(
                    Plant.Id
                ).padStart(
                    3,
                    "0"
                ) +
                " — " +
                Plant.Name;

            Label.append(
                Input,
                Text
            );

            Container.appendChild(
                Label
            );
        }
    }
}


function LoadAdminMutationIntoForm(
    MutationKey
) {
    const Mutation =
        AdminMutationCatalogue[
            MutationKey
        ];

    if (Mutation === undefined) {
        return;
    }

    AdminMutationEditingKey =
        MutationKey;

    document.getElementById(
        "AdminMutationSelect"
    ).value = MutationKey;

    SetAdminMutationField(
        "AdminMutationId",
        Mutation.Id
    );

    SetAdminMutationField(
        "AdminMutationKey",
        MutationKey
    );

    SetAdminMutationField(
        "AdminMutationName",
        Mutation.Name ?? ""
    );

    SetAdminMutationField(
        "AdminMutationDescription",
        Mutation.Description ?? ""
    );

    SetAdminMutationField(
        "AdminMutationHint",
        Mutation.Hint ?? ""
    );

    SetAdminMutationField(
        "AdminMutationPriority",
        Number(
            Mutation.Priority ?? 0
        )
    );

    SetAdminMutationField(
        "AdminMutationChance",
        Number(
            Mutation.Chance ?? 1
        ) * 100
    );

    SetAdminMutationDurationFields(
        Number(
            Mutation.Cooldown ?? 0
        )
    );

    SetAdminMutationField(
        "AdminMutationRotation",
        Mutation.Rotation ??
        "None"
    );

    document.getElementById(
        "AdminMutationAllowImmature"
    ).checked =
        Mutation.AllowImmature === true;

    AdminMutationLists =
        NormalizeAdminMutationLists(
            Mutation.Lists
        );

    AdminMutationPattern =
        CloneAdminMutationMatrix(
            Mutation.Pattern,
            "Any"
        );

    if (
        AdminMutationPattern.length === 0
    ) {
        AdminMutationPattern = [
            ["Any"]
        ];
    }

    AdminMutationResult =
        NormalizeAdminMutationMatrix(
            Mutation.Success,
            AdminMutationPattern[0]
                .length,
            AdminMutationPattern.length,
            "Keep"
        );

    SetAdminMutationField(
        "AdminMutationWidth",
        AdminMutationPattern[0]
            .length
    );

    SetAdminMutationField(
        "AdminMutationHeight",
        AdminMutationPattern.length
    );

    LoadAdminMutationFailure(
        Mutation.Failure
    );

    SetAdminMutationRelations(
        Mutation.Relations ?? {}
    );

    document.getElementById(
        "AdminMutationId"
    ).readOnly = true;

    document.getElementById(
        "AdminMutationKey"
    ).readOnly = true;

    document.getElementById(
        "AdminMutationArchiveNote"
    ).hidden =
        Mutation.Archived !== true;

    AdminMutationSelectedCell = null;
    HideAdminMutationCellEditor();
    RenderAdminMutationLists();
    RenderAdminMutationGrids();
    UpdateAdminMutationFailureVisibility();
    UpdateAdminMutationCooldownHint();
    RenderAdminMutationJsonPreview();
}


function DuplicateAdminMutation() {
    const SourceMutationKey =
        document.getElementById(
            "AdminMutationDuplicateSelect"
        ).value;

    const SourceMutation =
        AdminMutationCatalogue[
            SourceMutationKey
        ];

    if (SourceMutation === undefined) {
        SetAdminMutationMessage(
            "Choose a mutation to duplicate."
        );

        return;
    }

    AdminMutationEditingKey = null;

    document.getElementById(
        "AdminMutationSelect"
    ).value = "";

    SetAdminMutationField(
        "AdminMutationId",
        GetNextAdminMutationId()
    );

    SetAdminMutationField(
        "AdminMutationKey",
        ""
    );

    SetAdminMutationField(
        "AdminMutationName",
        ""
    );

    SetAdminMutationField(
        "AdminMutationDescription",
        SourceMutation.Description ?? ""
    );

    SetAdminMutationField(
        "AdminMutationHint",
        SourceMutation.Hint ?? ""
    );

    SetAdminMutationField(
        "AdminMutationPriority",
        Number(
            SourceMutation.Priority ?? 0
        )
    );

    SetAdminMutationField(
        "AdminMutationChance",
        Number(
            SourceMutation.Chance ?? 1
        ) * 100
    );

    SetAdminMutationDurationFields(
        Number(
            SourceMutation.Cooldown ?? 0
        )
    );

    SetAdminMutationField(
        "AdminMutationRotation",
        SourceMutation.Rotation ??
        "None"
    );

    document.getElementById(
        "AdminMutationAllowImmature"
    ).checked =
        SourceMutation.AllowImmature === true;

    AdminMutationLists =
        NormalizeAdminMutationLists(
            SourceMutation.Lists
        );

    AdminMutationPattern =
        CloneAdminMutationMatrix(
            SourceMutation.Pattern,
            "Any"
        );

    if (
        AdminMutationPattern.length === 0
    ) {
        AdminMutationPattern = [
            ["Any"]
        ];
    }

    AdminMutationResult =
        NormalizeAdminMutationMatrix(
            SourceMutation.Success,
            AdminMutationPattern[0]
                .length,
            AdminMutationPattern.length,
            "Keep"
        );

    SetAdminMutationField(
        "AdminMutationWidth",
        AdminMutationPattern[0]
            .length
    );

    SetAdminMutationField(
        "AdminMutationHeight",
        AdminMutationPattern.length
    );

    LoadAdminMutationFailure(
        CloneAdminMutationValue(
            SourceMutation.Failure
        )
    );

    SetAdminMutationRelations(
        CloneAdminMutationValue(
            SourceMutation.Relations ?? {}
        )
    );

    document.getElementById(
        "AdminMutationId"
    ).readOnly = false;

    document.getElementById(
        "AdminMutationKey"
    ).readOnly = false;

    document.getElementById(
        "AdminMutationArchiveNote"
    ).hidden = true;

    AdminMutationSelectedCell = null;
    HideAdminMutationCellEditor();
    RenderAdminMutationLists();
    RenderAdminMutationGrids();
    UpdateAdminMutationFailureVisibility();
    UpdateAdminMutationCooldownHint();
    RenderAdminMutationJsonPreview();

    document.getElementById(
        "AdminMutationName"
    ).focus();

    SetAdminMutationMessage(
        "Duplicated " +
        SourceMutation.Name +
        ". Give the new mutation a name and Mutation Key before saving."
    );
}


function StartNewAdminMutation() {
    AdminMutationEditingKey = null;

    document.getElementById(
        "AdminMutationSelect"
    ).value = "";

    SetAdminMutationField(
        "AdminMutationId",
        GetNextAdminMutationId()
    );

    SetAdminMutationField(
        "AdminMutationKey",
        ""
    );

    SetAdminMutationField(
        "AdminMutationName",
        ""
    );

    SetAdminMutationField(
        "AdminMutationDescription",
        ""
    );

    SetAdminMutationField(
        "AdminMutationHint",
        ""
    );

    SetAdminMutationField(
        "AdminMutationPriority",
        10
    );

    SetAdminMutationField(
        "AdminMutationChance",
        100
    );

    SetAdminMutationDurationFields(
        120000
    );

    SetAdminMutationField(
        "AdminMutationRotation",
        "Any"
    );

    document.getElementById(
        "AdminMutationAllowImmature"
    ).checked = false;

    AdminMutationLists = [];

    AdminMutationPattern = [
        ["Any", "Empty", "Any"]
    ];

    AdminMutationResult = [
        ["Keep", "Keep", "Keep"]
    ];

    SetAdminMutationField(
        "AdminMutationWidth",
        3
    );

    SetAdminMutationField(
        "AdminMutationHeight",
        1
    );

    SetAdminMutationField(
        "AdminMutationFailureType",
        "Keep"
    );

    SetAdminMutationField(
        "AdminMutationFailureJson",
        "[]"
    );

    SetAdminMutationRelations({});

    document.getElementById(
        "AdminMutationId"
    ).readOnly = false;

    document.getElementById(
        "AdminMutationKey"
    ).readOnly = false;

    document.getElementById(
        "AdminMutationArchiveNote"
    ).hidden = true;

    AdminMutationSelectedCell = null;
    HideAdminMutationCellEditor();
    RenderAdminMutationLists();
    RenderAdminMutationGrids();
    UpdateAdminMutationFailureVisibility();
    UpdateAdminMutationCooldownHint();
    RenderAdminMutationJsonPreview();

    SetAdminMutationMessage(
        "Creating a new mutation."
    );
}


function GetNextAdminMutationId() {
    return Math.max(
        0,
        ...Object.values(
            AdminMutationCatalogue
        ).map(
            Mutation =>
                Number(
                    Mutation.Id ?? 0
                )
        )
    ) + 1;
}


function SetAdminMutationField(
    ElementId,
    Value
) {
    document.getElementById(
        ElementId
    ).value =
        Value ?? "";
}


function CloneAdminMutationMatrix(
    Matrix,
    FillValue
) {
    if (!Array.isArray(Matrix)) {
        return [];
    }

    const Width = Math.max(
        0,
        ...Matrix.map(
            Row =>
                Array.isArray(Row)
                    ? Row.length
                    : 0
        )
    );

    if (Width === 0) {
        return [];
    }

    return Matrix.map(
        Row => {
            const NewRow = [];

            for (
                let X = 0;
                X < Width;
                X++
            ) {
                const Value =
                    Array.isArray(Row) &&
                    X < Row.length
                        ? Row[X]
                        : FillValue;

                NewRow.push(
                    CloneAdminMutationValue(
                        Value
                    )
                );
            }

            return NewRow;
        }
    );
}


function NormalizeAdminMutationMatrix(
    Matrix,
    Width,
    Height,
    FillValue
) {
    const Result = [];

    for (
        let Y = 0;
        Y < Height;
        Y++
    ) {
        const Row = [];

        for (
            let X = 0;
            X < Width;
            X++
        ) {
            const Value =
                Array.isArray(Matrix?.[Y]) &&
                X < Matrix[Y].length
                    ? Matrix[Y][X]
                    : FillValue;

            Row.push(
                CloneAdminMutationValue(
                    Value
                )
            );
        }

        Result.push(Row);
    }

    return Result;
}


function CloneAdminMutationValue(
    Value
) {
    if (
        Value !== null &&
        typeof Value === "object"
    ) {
        return JSON.parse(
            JSON.stringify(Value)
        );
    }

    return Value;
}


function NormalizeAdminMutationLists(
    Lists
) {
    if (!Array.isArray(Lists)) {
        return [];
    }

    return Lists.map(
        List => ({
            Mode:
                List?.Mode === "Any"
                    ? "Any"
                    : "Once",
            Items:
                Array.isArray(List?.Items)
                    ? List.Items.map(
                        Item =>
                            NormalizeAdminMutationListItem(
                                Item
                            )
                    )
                    : []
        })
    );
}


function NormalizeAdminMutationListItem(
    Item
) {
    const Type =
        [
            "Any",
            "Empty",
            "Plant",
            "Tag"
        ].includes(Item?.Type)
            ? Item.Type
            : "Any";

    if (
        Type === "Plant" ||
        Type === "Tag"
    ) {
        return {
            Type: Type,
            Value:
                typeof Item?.Value === "string"
                    ? Item.Value
                    : ""
        };
    }

    return {
        Type: Type
    };
}


function AddAdminMutationList() {
    const FirstPlant =
        GetFirstAdminPlantKey();

    AdminMutationLists.push({
        Mode: "Once",
        Items: [
            FirstPlant === ""
                ? {Type: "Any"}
                : {
                    Type: "Plant",
                    Value: FirstPlant
                }
        ]
    });

    RenderAdminMutationLists();
    RenderAdminMutationJsonPreview();
}


function AddAdminMutationListItem(
    ListIndex
) {
    const List =
        AdminMutationLists[ListIndex];

    if (List === undefined) {
        return;
    }

    const FirstPlant =
        GetFirstAdminPlantKey();

    List.Items.push(
        FirstPlant === ""
            ? {Type: "Any"}
            : {
                Type: "Plant",
                Value: FirstPlant
            }
    );

    RenderAdminMutationLists();
    RenderAdminMutationJsonPreview();
}


function DeleteAdminMutationList(
    ListIndex
) {
    if (
        ListIndex < 0 ||
        ListIndex >= AdminMutationLists.length
    ) {
        return;
    }

    const DeletedListNumber =
        ListIndex + 1;

    AdminMutationLists.splice(
        ListIndex,
        1
    );

    AdminMutationPattern =
        RemapAdminMutationListReferences(
            AdminMutationPattern,
            DeletedListNumber,
            "Any"
        );

    AdminMutationResult =
        RemapAdminMutationListReferences(
            AdminMutationResult,
            DeletedListNumber,
            "Keep"
        );

    try {
        const Failure =
            GetAdminMutationFailure();

        if (Array.isArray(Failure)) {
            SetAdminMutationField(
                "AdminMutationFailureJson",
                JSON.stringify(
                    RemapAdminMutationListReferences(
                        Failure,
                        DeletedListNumber,
                        "Keep"
                    ),
                    null,
                    4
                )
            );
        }
    } catch (Error) {
    }

    AdminMutationSelectedCell = null;
    HideAdminMutationCellEditor();
    RenderAdminMutationLists();
    RenderAdminMutationGrids();
    RenderAdminMutationJsonPreview();
}


function RemapAdminMutationListReferences(
    Value,
    DeletedListNumber,
    DeletedReplacement
) {
    if (Array.isArray(Value)) {
        return Value.map(
            Item =>
                RemapAdminMutationListReferences(
                    Item,
                    DeletedListNumber,
                    DeletedReplacement
                )
        );
    }

    if (
        Value !== null &&
        typeof Value === "object"
    ) {
        return CloneAdminMutationValue(
            Value
        );
    }

    const ListNumber =
        GetAdminMutationListReference(
            Value
        );

    if (ListNumber === null) {
        return Value;
    }

    if (ListNumber === DeletedListNumber) {
        return DeletedReplacement;
    }

    if (ListNumber > DeletedListNumber) {
        return "List:" +
            (ListNumber - 1);
    }

    return Value;
}


function DeleteAdminMutationListItem(
    ListIndex,
    ItemIndex
) {
    const List =
        AdminMutationLists[ListIndex];

    if (List === undefined) {
        return;
    }

    List.Items.splice(
        ItemIndex,
        1
    );

    RenderAdminMutationLists();
    RenderAdminMutationJsonPreview();
}


function RenderAdminMutationLists() {
    const Container =
        document.getElementById(
            "AdminMutationLists"
        );

    Container.replaceChildren();

    for (
        let ListIndex = 0;
        ListIndex < AdminMutationLists.length;
        ListIndex++
    ) {
        Container.appendChild(
            CreateAdminMutationListEditor(
                ListIndex
            )
        );
    }

    RenderAdminMutationListSelects();
}


function CreateAdminMutationListEditor(
    ListIndex
) {
    const List =
        AdminMutationLists[ListIndex];

    const Item =
        document.createElement("li");

    Item.className =
        "AdminMutationList";

    const Header =
        document.createElement("div");

    Header.className =
        "AdminMutationListHeader";

    const ModeLabel =
        document.createElement("label");

    ModeLabel.className =
        "AdminMutationListMode";

    const ModeText =
        document.createElement("span");

    ModeText.textContent = "Mode";

    const Mode =
        document.createElement("select");

    for (const Value of ["Once", "Any"]) {
        const Option =
            document.createElement("option");

        Option.value = Value;
        Option.textContent = Value;
        Mode.appendChild(Option);
    }

    Mode.value = List.Mode;

    Mode.addEventListener(
        "change",
        () => {
            List.Mode = Mode.value;
            RenderAdminMutationJsonPreview();
        }
    );

    ModeLabel.append(
        ModeText,
        Mode
    );

    const DeleteListButton =
        document.createElement("button");

    DeleteListButton.type = "button";
    DeleteListButton.className =
        "ActionButton AdminInlineButton";
    DeleteListButton.textContent =
        "Delete list";

    DeleteListButton.addEventListener(
        "click",
        () =>
            DeleteAdminMutationList(
                ListIndex
            )
    );

    Header.append(
        ModeLabel,
        DeleteListButton
    );

    const Items =
        document.createElement("div");

    Items.className =
        "AdminMutationListItems";

    for (
        let ItemIndex = 0;
        ItemIndex < List.Items.length;
        ItemIndex++
    ) {
        Items.appendChild(
            CreateAdminMutationListItemEditor(
                ListIndex,
                ItemIndex
            )
        );
    }

    const Actions =
        document.createElement("div");

    Actions.className =
        "AdminMutationListActions";

    const AddItemButton =
        document.createElement("button");

    AddItemButton.type = "button";
    AddItemButton.className =
        "ActionButton AdminInlineButton";
    AddItemButton.textContent =
        "Add item";

    AddItemButton.addEventListener(
        "click",
        () =>
            AddAdminMutationListItem(
                ListIndex
            )
    );

    Actions.appendChild(
        AddItemButton
    );

    Item.append(
        Header,
        Items,
        Actions
    );

    return Item;
}


function CreateAdminMutationListItemEditor(
    ListIndex,
    ItemIndex
) {
    const Item =
        AdminMutationLists[ListIndex]
            .Items[ItemIndex];

    const Row =
        document.createElement("div");

    Row.className =
        "AdminMutationListItem";

    const Type =
        document.createElement("select");

    for (
        const [Value, Label]
        of [
            ["Any", "Any"],
            ["Empty", "Empty"],
            ["Plant", "Plant"],
            ["Tag", "Tag"]
        ]
    ) {
        const Option =
            document.createElement("option");

        Option.value = Value;
        Option.textContent = Label;
        Type.appendChild(Option);
    }

    Type.value = Item.Type;

    const ValueContainer =
        document.createElement("div");

    ValueContainer.className =
        "AdminMutationListItemValue";

    const RenderValueControl = () => {
        ValueContainer.replaceChildren();

        if (Item.Type === "Plant") {
            const PlantSelect =
                document.createElement("select");

            for (
                const [PlantKey, Plant]
                of GetSortedAdminPlants()
            ) {
                const Option =
                    document.createElement("option");

                Option.value = PlantKey;
                Option.textContent =
                    String(Plant.Id).padStart(3, "0") +
                    " — " +
                    Plant.Name;
                PlantSelect.appendChild(Option);
            }

            if (
                AdminMutationPlantCatalogue[
                    Item.Value
                ] !== undefined
            ) {
                PlantSelect.value = Item.Value;
            } else {
                Item.Value =
                    GetFirstAdminPlantKey();
                PlantSelect.value = Item.Value;
            }

            PlantSelect.addEventListener(
                "change",
                () => {
                    Item.Value =
                        PlantSelect.value;
                    RenderAdminMutationJsonPreview();
                }
            );

            ValueContainer.hidden = false;
            ValueContainer.appendChild(
                PlantSelect
            );
            return;
        }

        if (Item.Type === "Tag") {
            const TagInput =
                document.createElement("input");

            TagInput.type = "text";
            TagInput.maxLength = 64;
            TagInput.setAttribute(
                "list",
                "AdminMutationTagOptions"
            );
            TagInput.placeholder = "Tag";
            TagInput.value =
                typeof Item.Value === "string"
                    ? Item.Value
                    : "";

            TagInput.addEventListener(
                "input",
                () => {
                    Item.Value =
                        TagInput.value;
                    RenderAdminMutationJsonPreview();
                }
            );

            ValueContainer.hidden = false;
            ValueContainer.appendChild(
                TagInput
            );
            return;
        }

        ValueContainer.hidden = true;
    };

    Type.addEventListener(
        "change",
        () => {
            Item.Type = Type.value;

            if (Item.Type === "Plant") {
                Item.Value =
                    GetFirstAdminPlantKey();
            } else if (Item.Type === "Tag") {
                Item.Value = "";
            } else {
                delete Item.Value;
            }

            RenderValueControl();
            RenderAdminMutationJsonPreview();
        }
    );

    const DeleteButton =
        document.createElement("button");

    DeleteButton.type = "button";
    DeleteButton.className =
        "ActionButton AdminInlineButton";
    DeleteButton.textContent = "Remove";

    DeleteButton.addEventListener(
        "click",
        () =>
            DeleteAdminMutationListItem(
                ListIndex,
                ItemIndex
            )
    );

    RenderValueControl();

    Row.append(
        Type,
        ValueContainer,
        DeleteButton
    );

    return Row;
}


function RenderAdminMutationListSelects() {
    for (
        const TypeSelectId
        of [
            "AdminMutationPatternCellType",
            "AdminMutationResultCellType"
        ]
    ) {
        const Option =
            document.querySelector(
                "#" +
                TypeSelectId +
                ' option[value="List"]'
            );

        if (Option !== null) {
            Option.disabled =
                AdminMutationLists.length === 0;
        }
    }

    for (
        const ElementId
        of [
            "AdminMutationPatternList",
            "AdminMutationResultList"
        ]
    ) {
        const Select =
            document.getElementById(
                ElementId
            );

        const PreviousValue =
            Select.value;

        Select.replaceChildren();

        for (
            let Index = 0;
            Index < AdminMutationLists.length;
            Index++
        ) {
            const Option =
                document.createElement(
                    "option"
                );

            Option.value =
                String(Index + 1);
            Option.textContent =
                "List " + (Index + 1);
            Select.appendChild(Option);
        }

        if (
            PreviousValue !== "" &&
            Number(PreviousValue) <=
                AdminMutationLists.length
        ) {
            Select.value = PreviousValue;
        }
    }
}


function GetAdminMutationListReference(
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


function ResizeAdminMutationRecipe() {
    const Width = Math.max(
        1,
        Math.min(
            7,
            Math.floor(
                Number(
                    document.getElementById(
                        "AdminMutationWidth"
                    ).value
                ) || 1
            )
        )
    );

    const Height = Math.max(
        1,
        Math.min(
            7,
            Math.floor(
                Number(
                    document.getElementById(
                        "AdminMutationHeight"
                    ).value
                ) || 1
            )
        )
    );

    SetAdminMutationField(
        "AdminMutationWidth",
        Width
    );

    SetAdminMutationField(
        "AdminMutationHeight",
        Height
    );

    AdminMutationPattern =
        NormalizeAdminMutationMatrix(
            AdminMutationPattern,
            Width,
            Height,
            "Any"
        );

    AdminMutationResult =
        NormalizeAdminMutationMatrix(
            AdminMutationResult,
            Width,
            Height,
            "Keep"
        );

    AdminMutationSelectedCell = null;
    HideAdminMutationCellEditor();
    RenderAdminMutationGrids();
    RenderAdminMutationJsonPreview();
}


function RenderAdminMutationGrids() {
    const ListOffsets =
        CreateMutationRecipePreviewOffsets(
            AdminMutationPattern,
            AdminMutationResult
        );

    const AllowImmature =
        document.getElementById(
            "AdminMutationAllowImmature"
        ).checked;

    RenderAdminMutationGrid(
        "AdminMutationPatternGrid",
        "Pattern",
        AdminMutationPattern,
        ListOffsets.Pattern,
        AllowImmature
    );

    RenderAdminMutationGrid(
        "AdminMutationResultGrid",
        "Result",
        AdminMutationResult,
        ListOffsets.Result,
        false
    );
}


function RenderAdminMutationGrid(
    ContainerId,
    Mode,
    Matrix,
    ListOffsets,
    CyclePlantStages = false
) {
    const Grid =
        document.getElementById(
            ContainerId
        );

    Grid.replaceChildren();

    Grid.style.setProperty(
        "--RecipeWidth",
        String(
            Matrix[0]?.length ?? 1
        )
    );

    for (
        let Y = 0;
        Y < Matrix.length;
        Y++
    ) {
        for (
            let X = 0;
            X < Matrix[Y].length;
            X++
        ) {
            Grid.appendChild(
                CreateAdminMutationGridCell(
                    Mode,
                    X,
                    Y,
                    Matrix[Y][X],
                    ListOffsets?.[Y]?.[X],
                    CyclePlantStages
                )
            );
        }
    }
}


function CreateAdminMutationGridCell(
    Mode,
    X,
    Y,
    Value,
    ListOffset,
    CyclePlantStages = false
) {
    const Button =
        document.createElement(
            "button"
        );

    Button.type = "button";

    Button.className =
        "PlantTile GuideRecipeCell AdminMutationGridCell";

    if (
        AdminMutationSelectedCell !== null &&
        AdminMutationSelectedCell.Mode === Mode &&
        AdminMutationSelectedCell.X === X &&
        AdminMutationSelectedCell.Y === Y
    ) {
        Button.classList.add(
            "AdminMutationGridCellSelected"
        );
    }

    const Display =
        Mode === "Pattern"
            ? GetAdminMutationPatternDisplay(
                Value
            )
            : GetAdminMutationResultDisplay(
                Value
            );

    if (Display.ClassName !== "") {
        Button.classList.add(
            Display.ClassName
        );
    }

    if (Display.Image !== null) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "GuideRecipeImage PlantSprite";

        Image.src =
            Display.Image;

        Image.alt = "";

        Button.appendChild(
            Image
        );
    }

    const Label =
        document.createElement(
            "span"
        );

    Label.className =
        "GuideRecipeLabel";

    Label.textContent =
        Display.Label;

    Button.appendChild(
        Label
    );

    Button.title =
        Display.Label;

    const ListNumber =
        GetMutationRecipePreviewListReference(
            Value
        );

    if (ListNumber !== null) {
        RegisterMutationRecipePreviewListCell(
            Button,
            AdminMutationLists[
                ListNumber - 1
            ],
            ListNumber,
            ListOffset,
            AdminMutationPlantCatalogue,
            "GuideRecipeLabel",
            Mode === "Pattern" &&
                CyclePlantStages
        );
    } else if (
        Mode === "Pattern" &&
        CyclePlantStages === true
    ) {
        const PlantKey =
            typeof Value === "string"
                ? Value
                : Value !== null &&
                    typeof Value === "object" &&
                    typeof Value.Plant === "string"
                    ? Value.Plant
                    : null;

        if (
            PlantKey !== null &&
            AdminMutationPlantCatalogue[
                PlantKey
            ] !== undefined
        ) {
            RegisterMutationRecipePreviewPlantStageCell(
                Button,
                AdminMutationPlantCatalogue[
                    PlantKey
                ]
            );
        }
    }

    Button.addEventListener(
        "click",
        () => {
            SelectAdminMutationCell(
                Mode,
                X,
                Y
            );
        }
    );

    return Button;
}


function GetAdminMutationPatternDisplay(
    Value
) {
    if (
        Value === null ||
        Value === "Any"
    ) {
        return {
            Label: "Any",
            Image: null,
            ClassName:
                "MutationRecipeAny"
        };
    }

    if (Value === "Empty") {
        return {
            Label: "Empty",
            Image: null,
            ClassName:
                "GuideRecipeEmpty"
        };
    }

    if (typeof Value === "string") {
        const ListNumber =
            GetAdminMutationListReference(
                Value
            );

        if (ListNumber !== null) {
            return {
                Label:
                    "List " + ListNumber,
                Image: null,
                ClassName:
                    "MutationRecipeMatcher"
            };
        }

        return GetAdminMutationPlantDisplay(
            Value,
            "GuideRecipePlant"
        );
    }

    if (
        Value !== null &&
        typeof Value === "object"
    ) {
        const Parts = [];

        if (
            typeof Value.Plant === "string" &&
            Value.Plant !== ""
        ) {
            Parts.push(
                GetAdminPlantName(
                    Value.Plant
                )
            );
        }

        if (
            Array.isArray(Value.Tags) &&
            Value.Tags.length > 0
        ) {
            Parts.push(
                "Tags: " +
                Value.Tags.join(", ")
            );
        }

        if (
            Array.isArray(Value.TagsAny) &&
            Value.TagsAny.length > 0
        ) {
            Parts.push(
                "Any: " +
                Value.TagsAny.join(", ")
            );
        }

        if (
            Array.isArray(Value.TagsNot) &&
            Value.TagsNot.length > 0
        ) {
            Parts.push(
                "Not: " +
                Value.TagsNot.join(", ")
            );
        }

        if (
            typeof Value.Capture === "string" &&
            Value.Capture !== ""
        ) {
            Parts.push(
                "$" +
                Value.Capture
            );
        }

        const Image =
            typeof Value.Plant === "string"
                ? GetAdminMutationPlantImage(
                    Value.Plant
                )
                : null;

        return {
            Label:
                Parts.length > 0
                    ? Parts.join("\n")
                    : "Any plant",
            Image: Image,
            ClassName:
                "MutationRecipeMatcher"
        };
    }

    return {
        Label: "Any",
        Image: null,
        ClassName:
            "MutationRecipeAny"
    };
}


function GetAdminMutationResultDisplay(
    Value
) {
    if (
        Value === null ||
        Value === "Keep"
    ) {
        return {
            Label: "Keep",
            Image: null,
            ClassName:
                "MutationRecipeKeep"
        };
    }

    if (Value === "Empty") {
        return {
            Label: "Empty",
            Image: null,
            ClassName:
                "GuideRecipeEmpty"
        };
    }

    if (
        typeof Value === "string" &&
        Value.startsWith("$")
    ) {
        return {
            Label: Value,
            Image: null,
            ClassName:
                "MutationRecipeCapture"
        };
    }

    if (typeof Value === "string") {
        const ListNumber =
            GetAdminMutationListReference(
                Value
            );

        if (ListNumber !== null) {
            return {
                Label:
                    "List " + ListNumber,
                Image: null,
                ClassName:
                    "MutationRecipeMatcher"
            };
        }

        return GetAdminMutationPlantDisplay(
            Value,
            "GuideRecipePlant"
        );
    }

    if (
        Value !== null &&
        typeof Value === "object" &&
        typeof Value.Plant === "string"
    ) {
        if (
            Value.Plant.startsWith("$")
        ) {
            return {
                Label: Value.Plant,
                Image: null,
                ClassName:
                    "MutationRecipeCapture"
            };
        }

        return GetAdminMutationPlantDisplay(
            Value.Plant,
            "GuideRecipePlant"
        );
    }

    return {
        Label: "Keep",
        Image: null,
        ClassName:
            "MutationRecipeKeep"
    };
}


function GetAdminMutationPlantDisplay(
    PlantKey,
    ClassName
) {
    return {
        Label:
            GetAdminPlantName(
                PlantKey
            ),
        Image:
            GetAdminMutationPlantImage(
                PlantKey
            ),
        ClassName:
            ClassName
    };
}


function GetAdminPlantName(
    PlantKey
) {
    return AdminMutationPlantCatalogue[
        PlantKey
    ]?.Name ?? PlantKey;
}


function GetAdminMutationPlantImage(
    PlantKey
) {
    return GetPlantMatureImageSource(
        AdminMutationPlantCatalogue[
            PlantKey
        ] ?? PlantKey
    );
}


function SelectAdminMutationCell(
    Mode,
    X,
    Y
) {
    AdminMutationSelectedCell = {
        Mode: Mode,
        X: X,
        Y: Y
    };

    const Editor =
        document.getElementById(
            "AdminMutationCellEditor"
        );

    Editor.hidden = false;

    document.getElementById(
        "AdminMutationCellEditorTitle"
    ).textContent =
        (
            Mode === "Pattern"
                ? "Arrange"
                : "Result"
        ) +
        " cell " +
        (X + 1) +
        ", " +
        (Y + 1);

    const PatternControls =
        document.getElementById(
            "AdminMutationPatternCellControls"
        );

    const ResultControls =
        document.getElementById(
            "AdminMutationResultCellControls"
        );

    PatternControls.hidden =
        Mode !== "Pattern";

    ResultControls.hidden =
        Mode !== "Result";

    if (Mode === "Pattern") {
        LoadAdminMutationPatternCellControls(
            AdminMutationPattern[Y][X]
        );
    } else {
        LoadAdminMutationResultCellControls(
            AdminMutationResult[Y][X]
        );
    }

    RenderAdminMutationGrids();
}


function HideAdminMutationCellEditor() {
    document.getElementById(
        "AdminMutationCellEditor"
    ).hidden = true;
}


function LoadAdminMutationPatternCellControls(
    Value
) {
    let Type = "Any";

    if (Value === "Empty") {
        Type = "Empty";
    } else if (
        GetAdminMutationListReference(
            Value
        ) !== null
    ) {
        Type = "List";
    } else if (
        typeof Value === "string" &&
        Value !== "Any"
    ) {
        Type = "Plant";
    } else if (
        Value !== null &&
        typeof Value === "object"
    ) {
        Type = "Matcher";
    }

    SetAdminMutationField(
        "AdminMutationPatternCellType",
        Type
    );

    SetAdminMutationField(
        "AdminMutationPatternPlant",
        Type === "Plant"
            ? Value
            : GetFirstAdminPlantKey()
    );

    SetAdminMutationField(
        "AdminMutationPatternList",
        Type === "List"
            ? GetAdminMutationListReference(
                Value
            )
            : AdminMutationLists.length > 0
                ? 1
                : ""
    );

    const Matcher =
        Type === "Matcher"
            ? Value
            : {};

    SetAdminMutationField(
        "AdminMutationMatcherPlant",
        Matcher.Plant ?? ""
    );

    SetAdminMutationField(
        "AdminMutationMatcherTags",
        Array.isArray(
            Matcher.Tags
        )
            ? Matcher.Tags.join(", ")
            : ""
    );

    SetAdminMutationField(
        "AdminMutationMatcherTagsAny",
        Array.isArray(
            Matcher.TagsAny
        )
            ? Matcher.TagsAny.join(", ")
            : ""
    );

    SetAdminMutationField(
        "AdminMutationMatcherTagsNot",
        Array.isArray(
            Matcher.TagsNot
        )
            ? Matcher.TagsNot.join(", ")
            : ""
    );

    SetAdminMutationField(
        "AdminMutationMatcherCapture",
        Matcher.Capture ?? ""
    );

    UpdateAdminMutationPatternControlVisibility();
}


function LoadAdminMutationResultCellControls(
    Value
) {
    let Type = "Keep";
    let PlantKey =
        GetFirstAdminPlantKey();
    let Capture = "";

    if (Value === "Empty") {
        Type = "Empty";
    } else if (
        GetAdminMutationListReference(
            Value
        ) !== null
    ) {
        Type = "List";
    } else if (
        typeof Value === "string" &&
        Value.startsWith("$")
    ) {
        Type = "Capture";
        Capture =
            Value.slice(1);
    } else if (
        typeof Value === "string" &&
        Value !== "Keep"
    ) {
        Type = "Plant";
        PlantKey = Value;
    } else if (
        Value !== null &&
        typeof Value === "object" &&
        typeof Value.Plant === "string"
    ) {
        if (
            Value.Plant.startsWith("$")
        ) {
            Type = "Capture";
            Capture =
                Value.Plant.slice(1);
        } else {
            Type = "Plant";
            PlantKey =
                Value.Plant;
        }
    }

    SetAdminMutationField(
        "AdminMutationResultCellType",
        Type
    );

    SetAdminMutationField(
        "AdminMutationResultPlant",
        PlantKey
    );

    SetAdminMutationField(
        "AdminMutationResultList",
        Type === "List"
            ? GetAdminMutationListReference(
                Value
            )
            : AdminMutationLists.length > 0
                ? 1
                : ""
    );

    SetAdminMutationField(
        "AdminMutationResultCapture",
        Capture
    );

    UpdateAdminMutationResultControlVisibility();
}


function UpdateAdminMutationPatternControlVisibility() {
    const Type =
        document.getElementById(
            "AdminMutationPatternCellType"
        ).value;

    document.getElementById(
        "AdminMutationPatternPlantRow"
    ).hidden =
        Type !== "Plant";

    document.getElementById(
        "AdminMutationPatternListRow"
    ).hidden =
        Type !== "List";

    document.getElementById(
        "AdminMutationMatcherRows"
    ).hidden =
        Type !== "Matcher";
}


function UpdateAdminMutationResultControlVisibility() {
    const Type =
        document.getElementById(
            "AdminMutationResultCellType"
        ).value;

    document.getElementById(
        "AdminMutationResultPlantRow"
    ).hidden =
        Type !== "Plant";

    document.getElementById(
        "AdminMutationResultListRow"
    ).hidden =
        Type !== "List";

    document.getElementById(
        "AdminMutationResultCaptureRow"
    ).hidden =
        Type !== "Capture";
}


function ApplyAdminMutationSelectedPatternCell() {
    if (
        AdminMutationSelectedCell === null ||
        AdminMutationSelectedCell.Mode !==
            "Pattern"
    ) {
        return;
    }

    const Type =
        document.getElementById(
            "AdminMutationPatternCellType"
        ).value;

    let Value = "Any";

    if (Type === "Empty") {
        Value = "Empty";
    } else if (Type === "Plant") {
        Value =
            document.getElementById(
                "AdminMutationPatternPlant"
            ).value;
    } else if (Type === "List") {
        const ListNumber =
            Number(
                document.getElementById(
                    "AdminMutationPatternList"
                ).value
            );

        Value =
            Number.isInteger(ListNumber) &&
            ListNumber >= 1 &&
            ListNumber <= AdminMutationLists.length
                ? "List:" + ListNumber
                : "Any";
    } else if (Type === "Matcher") {
        const Matcher = {};

        const Plant =
            document.getElementById(
                "AdminMutationMatcherPlant"
            ).value;

        if (Plant !== "") {
            Matcher.Plant = Plant;
        }

        AddAdminMutationTagField(
            Matcher,
            "Tags",
            "AdminMutationMatcherTags"
        );

        AddAdminMutationTagField(
            Matcher,
            "TagsAny",
            "AdminMutationMatcherTagsAny"
        );

        AddAdminMutationTagField(
            Matcher,
            "TagsNot",
            "AdminMutationMatcherTagsNot"
        );

        const Capture =
            document.getElementById(
                "AdminMutationMatcherCapture"
            ).value.trim();

        if (Capture !== "") {
            Matcher.Capture =
                Capture;
        }

        Value = Matcher;
    }

    AdminMutationPattern[
        AdminMutationSelectedCell.Y
    ][
        AdminMutationSelectedCell.X
    ] = Value;

    UpdateAdminMutationPatternControlVisibility();
    RenderAdminMutationGrids();
    RenderAdminMutationJsonPreview();
}


function ApplyAdminMutationSelectedResultCell() {
    if (
        AdminMutationSelectedCell === null ||
        AdminMutationSelectedCell.Mode !==
            "Result"
    ) {
        return;
    }

    const Type =
        document.getElementById(
            "AdminMutationResultCellType"
        ).value;

    let Value = "Keep";

    if (Type === "Empty") {
        Value = "Empty";
    } else if (Type === "Plant") {
        Value =
            document.getElementById(
                "AdminMutationResultPlant"
            ).value;
    } else if (Type === "List") {
        const ListNumber =
            Number(
                document.getElementById(
                    "AdminMutationResultList"
                ).value
            );

        Value =
            Number.isInteger(ListNumber) &&
            ListNumber >= 1 &&
            ListNumber <= AdminMutationLists.length
                ? "List:" + ListNumber
                : "Keep";
    } else if (Type === "Capture") {
        const Capture =
            document.getElementById(
                "AdminMutationResultCapture"
            ).value.trim();

        Value =
            Capture === ""
                ? "Keep"
                : "$" + Capture;
    }

    AdminMutationResult[
        AdminMutationSelectedCell.Y
    ][
        AdminMutationSelectedCell.X
    ] = Value;

    UpdateAdminMutationResultControlVisibility();
    RenderAdminMutationGrids();
    RenderAdminMutationJsonPreview();
}


function AddAdminMutationTagField(
    Matcher,
    PropertyName,
    ElementId
) {
    const Tags =
        ParseAdminMutationList(
            document.getElementById(
                ElementId
            ).value
        );

    if (Tags.length > 0) {
        Matcher[
            PropertyName
        ] = Tags;
    }
}


function ParseAdminMutationList(
    Value
) {
    return [
        ...new Set(
            String(Value)
                .split(",")
                .map(
                    Item =>
                        Item.trim()
                )
                .filter(
                    Item =>
                        Item.length > 0
                )
        )
    ];
}


function GetFirstAdminPlantKey() {
    return GetSortedAdminPlants()[0]
        ?.[0] ?? "";
}


function LoadAdminMutationFailure(
    Failure
) {
    if (Failure === "Clear") {
        SetAdminMutationField(
            "AdminMutationFailureType",
            "Clear"
        );

        SetAdminMutationField(
            "AdminMutationFailureJson",
            "[]"
        );

        return;
    }

    if (Array.isArray(Failure)) {
        SetAdminMutationField(
            "AdminMutationFailureType",
            "Custom"
        );

        SetAdminMutationField(
            "AdminMutationFailureJson",
            JSON.stringify(
                Failure,
                null,
                4
            )
        );

        return;
    }

    SetAdminMutationField(
        "AdminMutationFailureType",
        "Keep"
    );

    SetAdminMutationField(
        "AdminMutationFailureJson",
        "[]"
    );
}


function UpdateAdminMutationFailureVisibility() {
    const Type =
        document.getElementById(
            "AdminMutationFailureType"
        ).value;

    document.getElementById(
        "AdminMutationFailureJsonRow"
    ).hidden =
        Type !== "Custom";
}


function GetAdminMutationFailure() {
    const Type =
        document.getElementById(
            "AdminMutationFailureType"
        ).value;

    if (Type === "Keep") {
        return "Keep";
    }

    if (Type === "Clear") {
        return "Clear";
    }

    const Raw =
        document.getElementById(
            "AdminMutationFailureJson"
        ).value.trim();

    const Failure =
        JSON.parse(
            Raw === ""
                ? "[]"
                : Raw
        );

    if (!Array.isArray(Failure)) {
        throw new Error(
            "Custom failure result must be a JSON matrix."
        );
    }

    return Failure;
}


function SetAdminMutationRelations(
    Relations
) {
    const Used = new Set(
        Relations.PlantsUsed ?? []
    );

    const Created = new Set(
        Relations.PlantsCreated ?? []
    );

    for (
        const Input
        of document.querySelectorAll(
            ".AdminPlantChecklist input"
        )
    ) {
        const PlantId =
            Number(Input.value);

        Input.checked =
            Input.dataset.relation ===
                "PlantsUsed"
                ? Used.has(PlantId)
                : Created.has(PlantId);
    }
}


function GetAdminMutationRelation(
    RelationName
) {
    return [
        ...document.querySelectorAll(
            '.AdminPlantChecklist input[data-relation="' +
            RelationName +
            '"]:checked'
        )
    ]
        .map(
            Input =>
                Number(Input.value)
        )
        .sort(
            (A, B) => A - B
        );
}


function GetAdminMutationFormData() {
    return {
        Id: Number(
            document.getElementById(
                "AdminMutationId"
            ).value
        ),

        MutationKey:
            document.getElementById(
                "AdminMutationKey"
            ).value.trim(),

        Name:
            document.getElementById(
                "AdminMutationName"
            ).value.trim(),

        Description:
            document.getElementById(
                "AdminMutationDescription"
            ).value.trim(),

        Hint:
            document.getElementById(
                "AdminMutationHint"
            ).value.trim(),

        Priority: Number(
            document.getElementById(
                "AdminMutationPriority"
            ).value
        ),

        Chance:
            Number(
                document.getElementById(
                    "AdminMutationChance"
                ).value
            ) /
            100,

        Cooldown: Number(
            document.getElementById(
                "AdminMutationCooldown"
            ).value
        ),

        Rotation:
            document.getElementById(
                "AdminMutationRotation"
            ).value,

        AllowImmature:
            document.getElementById(
                "AdminMutationAllowImmature"
            ).checked,

        Lists:
            CloneAdminMutationValue(
                AdminMutationLists
            ),

        Pattern:
            CloneAdminMutationValue(
                AdminMutationPattern
            ),

        Success:
            CloneAdminMutationValue(
                AdminMutationResult
            ),

        Failure:
            GetAdminMutationFailure(),

        Relations: {
            PlantsUsed:
                GetAdminMutationRelation(
                    "PlantsUsed"
                ),

            PlantsCreated:
                GetAdminMutationRelation(
                    "PlantsCreated"
                )
        },

        IsNew:
            AdminMutationEditingKey ===
                null
    };
}


async function SaveAdminMutation(
    Event
) {
    Event.preventDefault();

    if (AdminMutationSavePending) {
        return;
    }

    const Form =
        document.getElementById(
            "AdminMutationForm"
        );

    if (!Form.reportValidity()) {
        return;
    }

    let Mutation;

    try {
        Mutation =
            GetAdminMutationFormData();
    } catch (Error) {
        SetAdminMutationMessage(
            Error.message
        );

        return;
    }

    try {
        ValidateAdminMutation(
            Mutation,
            AdminMutationCatalogue,
            AdminMutationPlantCatalogue,
            AdminMutationEditingKey
        );
    } catch (Error) {
        SetAdminMutationMessage(
            Error.message
        );

        return;
    }

    AdminMutationSavePending = true;

    const SaveButton =
        document.getElementById(
            "AdminMutationSaveButton"
        );

    SaveButton.disabled = true;
    SaveButton.textContent =
        "Saving...";

    SetAdminMutationMessage(
        "Saving mutation..."
    );

    try {
        const Result =
            await AdminMutationRequest(
                "Save",
                {
                    Mutation: Mutation
                }
            );

        localStorage.removeItem(
            "SarahtoninGardenContent"
        );

        await LoadAdminMutationData(
            Result.MutationKey ??
            Mutation.MutationKey
        );

        SetAdminMutationMessage(
            "Mutation saved."
        );
    } catch (Error) {
        console.error(
            "Couldn't save mutation:",
            Error
        );

        SetAdminMutationMessage(
            Error.message ??
            "Couldn't save mutation."
        );
    } finally {
        AdminMutationSavePending = false;
        SaveButton.disabled = false;
        SaveButton.textContent =
            "Save mutation";
    }
}


function RenderAdminMutationJsonPreview() {
    const Preview =
        document.getElementById(
            "AdminMutationJsonPreview"
        );

    if (Preview === null) {
        return;
    }

    try {
        Preview.textContent =
            JSON.stringify(
                GetAdminMutationFormData(),
                null,
                4
            );
    } catch (Error) {
        Preview.textContent =
            "Invalid editor data: " +
            Error.message;
    }
}


function GetAdminMutationPortableRelations(
    Relations
) {
    const Result = {
        PlantsUsed: [],
        PlantsCreated: []
    };

    for (
        const RelationName
        of [
            "PlantsUsed",
            "PlantsCreated"
        ]
    ) {
        for (
            const PlantId
            of Relations?.[
                RelationName
            ] ?? []
        ) {
            const PlantKey =
                GetAdminPlantKeyById(
                    PlantId,
                    AdminMutationPlantCatalogue
                );

            if (PlantKey !== null) {
                Result[RelationName].push(
                    PlantKey
                );
            }
        }
    }

    return Result;
}


function GetAdminMutationPortableData(
    Mutation
) {
    return {
        MutationKey:
            Mutation.MutationKey,
        Name: Mutation.Name,
        Description:
            Mutation.Description,
        Hint:
            Mutation.Hint === ""
                ? null
                : Mutation.Hint,
        Priority: Mutation.Priority,
        Chance: Mutation.Chance,
        Cooldown: Mutation.Cooldown,
        Rotation: Mutation.Rotation,
        AllowImmature:
            Mutation.AllowImmature === true,
        Lists:
            CloneAdminMutationValue(
                Mutation.Lists ?? []
            ),
        Pattern:
            CloneAdminMutationValue(
                Mutation.Pattern
            ),
        Success:
            CloneAdminMutationValue(
                Mutation.Success
            ),
        Failure:
            CloneAdminMutationValue(
                Mutation.Failure
            ),
        Relations:
            GetAdminMutationPortableRelations(
                Mutation.Relations
            )
    };
}


function ExportAdminMutationJson() {
    const Form =
        document.getElementById(
            "AdminMutationForm"
        );

    if (!Form.reportValidity()) {
        return;
    }

    try {
        const Mutation =
            GetAdminMutationFormData();

        ValidateAdminMutation(
            Mutation,
            AdminMutationCatalogue,
            AdminMutationPlantCatalogue,
            AdminMutationEditingKey
        );

        DownloadAdminJson(
            "Mutation-" +
            Mutation.MutationKey +
            ".json",
            {
                Type: "Mutation",
                Version: 1,
                Mutation:
                    GetAdminMutationPortableData(
                        Mutation
                    )
            }
        );

        SetAdminMutationMessage(
            "Mutation JSON exported. Numeric IDs are not included."
        );
    } catch (Error) {
        SetAdminMutationMessage(
            Error.message ??
            "Couldn't export mutation JSON."
        );
    }
}


function ConvertAdminMutationPortableRelations(
    Relations
) {
    if (
        Relations === undefined ||
        Relations === null
    ) {
        return {
            PlantsUsed: [],
            PlantsCreated: []
        };
    }

    if (!IsAdminPlainObject(Relations)) {
        throw new Error(
            "Relations must be an object."
        );
    }

    const Result = {
        PlantsUsed: [],
        PlantsCreated: []
    };

    for (
        const RelationName
        of [
            "PlantsUsed",
            "PlantsCreated"
        ]
    ) {
        const Values =
            Relations[RelationName] ?? [];

        if (!Array.isArray(Values)) {
            throw new Error(
                RelationName +
                " must be an array of Plant Keys."
            );
        }

        for (const Value of Values) {
            if (typeof Value !== "string") {
                throw new Error(
                    RelationName +
                    " must use Plant Keys, not numeric IDs."
                );
            }

            const Plant =
                AdminMutationPlantCatalogue[
                    Value
                ];

            if (Plant === undefined) {
                throw new Error(
                    RelationName +
                    " references unknown Plant Key: " +
                    Value
                );
            }

            Result[RelationName].push(
                Number(Plant.Id)
            );
        }

        Result[RelationName] = [
            ...new Set(
                Result[RelationName]
            )
        ].sort(
            (A, B) => A - B
        );
    }

    return Result;
}


async function ImportAdminMutationJson(
    Event
) {
    const Input = Event.target;
    const File = Input.files?.[0];

    Input.value = "";

    if (File === undefined) {
        return;
    }

    try {
        const DocumentData =
            await ReadAdminJsonFile(
                File
            );

        if (
            IsAdminPlainObject(
                DocumentData
            ) &&
            DocumentData.Type !==
                undefined &&
            DocumentData.Type !== "Mutation"
        ) {
            throw new Error(
                "That JSON file is not a mutation export."
            );
        }

        if (
            IsAdminPlainObject(
                DocumentData
            ) &&
            DocumentData.Version !==
                undefined &&
            Number(DocumentData.Version) !== 1
        ) {
            throw new Error(
                "Unsupported mutation JSON version."
            );
        }

        const Imported =
            IsAdminPlainObject(
                DocumentData?.Mutation
            )
                ? DocumentData.Mutation
                : DocumentData;

        if (!IsAdminPlainObject(Imported)) {
            throw new Error(
                "Mutation JSON must contain a mutation object."
            );
        }

        const MutationKey =
            String(
                Imported.MutationKey ?? ""
            ).trim();

        const Existing =
            AdminMutationCatalogue[
                MutationKey
            ];

        const Mutation = {
            Id:
                Existing?.Id ??
                GetNextAdminMutationId(),
            MutationKey: MutationKey,
            Name:
                String(
                    Imported.Name ?? ""
                ).trim(),
            Description:
                typeof Imported.Description ===
                    "string"
                    ? Imported.Description.trim()
                    : "",
            Hint:
                typeof Imported.Hint ===
                    "string"
                    ? Imported.Hint.trim()
                    : "",
            Priority:
                Number(
                    Imported.Priority ?? 0
                ),
            Chance:
                Number(
                    Imported.Chance
                ),
            Cooldown:
                Number(
                    Imported.Cooldown
                ),
            Rotation:
                Imported.Rotation ??
                "None",
            AllowImmature:
                Imported.AllowImmature ===
                true,
            Lists:
                CloneAdminMutationValue(
                    Imported.Lists ?? []
                ),
            Pattern:
                CloneAdminMutationValue(
                    Imported.Pattern
                ),
            Success:
                CloneAdminMutationValue(
                    Imported.Success
                ),
            Failure:
                CloneAdminMutationValue(
                    Imported.Failure ??
                    "Keep"
                ),
            Relations:
                ConvertAdminMutationPortableRelations(
                    Imported.Relations
                ),
            IsNew:
                Existing === undefined
        };

        ValidateAdminMutation(
            Mutation,
            AdminMutationCatalogue,
            AdminMutationPlantCatalogue,
            Existing === undefined
                ? null
                : MutationKey
        );

        if (Existing === undefined) {
            StartNewAdminMutation();
            AdminMutationEditingKey = null;
        } else {
            LoadAdminMutationIntoForm(
                MutationKey
            );
        }

        SetAdminMutationField(
            "AdminMutationId",
            Mutation.Id
        );
        SetAdminMutationField(
            "AdminMutationKey",
            Mutation.MutationKey
        );
        SetAdminMutationField(
            "AdminMutationName",
            Mutation.Name
        );
        SetAdminMutationField(
            "AdminMutationDescription",
            Mutation.Description
        );
        SetAdminMutationField(
            "AdminMutationHint",
            Mutation.Hint
        );
        SetAdminMutationField(
            "AdminMutationPriority",
            Mutation.Priority
        );
        SetAdminMutationField(
            "AdminMutationChance",
            Mutation.Chance * 100
        );
        SetAdminMutationDurationFields(
            Mutation.Cooldown
        );
        SetAdminMutationField(
            "AdminMutationRotation",
            Mutation.Rotation
        );

        document.getElementById(
            "AdminMutationAllowImmature"
        ).checked =
            Mutation.AllowImmature;

        AdminMutationLists =
            NormalizeAdminMutationLists(
                Mutation.Lists
            );

        AdminMutationPattern =
            CloneAdminMutationMatrix(
                Mutation.Pattern,
                "Any"
            );
        AdminMutationResult =
            NormalizeAdminMutationMatrix(
                Mutation.Success,
                AdminMutationPattern[0]
                    .length,
                AdminMutationPattern.length,
                "Keep"
            );

        SetAdminMutationField(
            "AdminMutationWidth",
            AdminMutationPattern[0]
                .length
        );
        SetAdminMutationField(
            "AdminMutationHeight",
            AdminMutationPattern.length
        );

        LoadAdminMutationFailure(
            Mutation.Failure
        );
        SetAdminMutationRelations(
            Mutation.Relations
        );

        document.getElementById(
            "AdminMutationId"
        ).readOnly =
            Existing !== undefined;
        document.getElementById(
            "AdminMutationKey"
        ).readOnly =
            Existing !== undefined;

        AdminMutationSelectedCell = null;
        HideAdminMutationCellEditor();
        RenderAdminMutationLists();
        RenderAdminMutationGrids();
        UpdateAdminMutationFailureVisibility();
        UpdateAdminMutationCooldownHint();
        RenderAdminMutationJsonPreview();

        SetAdminMutationMessage(
            Existing === undefined
                ? "Mutation JSON imported as a new mutation. Review it, then save when ready."
                : "Mutation JSON imported over " +
                    MutationKey +
                    ". Review it, then save when ready."
        );
    } catch (Error) {
        SetAdminMutationMessage(
            Error.message ??
            "Couldn't import mutation JSON."
        );
    }
}


function SetAdminMutationDurationFields(
    Milliseconds
) {
    Milliseconds = Math.max(
        0,
        Number(Milliseconds) || 0
    );

    const TotalSeconds =
        Math.round(
            Milliseconds / 1000
        );

    SetAdminMutationField(
        "AdminMutationCooldownHours",
        Math.floor(
            TotalSeconds / 3600
        )
    );

    SetAdminMutationField(
        "AdminMutationCooldownMinutes",
        Math.floor(
            (TotalSeconds % 3600) / 60
        )
    );

    SetAdminMutationField(
        "AdminMutationCooldownSeconds",
        TotalSeconds % 60
    );

    SetAdminMutationField(
        "AdminMutationCooldown",
        TotalSeconds * 1000
    );

    UpdateAdminMutationCooldownHint();
}


function SyncAdminMutationCooldown() {
    const Hours = Number(
        document.getElementById(
            "AdminMutationCooldownHours"
        ).value
    );

    const Minutes = Number(
        document.getElementById(
            "AdminMutationCooldownMinutes"
        ).value
    );

    const Seconds = Number(
        document.getElementById(
            "AdminMutationCooldownSeconds"
        ).value
    );

    const Values = [
        Hours,
        Minutes,
        Seconds
    ];

    if (
        Values.some(
            Value =>
                !Number.isFinite(Value)
        )
    ) {
        SetAdminMutationField(
            "AdminMutationCooldown",
            ""
        );

        UpdateAdminMutationCooldownHint();
        return;
    }

    const Milliseconds =
        Math.max(0, Hours) * 3600000 +
        Math.max(0, Minutes) * 60000 +
        Math.max(0, Seconds) * 1000;

    SetAdminMutationField(
        "AdminMutationCooldown",
        Milliseconds
    );

    UpdateAdminMutationCooldownHint();
}


function UpdateAdminMutationCooldownHint() {
    const Cooldown = Number(
        document.getElementById(
            "AdminMutationCooldown"
        ).value
    );

    document.getElementById(
        "AdminMutationCooldownHint"
    ).textContent =
        Number.isFinite(Cooldown)
            ? Cooldown.toLocaleString() +
                " ms stored"
            : "";
}


function SetAdminMutationMessage(
    Message
) {
    const Element =
        document.getElementById(
            "AdminMutationMessage"
        );

    if (Element !== null) {
        Element.textContent =
            Message;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartAdminMutationEditor
);
