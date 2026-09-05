let AdminPlantCatalogue = {};
let AdminPlantMutationCatalogue = {};
let AdminPlantEditingKey = null;
let AdminPlantSavePending = false;
let AdminPlantImagePending = false;


async function StartAdminPlantEditor() {
    try {
        const Status =
            await GetAdminStatus();

        if (
            Status.Success !== true ||
            Status.IsAdmin !== true
        ) {
            SetAdminPlantMessage(
                "Admin access required."
            );

            return;
        }

        BindAdminPlantEditor();
        await LoadAdminPlants();
    } catch (Error) {
        console.error(
            "Couldn't start Plant editor:",
            Error
        );

        SetAdminPlantMessage(
            Error.message ??
            "Couldn't load the Plant editor."
        );
    }
}


function BindAdminPlantEditor() {
    document.getElementById(
        "AdminPlantSelect"
    ).addEventListener(
        "change",
        Event => {
            const PlantKey =
                Event.target.value;

            if (PlantKey === "") {
                StartNewAdminPlant();
                return;
            }

            LoadAdminPlantIntoForm(
                PlantKey
            );
        }
    );

    document.getElementById(
        "AdminPlantNewButton"
    ).addEventListener(
        "click",
        StartNewAdminPlant
    );

    document.getElementById(
        "AdminPlantDuplicateButton"
    ).addEventListener(
        "click",
        DuplicateAdminPlant
    );

    document.getElementById(
        "AdminPlantImportButton"
    ).addEventListener(
        "click",
        () => {
            document.getElementById(
                "AdminPlantImportFile"
            ).click();
        }
    );

    document.getElementById(
        "AdminPlantImportFile"
    ).addEventListener(
        "change",
        ImportAdminPlantJson
    );

    document.getElementById(
        "AdminPlantExportButton"
    ).addEventListener(
        "click",
        ExportAdminPlantJson
    );

    document.getElementById(
        "AdminPlantForm"
    ).addEventListener(
        "submit",
        SaveAdminPlant
    );

    for (
        const ElementId
        of [
            "AdminPlantId",
            "AdminPlantKey",
            "AdminPlantName",
            "AdminPlantHarvestMultiplier",
            "AdminPlantShopPlant",
            "AdminPlantBaseCost"
        ]
    ) {
        document.getElementById(
            ElementId
        ).addEventListener(
            "input",
            RenderAdminPlantPreview
        );

        document.getElementById(
            ElementId
        ).addEventListener(
            "change",
            RenderAdminPlantPreview
        );
    }

    for (
        const ElementId
        of [
            "AdminPlantGrowthHours",
            "AdminPlantGrowthMinutes",
            "AdminPlantGrowthSeconds"
        ]
    ) {
        document.getElementById(
            ElementId
        ).addEventListener(
            "input",
            () => {
                SyncAdminPlantGrowthTime();
                RenderAdminPlantPreview();
            }
        );

        document.getElementById(
            ElementId
        ).addEventListener(
            "change",
            () => {
                SyncAdminPlantGrowthTime();
                RenderAdminPlantPreview();
            }
        );
    }

    document.getElementById(
        "AdminPlantShopPlant"
    ).addEventListener(
        "change",
        () => {
            UpdateAdminPlantShopFields();
            RenderAdminPlantPreview();
        }
    );

    document.getElementById(
        "AdminPlantImageUploadButton"
    ).addEventListener(
        "click",
        UploadAdminPlantImages
    );
}


async function AdminPlantRequest(
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
        "/AdminPlants.php",
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
            "Plant admin API returned invalid JSON."
        );
    }

    if (
        !Response.ok ||
        Result.Success !== true
    ) {
        throw new Error(
            Result.Error ??
            "Plant admin request failed."
        );
    }

    return Result;
}


async function AdminPlantMutationRequest() {
    const SaveKey =
        localStorage.getItem(
            SaveKeyName
        );

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
            "Couldn't load mutations for the Plant editor."
        );
    }

    return Result;
}


async function LoadAdminPlants(
    PreferredPlantKey = null
) {
    SetAdminPlantMessage(
        "Loading plants..."
    );

    const [
        PlantResult,
        MutationResult
    ] = await Promise.all([
        AdminPlantRequest(
            "List"
        ),
        AdminPlantMutationRequest()
    ]);

    AdminPlantCatalogue =
        PlantResult.Plants ?? {};

    AdminPlantMutationCatalogue =
        MutationResult.Mutations ?? {};

    Plants =
        AdminPlantCatalogue;

    MutationSets =
        AdminPlantMutationCatalogue;

    RenderAdminPlantSelect();
    RenderAdminPlantDuplicateSelect();

    const Keys =
        GetSortedAdminPlantKeys();

    const PlantKey =
        PreferredPlantKey !== null &&
        AdminPlantCatalogue[
            PreferredPlantKey
        ] !== undefined
            ? PreferredPlantKey
            : Keys[0] ?? null;

    if (PlantKey === null) {
        StartNewAdminPlant();
    } else {
        LoadAdminPlantIntoForm(
            PlantKey
        );
    }

    SetAdminPlantMessage(
        Keys.length === 1
            ? "1 plant loaded."
            : Keys.length +
                " plants loaded."
    );
}


