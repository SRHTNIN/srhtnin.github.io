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
        "AdminMutationResizeButton"
    ).addEventListener(
        "click",
        ResizeAdminMutationRecipe
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

    document.getElementById(
        "AdminMutationCooldown"
    ).addEventListener(
        "input",
        UpdateAdminMutationCooldownHint
    );
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
    RenderAdminMutationRelationChecklists();
    RenderAdminMutationSelect();

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

    SetAdminMutationField(
        "AdminMutationCooldown",
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
    RenderAdminMutationGrids();
    UpdateAdminMutationFailureVisibility();
    UpdateAdminMutationCooldownHint();
    RenderAdminMutationJsonPreview();
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
        "AdminMutationPriority",
        10
    );

    SetAdminMutationField(
        "AdminMutationChance",
        100
    );

    SetAdminMutationField(
        "AdminMutationCooldown",
        120000
    );

    SetAdminMutationField(
        "AdminMutationRotation",
        "Any"
    );

    document.getElementById(
        "AdminMutationAllowImmature"
    ).checked = false;

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
    RenderAdminMutationGrid(
        "AdminMutationPatternGrid",
        "Pattern",
        AdminMutationPattern
    );

    RenderAdminMutationGrid(
        "AdminMutationResultGrid",
        "Result",
        AdminMutationResult
    );
}


function RenderAdminMutationGrid(
    ContainerId,
    Mode,
    Matrix
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
                    Matrix[Y][X]
                )
            );
        }
    }
}


function CreateAdminMutationGridCell(
    Mode,
    X,
    Y,
    Value
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
    const Images =
        PlantImages[
            PlantKey
        ] ?? [];

    if (
        !Array.isArray(Images) ||
        Images.length === 0
    ) {
        return null;
    }

    return Images[
        Images.length - 1
    ];
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
            ? FormatAdminMutationDuration(
                Cooldown
            )
            : "";
}


function FormatAdminMutationDuration(
    Milliseconds
) {
    Milliseconds = Math.max(
        0,
        Number(Milliseconds)
    );

    if (Milliseconds < 1000) {
        return Milliseconds + "ms";
    }

    const TotalSeconds =
        Math.round(
            Milliseconds /
            1000
        );

    const Hours =
        Math.floor(
            TotalSeconds /
            3600
        );

    const Minutes =
        Math.floor(
            (
                TotalSeconds %
                3600
            ) /
            60
        );

    const Seconds =
        TotalSeconds % 60;

    const Parts = [];

    if (Hours > 0) {
        Parts.push(
            Hours + "h"
        );
    }

    if (Minutes > 0) {
        Parts.push(
            Minutes + "m"
        );
    }

    if (
        Seconds > 0 ||
        Parts.length === 0
    ) {
        Parts.push(
            Seconds + "s"
        );
    }

    return Parts.join(" ");
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
