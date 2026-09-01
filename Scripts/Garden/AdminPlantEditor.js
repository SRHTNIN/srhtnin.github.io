let AdminPlantCatalogue = {};
let AdminPlantEditingKey = null;
let AdminPlantSavePending = false;


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
            "AdminPlantGrowthTime",
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

    document.getElementById(
        "AdminPlantShopPlant"
    ).addEventListener(
        "change",
        UpdateAdminPlantShopFields
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


async function LoadAdminPlants(
    PreferredPlantKey = null
) {
    SetAdminPlantMessage(
        "Loading plants..."
    );

    const Result =
        await AdminPlantRequest(
            "List"
        );

    AdminPlantCatalogue =
        Result.Plants ?? {};

    Plants =
        AdminPlantCatalogue;

    RenderAdminPlantSelect();

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

    SetAdminPlantField(
        "AdminPlantGrowthTime",
        Number(
            Plant.GrowthTime ?? 0
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

    SetAdminPlantField(
        "AdminPlantGrowthTime",
        3600000
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

    const Images =
        PlantImages[
            PlantKey
        ] ?? [];

    if (
        Array.isArray(Images) &&
        Images.length > 0
    ) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite";

        Image.src =
            Images[
                Images.length - 1
            ];

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
            ? FormatAdminDuration(
                GrowthTime
            )
            : "";
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