function GetSortedAdminPlantKeys() {
    return Object.keys(
        AdminPlantCatalogue
    ).sort(
        (A, B) => {
            const PlantA =
                AdminPlantCatalogue[A];

            const PlantB =
                AdminPlantCatalogue[B];

            return (
                Number(PlantA.Id) -
                    Number(PlantB.Id) ||
                A.localeCompare(B)
            );
        }
    );
}


function RenderAdminPlantSelect() {
    const Select =
        document.getElementById(
            "AdminPlantSelect"
        );

    Select.replaceChildren();

    for (
        const PlantKey
        of GetSortedAdminPlantKeys()
    ) {
        const Plant =
            AdminPlantCatalogue[
                PlantKey
            ];

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
            Plant.Name +
            (
                Plant.Archived === true
                    ? " (archived)"
                    : ""
            );

        Select.appendChild(
            Option
        );
    }
}


function RenderAdminPlantDuplicateSelect() {
    const Select =
        document.getElementById(
            "AdminPlantDuplicateSelect"
        );

    if (Select === null) {
        return;
    }

    const PreviousValue =
        Select.value;

    Select.replaceChildren();

    for (
        const PlantKey
        of GetSortedAdminPlantKeys()
    ) {
        const Plant =
            AdminPlantCatalogue[
                PlantKey
            ];

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
            Plant.Name +
            (
                Plant.Archived === true
                    ? " (archived)"
                    : ""
            );

        Select.appendChild(
            Option
        );
    }

    if (
        PreviousValue !== "" &&
        AdminPlantCatalogue[
            PreviousValue
        ] !== undefined
    ) {
        Select.value =
            PreviousValue;
    }
}


function LoadAdminPlantIntoForm(
    PlantKey
) {
    const Plant =
        AdminPlantCatalogue[
            PlantKey
        ];

    if (Plant === undefined) {
        return;
    }

    AdminPlantEditingKey =
        PlantKey;

    document.getElementById(
        "AdminPlantSelect"
    ).value = PlantKey;

    SetAdminPlantField(
        "AdminPlantId",
        Plant.Id
    );

    SetAdminPlantField(
        "AdminPlantKey",
        PlantKey
    );

    SetAdminPlantField(
        "AdminPlantName",
        Plant.Name ?? ""
    );

    SetAdminPlantField(
        "AdminPlantDescription",
        Plant.Description ?? ""
    );

    SetAdminPlantField(
        "AdminPlantTags",
        Array.isArray(
            Plant.Tags
        )
            ? Plant.Tags.join(", ")
            : ""
    );

    SetAdminPlantDurationFields(
        Number(
            Plant.GrowthTime ?? 0
        )
    );

    SetAdminPlantField(
        "AdminPlantHarvestMultiplier",
        Number(
            Plant.HarvestMultiplier ??
            1.5
        )
    );

    document.getElementById(
        "AdminPlantShopPlant"
    ).checked =
        Plant.Shop?.ShopPlant === true;

    SetAdminPlantField(
        "AdminPlantBaseCost",
        Plant.Shop?.BaseCost ?? ""
    );

    SetAdminPlantField(
        "AdminPlantEffects",
        JSON.stringify(
            Plant.Effects ?? {},
            null,
            4
        )
    );

    document.getElementById(
        "AdminPlantId"
    ).readOnly = true;

    document.getElementById(
        "AdminPlantKey"
    ).readOnly = true;

    document.getElementById(
        "AdminPlantArchiveNote"
    ).hidden =
        Plant.Archived !== true;

    UpdateAdminPlantShopFields();
    RenderAdminPlantPreview();
}


function DuplicateAdminPlant() {
    const SourcePlantKey =
        document.getElementById(
            "AdminPlantDuplicateSelect"
        ).value;

    const SourcePlant =
        AdminPlantCatalogue[
            SourcePlantKey
        ];

    if (SourcePlant === undefined) {
        SetAdminPlantMessage(
            "Choose a plant to duplicate."
        );

        return;
    }

    AdminPlantEditingKey = null;

    document.getElementById(
        "AdminPlantSelect"
    ).value = "";

    SetAdminPlantField(
        "AdminPlantId",
        GetNextAdminPlantId()
    );

    SetAdminPlantField(
        "AdminPlantKey",
        ""
    );

    SetAdminPlantField(
        "AdminPlantName",
        ""
    );

    SetAdminPlantField(
        "AdminPlantDescription",
        SourcePlant.Description ?? ""
    );

    SetAdminPlantField(
        "AdminPlantTags",
        Array.isArray(
            SourcePlant.Tags
        )
            ? SourcePlant.Tags.join(
                ", "
            )
            : ""
    );

    SetAdminPlantDurationFields(
        Number(
            SourcePlant.GrowthTime ??
            0
        )
    );

    SetAdminPlantField(
        "AdminPlantHarvestMultiplier",
        Number(
            SourcePlant.HarvestMultiplier ??
            1.5
        )
    );

    document.getElementById(
        "AdminPlantShopPlant"
    ).checked =
        SourcePlant.Shop?.ShopPlant === true;

    SetAdminPlantField(
        "AdminPlantBaseCost",
        SourcePlant.Shop?.BaseCost ?? ""
    );

    SetAdminPlantField(
        "AdminPlantEffects",
        JSON.stringify(
            SourcePlant.Effects ?? {},
            null,
            4
        )
    );

    document.getElementById(
        "AdminPlantId"
    ).readOnly = false;

    document.getElementById(
        "AdminPlantKey"
    ).readOnly = false;

    document.getElementById(
        "AdminPlantArchiveNote"
    ).hidden = true;

    UpdateAdminPlantShopFields();
    RenderAdminPlantPreview();

    document.getElementById(
        "AdminPlantName"
    ).focus();

    SetAdminPlantMessage(
        "Duplicated " +
        SourcePlant.Name +
        ". Give the new plant a name and Plant Key before saving. Sprites are not copied."
    );
}


function StartNewAdminPlant() {
    AdminPlantEditingKey = null;

    document.getElementById(
        "AdminPlantSelect"
    ).value = "";

    SetAdminPlantField(
        "AdminPlantId",
        GetNextAdminPlantId()
    );

    SetAdminPlantField(
        "AdminPlantKey",
        ""
    );

    SetAdminPlantField(
        "AdminPlantName",
        ""
    );

    SetAdminPlantField(
        "AdminPlantDescription",
        ""
    );

    SetAdminPlantField(
        "AdminPlantTags",
        ""
    );

    SetAdminPlantDurationFields(
        3600000
    );

    SetAdminPlantField(
        "AdminPlantHarvestMultiplier",
        1.5
    );

    document.getElementById(
        "AdminPlantShopPlant"
    ).checked = false;

    SetAdminPlantField(
        "AdminPlantBaseCost",
        ""
    );

    SetAdminPlantField(
        "AdminPlantEffects",
        "{}"
    );

    document.getElementById(
        "AdminPlantId"
    ).readOnly = false;

    document.getElementById(
        "AdminPlantKey"
    ).readOnly = false;

    document.getElementById(
        "AdminPlantArchiveNote"
    ).hidden = true;

    UpdateAdminPlantShopFields();
    RenderAdminPlantPreview();
    SetAdminPlantMessage(
        "Creating a new plant."
    );
}


function GetNextAdminPlantId() {
    return Math.max(
        0,
        ...Object.values(
            AdminPlantCatalogue
        ).map(
            Plant =>
                Number(
                    Plant.Id ?? 0
                )
        )
    ) + 1;
}


function SetAdminPlantField(
    ElementId,
    Value
) {
    document.getElementById(
        ElementId
    ).value =
        Value ?? "";
}


function UpdateAdminPlantShopFields() {
    const ShopPlant =
        document.getElementById(
            "AdminPlantShopPlant"
        ).checked;

    const BaseCost =
        document.getElementById(
            "AdminPlantBaseCost"
        );

    BaseCost.disabled =
        !ShopPlant;

    BaseCost.required =
        ShopPlant;
}


function ParseAdminPlantTags() {
    const Value =
        document.getElementById(
            "AdminPlantTags"
        ).value;

    return [
        ...new Set(
            Value
                .split(",")
                .map(
                    Tag =>
                        Tag.trim()
                )
                .filter(
                    Tag =>
                        Tag.length > 0
                )
        )
    ];
}


function ParseAdminPlantEffects() {
    const Value =
        document.getElementById(
            "AdminPlantEffects"
        ).value.trim();

    if (Value === "") {
        return {};
    }

    const Effects =
        JSON.parse(Value);

    if (
        Effects === null ||
        typeof Effects !== "object" ||
        Array.isArray(Effects)
    ) {
        throw new Error(
            "Effects JSON must be an object."
        );
    }

    return Effects;
}


function GetAdminPlantFormData() {
    const ShopPlant =
        document.getElementById(
            "AdminPlantShopPlant"
        ).checked;

    const BaseCostValue =
        document.getElementById(
            "AdminPlantBaseCost"
        ).value;

    return {
        Id: Number(
            document.getElementById(
                "AdminPlantId"
            ).value
        ),

        PlantKey:
            document.getElementById(
                "AdminPlantKey"
            ).value.trim(),

        Name:
            document.getElementById(
                "AdminPlantName"
            ).value.trim(),

        Description:
            document.getElementById(
                "AdminPlantDescription"
            ).value.trim(),

        Tags:
            ParseAdminPlantTags(),

        GrowthTime: Number(
            document.getElementById(
                "AdminPlantGrowthTime"
            ).value
        ),

        HarvestMultiplier: Number(
            document.getElementById(
                "AdminPlantHarvestMultiplier"
            ).value
        ),

        Effects:
            ParseAdminPlantEffects(),

        ShopPlant: ShopPlant,

        BaseCost:
            ShopPlant
                ? Number(BaseCostValue)
                : null,

        IsNew:
            AdminPlantEditingKey ===
                null
    };
}


async function SaveAdminPlant(
    Event
) {
    Event.preventDefault();

    if (AdminPlantSavePending) {
        return;
    }

    const Form =
        document.getElementById(
            "AdminPlantForm"
        );

    if (!Form.reportValidity()) {
        return;
    }

    let Plant;

    try {
        Plant =
            GetAdminPlantFormData();
    } catch (Error) {
        SetAdminPlantMessage(
            Error.message
        );

        return;
    }

    try {
        ValidateAdminPlant(
            Plant,
            AdminPlantCatalogue,
            AdminPlantEditingKey
        );
    } catch (Error) {
        SetAdminPlantMessage(
            Error.message
        );

        return;
    }

    AdminPlantSavePending = true;

    const SaveButton =
        document.getElementById(
            "AdminPlantSaveButton"
        );

    SaveButton.disabled = true;
    SaveButton.textContent =
        "Saving...";

    SetAdminPlantMessage(
        "Saving plant..."
    );

    try {
        const Result =
            await AdminPlantRequest(
                "Save",
                {
                    Plant: Plant
                }
            );

        localStorage.removeItem(
            "SarahtoninGardenContent"
        );

        await LoadAdminPlants(
            Result.PlantKey ??
            Plant.PlantKey
        );

        SetAdminPlantMessage(
            "Plant saved."
        );
    } catch (Error) {
        console.error(
            "Couldn't save plant:",
            Error
        );

        SetAdminPlantMessage(
            Error.message ??
            "Couldn't save plant."
        );
    } finally {
        AdminPlantSavePending = false;
        SaveButton.disabled = false;
        SaveButton.textContent =
            "Save plant";
    }
}


function RenderAdminPlantPreview() {
    const PlantKey =
        document.getElementById(
            "AdminPlantKey"
        ).value.trim();

    const Name =
        document.getElementById(
            "AdminPlantName"
        ).value.trim() ||
        "New plant";

    const Tile =
        document.getElementById(
            "AdminPlantPreviewTile"
        );

    Tile.replaceChildren();

    const MatureImage =
        GetPlantMatureImageSource(
            AdminPlantCatalogue[
                PlantKey
            ] ?? PlantKey
        );

    if (MatureImage !== null) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite";

        Image.src =
            MatureImage;

        Image.alt = Name;

        Tile.appendChild(
            Image
        );
    } else {
        const Missing =
            document.createElement(
                "span"
            );

        Missing.className =
            "AdminPlantPreviewMissing";

        Missing.textContent =
            PlantKey === ""
                ? "No key"
                : "No sprite";

        Tile.appendChild(
            Missing
        );
    }

    document.getElementById(
        "AdminPlantPreviewName"
    ).textContent = Name;

    document.getElementById(
        "AdminPlantPreviewKey"
    ).textContent =
        PlantKey === ""
            ? "Plant Key not set"
            : PlantKey;

    const GrowthTime = Number(
        document.getElementById(
            "AdminPlantGrowthTime"
        ).value
    );

    document.getElementById(
        "AdminPlantGrowthTimeHint"
    ).textContent =
        Number.isFinite(GrowthTime)
            ? GrowthTime.toLocaleString() +
                " ms stored"
            : "";

    RenderAdminPlantEconomyPreview();
    RenderAdminPlantImageManager();
}


function SetAdminPlantDurationFields(
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

    SetAdminPlantField(
        "AdminPlantGrowthHours",
        Math.floor(
            TotalSeconds / 3600
        )
    );

    SetAdminPlantField(
        "AdminPlantGrowthMinutes",
        Math.floor(
            (TotalSeconds % 3600) / 60
        )
    );

    SetAdminPlantField(
        "AdminPlantGrowthSeconds",
        TotalSeconds % 60
    );

    SetAdminPlantField(
        "AdminPlantGrowthTime",
        TotalSeconds * 1000
    );
}


function SyncAdminPlantGrowthTime() {
    const Hours = Number(
        document.getElementById(
            "AdminPlantGrowthHours"
        ).value
    );

    const Minutes = Number(
        document.getElementById(
            "AdminPlantGrowthMinutes"
        ).value
    );

    const Seconds = Number(
        document.getElementById(
            "AdminPlantGrowthSeconds"
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
        SetAdminPlantField(
            "AdminPlantGrowthTime",
            ""
        );

        return;
    }

    SetAdminPlantField(
        "AdminPlantGrowthTime",
        Math.max(0, Hours) * 3600000 +
        Math.max(0, Minutes) * 60000 +
        Math.max(0, Seconds) * 1000
    );
}


function GetAdminPlantPreviewDefinition() {
    const PlantId = Number(
        document.getElementById(
            "AdminPlantId"
        ).value
    );

    const PlantKey =
        document.getElementById(
            "AdminPlantKey"
        ).value.trim();

    const Existing =
        AdminPlantCatalogue[
            PlantKey
        ] ?? {};

    const ShopPlant =
        document.getElementById(
            "AdminPlantShopPlant"
        ).checked;

    const BaseCostValue =
        document.getElementById(
            "AdminPlantBaseCost"
        ).value;

    return {
        ...Existing,
        Id: PlantId,
        Name:
            document.getElementById(
                "AdminPlantName"
            ).value.trim() ||
            "New plant",
        Tags: ParseAdminPlantTags(),
        GrowthTime: Number(
            document.getElementById(
                "AdminPlantGrowthTime"
            ).value
        ),
        HarvestMultiplier: Number(
            document.getElementById(
                "AdminPlantHarvestMultiplier"
            ).value
        ),
        Shop: {
            ShopPlant: ShopPlant,
            BaseCost:
                ShopPlant &&
                BaseCostValue !== ""
                    ? Number(BaseCostValue)
                    : null
        }
    };
}


function RenderAdminPlantEconomyPreview() {
    const Plant =
        GetAdminPlantPreviewDefinition();

    const PlantKey =
        document.getElementById(
            "AdminPlantKey"
        ).value.trim();

    const PreviewCatalogue = {
        ...AdminPlantCatalogue,
        [
            PlantKey ||
            "__AdminPlantPreview"
        ]: Plant
    };

    const CostInfo =
        Number.isFinite(Plant.Id) &&
        Plant.Id > 0
            ? GetCataloguePlantCostInfo(
                Plant.Id,
                PreviewCatalogue,
                AdminPlantMutationCatalogue
            )
            : null;

    const Multiplier =
        GetPlantHarvestMultiplier(
            Plant
        );

    const GrowthTime = Number(
        Plant.GrowthTime
    );

    const Cost =
        CostInfo?.Cost ?? null;

    const Reward =
        Cost === null
            ? null
            : Math.ceil(
                Cost * Multiplier
            );

    const Profit =
        Cost === null ||
        Reward === null
            ? null
            : Reward - Cost;

    const Dph =
        Profit === null ||
        !Number.isFinite(GrowthTime) ||
        GrowthTime <= 0
            ? null
            : Profit * 3600000 /
                GrowthTime;

    SetAdminPlantEconomyText(
        "AdminPlantEconomyCost",
        FormatAdminPlantDew(Cost)
    );

    SetAdminPlantEconomyText(
        "AdminPlantEconomyMultiplier",
        Multiplier.toLocaleString(
            undefined,
            {maximumFractionDigits: 4}
        ) + "×"
    );

    SetAdminPlantEconomyText(
        "AdminPlantEconomyReward",
        FormatAdminPlantDew(Reward)
    );

    SetAdminPlantEconomyText(
        "AdminPlantEconomyProfit",
        FormatAdminPlantDew(Profit)
    );

    SetAdminPlantEconomyText(
        "AdminPlantEconomyGrowth",
        Number.isFinite(GrowthTime)
            ? FormatAdminDuration(
                GrowthTime
            )
            : "Unavailable"
    );

    SetAdminPlantEconomyText(
        "AdminPlantEconomyDph",
        Dph === null
            ? "Unavailable"
            : Dph.toLocaleString(
                undefined,
                {maximumFractionDigits: 2}
            ) + " Dew/h"
    );

    let Source = "Unavailable";

    if (CostInfo?.SourceType === "Base") {
        Source = "Base seed cost";
    } else if (
        CostInfo?.SourceType ===
            "Mutation"
    ) {
        Source =
            CostInfo.SourceMutation
                ?.Name ??
            CostInfo.SourceMutation
                ?.MutationKey ??
            "Mutation";
    }

    SetAdminPlantEconomyText(
        "AdminPlantEconomySource",
        Source
    );
}


function SetAdminPlantEconomyText(
    ElementId,
    Value
) {
    document.getElementById(
        ElementId
    ).textContent = Value;
}


function FormatAdminPlantDew(
    Value
) {
    return (
        Value === null ||
        !Number.isFinite(Value)
    )
        ? "Unavailable"
        : Math.ceil(Value)
            .toLocaleString() +
            " Dew";
}


function RenderAdminPlantImageManager() {
    const List =
        document.getElementById(
            "AdminPlantImageList"
        );

    const Note =
        document.getElementById(
            "AdminPlantImageNote"
        );

    const UploadButton =
        document.getElementById(
            "AdminPlantImageUploadButton"
        );

    const FileInput =
        document.getElementById(
            "AdminPlantImageFiles"
        );

    if (
        List === null ||
        Note === null ||
        UploadButton === null ||
        FileInput === null
    ) {
        return;
    }

    List.replaceChildren();

    const Plant =
        AdminPlantEditingKey === null
            ? null
            : AdminPlantCatalogue[
                AdminPlantEditingKey
            ] ?? null;

    const CanEdit =
        Plant !== null &&
        !AdminPlantImagePending;

    UploadButton.disabled =
        !CanEdit;

    FileInput.disabled =
        !CanEdit;

    if (Plant === null) {
        Note.textContent =
            "Save the plant first, then upload sprites whenever you have them.";
        return;
    }

    const StaticImages =
        Array.isArray(
            PlantImages[
                AdminPlantEditingKey
            ]
        )
            ? PlantImages[
                AdminPlantEditingKey
            ]
            : [];

    const ApiStages =
        Array.isArray(
            Plant.ImageStages
        )
            ? [...Plant.ImageStages]
                .sort(
                    (A, B) =>
                        Number(A.Stage) -
                        Number(B.Stage)
                )
            : [];

    const FallbackText =
        StaticImages.length > 0
            ? " Repository fallback: " +
                StaticImages.length +
                " stage" +
                (
                    StaticImages.length === 1
                        ? "."
                        : "s."
                )
            : "";

    if (ApiStages.length === 0) {
        Note.textContent =
            "No API sprites uploaded." +
            FallbackText;
        return;
    }

    Note.textContent =
        ApiStages.length +
        " API sprite" +
        (
            ApiStages.length === 1
                ? " uploaded."
                : "s uploaded."
        ) +
        FallbackText;

    for (const ImageStage of ApiStages) {
        const Stage = Number(
            ImageStage.Stage
        );

        const Row =
            document.createElement(
                "div"
            );

        Row.className =
            "AdminPlantImageRow";

        const Preview =
            document.createElement(
                "div"
            );

        Preview.className =
            "PlantTile AdminPlantImagePreview";

        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite";

        Image.src =
            GetAdminPlantApiImageUrl(
                Plant.Id,
                Stage,
                ImageStage.Revision
            );

        Image.alt =
            Plant.Name +
            " stage " +
            Stage;

        Preview.appendChild(Image);

        const Label =
            document.createElement(
                "strong"
            );

        Label.textContent =
            "Stage " + Stage;

        const RemoveButton =
            document.createElement(
                "button"
            );

        RemoveButton.type = "button";
        RemoveButton.className =
            "ActionButton AdminInlineButton AdminPlantImageRemoveButton";
        RemoveButton.textContent =
            "Remove";
        RemoveButton.disabled =
            AdminPlantImagePending;

        RemoveButton.addEventListener(
            "click",
            () =>
                DeleteAdminPlantImage(
                    Plant.Id,
                    Stage
                )
        );

        Row.append(
            Preview,
            Label,
            RemoveButton
        );

        List.appendChild(Row);
    }
}


function GetAdminPlantApiImageUrl(
    PlantId,
    Stage,
    Revision = 0
) {
    const Query =
        new URLSearchParams({
            PlantId: String(PlantId),
            Stage: String(Stage),
            v: String(Revision ?? 0)
        });

    return ApiUrl +
        "/PlantImage.php?" +
        Query.toString();
}


async function UploadAdminPlantImages() {
    if (
        AdminPlantImagePending ||
        AdminPlantEditingKey === null
    ) {
        return;
    }

    const Plant =
        AdminPlantCatalogue[
            AdminPlantEditingKey
        ];

    if (Plant === undefined) {
        return;
    }

    const FileInput =
        document.getElementById(
            "AdminPlantImageFiles"
        );

    const Files =
        Array.from(
            FileInput.files ?? []
        );

    if (Files.length === 0) {
        SetAdminPlantMessage(
            "Choose one or more PNG sprites first."
        );
        return;
    }

    const Stages = new Set();
    const Uploads = [];

    try {
        for (const File of Files) {
            const Match =
                /^(\\d+)\\.png$/i.exec(
                    File.name
                );

            if (Match === null) {
                throw new Error(
                    "Sprite filenames must be stage numbers such as 1.png or 3.png."
                );
            }

            const Stage = Number(
                Match[1]
            );

            if (
                !Number.isInteger(Stage) ||
                Stage < 1 ||
                Stage > 255
            ) {
                throw new Error(
                    "Sprite stages must be between 1 and 255."
                );
            }

            if (Stages.has(Stage)) {
                throw new Error(
                    "Stage " +
                    Stage +
                    " was selected more than once."
                );
            }

            Stages.add(Stage);

            Uploads.push({
                Stage: Stage,
                File: File
            });
        }
    } catch (Error) {
        SetAdminPlantMessage(
            Error.message
        );
        return;
    }

    AdminPlantImagePending = true;
    RenderAdminPlantImageManager();

    SetAdminPlantMessage(
        "Uploading sprites..."
    );

    try {
        for (const Upload of Uploads) {
            const DataBase64 =
                await ReadAdminPlantFileBase64(
                    Upload.File
                );

            await AdminPlantRequest(
                "UploadImage",
                {
                    PlantId: Plant.Id,
                    Stage: Upload.Stage,
                    MimeType: "image/png",
                    DataBase64: DataBase64
                }
            );
        }

        FileInput.value = "";

        localStorage.removeItem(
            "SarahtoninGardenContent"
        );

        await LoadAdminPlants(
            AdminPlantEditingKey
        );

        SetAdminPlantMessage(
            Uploads.length === 1
                ? "Sprite uploaded."
                : Uploads.length +
                    " sprites uploaded."
        );
    } catch (Error) {
        console.error(
            "Couldn't upload plant sprites:",
            Error
        );

        SetAdminPlantMessage(
            Error.message ??
            "Couldn't upload plant sprites."
        );
    } finally {
        AdminPlantImagePending = false;
        RenderAdminPlantImageManager();
    }
}


function ReadAdminPlantFileBase64(
    File
) {
    return new Promise(
        (Resolve, Reject) => {
            const Reader =
                new FileReader();

            Reader.addEventListener(
                "load",
                () => {
                    const Result =
                        String(
                            Reader.result ??
                            ""
                        );

                    const CommaIndex =
                        Result.indexOf(",");

                    if (CommaIndex < 0) {
                        Reject(
                            new Error(
                                "Couldn't read sprite file."
                            )
                        );
                        return;
                    }

                    Resolve(
                        Result.slice(
                            CommaIndex + 1
                        )
                    );
                }
            );

            Reader.addEventListener(
                "error",
                () =>
                    Reject(
                        new Error(
                            "Couldn't read sprite file."
                        )
                    )
            );

            Reader.readAsDataURL(File);
        }
    );
}


async function DeleteAdminPlantImage(
    PlantId,
    Stage
) {
    if (AdminPlantImagePending) {
        return;
    }

    AdminPlantImagePending = true;
    RenderAdminPlantImageManager();

    SetAdminPlantMessage(
        "Removing stage " +
        Stage +
        " sprite..."
    );

    try {
        await AdminPlantRequest(
            "DeleteImage",
            {
                PlantId: PlantId,
                Stage: Stage
            }
        );

        localStorage.removeItem(
            "SarahtoninGardenContent"
        );

        await LoadAdminPlants(
            AdminPlantEditingKey
        );

        SetAdminPlantMessage(
            "Stage " +
            Stage +
            " sprite removed."
        );
    } catch (Error) {
        console.error(
            "Couldn't remove plant sprite:",
            Error
        );

        SetAdminPlantMessage(
            Error.message ??
            "Couldn't remove plant sprite."
        );
    } finally {
        AdminPlantImagePending = false;
        RenderAdminPlantImageManager();
    }
}


function GetAdminPlantPortableData(
    Plant
) {
    return {
        PlantKey: Plant.PlantKey,
        Name: Plant.Name,
        Description: Plant.Description,
        Tags: [...Plant.Tags],
        GrowthTime: Plant.GrowthTime,
        HarvestMultiplier:
            Plant.HarvestMultiplier,
        Effects: JSON.parse(
            JSON.stringify(
                Plant.Effects ?? {}
            )
        ),
        Shop: {
            ShopPlant:
                Plant.ShopPlant === true,
            BaseCost:
                Plant.ShopPlant === true
                    ? Plant.BaseCost
                    : null
        }
    };
}


function ExportAdminPlantJson() {
    const Form =
        document.getElementById(
            "AdminPlantForm"
        );

    if (!Form.reportValidity()) {
        return;
    }

    try {
        const Plant =
            GetAdminPlantFormData();

        ValidateAdminPlant(
            Plant,
            AdminPlantCatalogue,
            AdminPlantEditingKey
        );

        DownloadAdminJson(
            "Plant-" +
            Plant.PlantKey +
            ".json",
            {
                Type: "Plant",
                Version: 1,
                Plant:
                    GetAdminPlantPortableData(
                        Plant
                    )
            }
        );

        SetAdminPlantMessage(
            "Plant JSON exported. Sprites and numeric ID are not included."
        );
    } catch (Error) {
        SetAdminPlantMessage(
            Error.message ??
            "Couldn't export plant JSON."
        );
    }
}


async function ImportAdminPlantJson(
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
            DocumentData.Type !== "Plant"
        ) {
            throw new Error(
                "That JSON file is not a plant export."
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
                "Unsupported plant JSON version."
            );
        }

        const Imported =
            IsAdminPlainObject(
                DocumentData?.Plant
            )
                ? DocumentData.Plant
                : DocumentData;

        if (!IsAdminPlainObject(Imported)) {
            throw new Error(
                "Plant JSON must contain a plant object."
            );
        }

        const PlantKey =
            String(
                Imported.PlantKey ?? ""
            ).trim();

        const Existing =
            AdminPlantCatalogue[
                PlantKey
            ];

        const Shop =
            IsAdminPlainObject(
                Imported.Shop
            )
                ? Imported.Shop
                : {};

        const Plant = {
            Id:
                Existing?.Id ??
                GetNextAdminPlantId(),
            PlantKey: PlantKey,
            Name:
                String(
                    Imported.Name ?? ""
                ).trim(),
            Description:
                typeof Imported.Description ===
                    "string"
                    ? Imported.Description.trim()
                    : "",
            Tags:
                Array.isArray(Imported.Tags)
                    ? Imported.Tags.map(
                        Tag =>
                            String(Tag).trim()
                    )
                    : [],
            GrowthTime:
                Number(
                    Imported.GrowthTime
                ),
            HarvestMultiplier:
                Number(
                    Imported.HarvestMultiplier ??
                    1.5
                ),
            Effects:
                IsAdminPlainObject(
                    Imported.Effects
                )
                    ? JSON.parse(
                        JSON.stringify(
                            Imported.Effects
                        )
                    )
                    : {},
            ShopPlant:
                Shop.ShopPlant === true ||
                Imported.ShopPlant === true,
            BaseCost:
                Shop.BaseCost ??
                Imported.BaseCost ??
                null,
            IsNew:
                Existing === undefined
        };

        ValidateAdminPlant(
            Plant,
            AdminPlantCatalogue,
            Existing === undefined
                ? null
                : PlantKey
        );

        if (Existing === undefined) {
            StartNewAdminPlant();
            AdminPlantEditingKey = null;
        } else {
            LoadAdminPlantIntoForm(
                PlantKey
            );
        }

        SetAdminPlantField(
            "AdminPlantId",
            Plant.Id
        );
        SetAdminPlantField(
            "AdminPlantKey",
            Plant.PlantKey
        );
        SetAdminPlantField(
            "AdminPlantName",
            Plant.Name
        );
        SetAdminPlantField(
            "AdminPlantDescription",
            Plant.Description
        );
        SetAdminPlantField(
            "AdminPlantTags",
            Plant.Tags.join(", ")
        );
        SetAdminPlantDurationFields(
            Plant.GrowthTime
        );
        SetAdminPlantField(
            "AdminPlantHarvestMultiplier",
            Plant.HarvestMultiplier
        );

        document.getElementById(
            "AdminPlantShopPlant"
        ).checked = Plant.ShopPlant;

        SetAdminPlantField(
            "AdminPlantBaseCost",
            Plant.BaseCost ?? ""
        );
        SetAdminPlantField(
            "AdminPlantEffects",
            JSON.stringify(
                Plant.Effects,
                null,
                4
            )
        );

        document.getElementById(
            "AdminPlantId"
        ).readOnly =
            Existing !== undefined;

        document.getElementById(
            "AdminPlantKey"
        ).readOnly =
            Existing !== undefined;

        UpdateAdminPlantShopFields();
        RenderAdminPlantPreview();
        RenderAdminPlantImageManager();

        SetAdminPlantMessage(
            Existing === undefined
                ? "Plant JSON imported as a new plant. Review it, then save when ready."
                : "Plant JSON imported over " +
                    PlantKey +
                    ". Review it, then save when ready."
        );
    } catch (Error) {
        SetAdminPlantMessage(
            Error.message ??
            "Couldn't import plant JSON."
        );
    }
}


function FormatAdminDuration(
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


function SetAdminPlantMessage(
    Message
) {
    const Element =
        document.getElementById(
            "AdminPlantMessage"
        );

    if (Element !== null) {
        Element.textContent =
            Message;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartAdminPlantEditor
);
