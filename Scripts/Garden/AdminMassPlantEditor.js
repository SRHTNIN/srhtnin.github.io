let AdminMassPlantCatalogue = {};
let AdminMassPlantSavePending = false;


async function AdminMassPlantRequest(
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
        ApiUrl + "/AdminPlants.php",
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

    const Result =
        await Response.json();

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


function GetSortedAdminMassPlantKeys() {
    return Object.keys(
        AdminMassPlantCatalogue
    ).sort(
        (A, B) =>
            Number(
                AdminMassPlantCatalogue[A]
                    ?.Id ?? 0
            ) -
                Number(
                    AdminMassPlantCatalogue[B]
                        ?.Id ?? 0
                ) ||
            A.localeCompare(B)
    );
}


function RenderAdminMassPlantSelection() {
    const Container =
        document.getElementById(
            "AdminMassPlantSelection"
        );

    Container.replaceChildren();

    for (
        const PlantKey
        of GetSortedAdminMassPlantKeys()
    ) {
        const Plant =
            AdminMassPlantCatalogue[
                PlantKey
            ];

        const Label =
            document.createElement("label");
        Label.className =
            "AdminPlantChecklistItem";

        const Input =
            document.createElement("input");
        Input.type = "checkbox";
        Input.value = PlantKey;
        Input.dataset.adminMassTarget =
            "plant";

        const Text =
            document.createElement("span");
        Text.textContent =
            String(Plant.Id).padStart(
                3,
                "0"
            ) +
            " — " +
            (Plant.Name ?? PlantKey) +
            (
                Plant.Archived === true
                    ? " (archived)"
                    : ""
            );

        Label.append(
            Input,
            Text
        );
        Container.appendChild(Label);
    }
}


function SetAdminMassPlantSelection(
    Checked
) {
    for (
        const Input
        of document.querySelectorAll(
            '[data-admin-mass-target="plant"]'
        )
    ) {
        Input.checked = Checked;
    }
}


function UpdateAdminMassPlantFieldStates() {
    const FieldMap = {
        Name: [
            "AdminMassPlantName"
        ],
        Description: [
            "AdminMassPlantDescription"
        ],
        Tags: [
            "AdminMassPlantTags"
        ],
        GrowthTime: [
            "AdminMassPlantGrowthHours",
            "AdminMassPlantGrowthMinutes",
            "AdminMassPlantGrowthSeconds"
        ],
        HarvestMultiplier: [
            "AdminMassPlantHarvestMultiplier"
        ],
        ShopPlant: [
            "AdminMassPlantShopPlant"
        ],
        BaseCost: [
            "AdminMassPlantBaseCost"
        ],
        Effects: [
            "AdminMassPlantEffects"
        ]
    };

    for (
        const Apply
        of document.querySelectorAll(
            "[data-admin-mass-apply]"
        )
    ) {
        const FieldName =
            Apply.dataset.adminMassApply;

        for (
            const ElementId
            of FieldMap[FieldName] ?? []
        ) {
            document.getElementById(
                ElementId
            ).disabled = !Apply.checked;
        }
    }
}


function GetAdminMassPlantSelectedKeys() {
    return [
        ...document.querySelectorAll(
            '[data-admin-mass-target="plant"]:checked'
        )
    ].map(Input => Input.value);
}


function AdminMassPlantFieldEnabled(
    FieldName
) {
    return document.querySelector(
        '[data-admin-mass-apply="' +
        FieldName +
        '"]'
    )?.checked === true;
}


function ParseAdminMassPlantTags() {
    return [
        ...new Set(
            document.getElementById(
                "AdminMassPlantTags"
            ).value
                .split(",")
                .map(Tag => Tag.trim())
                .filter(Tag => Tag !== "")
        )
    ];
}


function GetAdminMassPlantGrowthTime() {
    const Hours = Number(
        document.getElementById(
            "AdminMassPlantGrowthHours"
        ).value
    );
    const Minutes = Number(
        document.getElementById(
            "AdminMassPlantGrowthMinutes"
        ).value
    );
    const Seconds = Number(
        document.getElementById(
            "AdminMassPlantGrowthSeconds"
        ).value
    );

    if (
        !Number.isInteger(Hours) ||
        !Number.isInteger(Minutes) ||
        !Number.isInteger(Seconds) ||
        Hours < 0 ||
        Minutes < 0 ||
        Minutes > 59 ||
        Seconds < 0 ||
        Seconds > 59
    ) {
        throw new Error(
            "Growth time is invalid."
        );
    }

    return (
        Hours * 3600000 +
        Minutes * 60000 +
        Seconds * 1000
    );
}


function GetAdminMassPlantEffects() {
    const Raw =
        document.getElementById(
            "AdminMassPlantEffects"
        ).value.trim();

    const Effects = JSON.parse(
        Raw === "" ? "{}" : Raw
    );

    if (!IsAdminPlainObject(Effects)) {
        throw new Error(
            "Effects JSON must be an object."
        );
    }

    return Effects;
}


function GetAdminMassPlantPatch() {
    const Patch = {};

    if (AdminMassPlantFieldEnabled("Name")) {
        Patch.Name =
            document.getElementById(
                "AdminMassPlantName"
            ).value.trim();
    }

    if (
        AdminMassPlantFieldEnabled(
            "Description"
        )
    ) {
        Patch.Description =
            document.getElementById(
                "AdminMassPlantDescription"
            ).value.trim();
    }

    if (AdminMassPlantFieldEnabled("Tags")) {
        Patch.Tags =
            ParseAdminMassPlantTags();
    }

    if (
        AdminMassPlantFieldEnabled(
            "GrowthTime"
        )
    ) {
        Patch.GrowthTime =
            GetAdminMassPlantGrowthTime();
    }

    if (
        AdminMassPlantFieldEnabled(
            "HarvestMultiplier"
        )
    ) {
        Patch.HarvestMultiplier =
            Number(
                document.getElementById(
                    "AdminMassPlantHarvestMultiplier"
                ).value
            );
    }

    if (
        AdminMassPlantFieldEnabled(
            "ShopPlant"
        )
    ) {
        Patch.ShopPlant =
            document.getElementById(
                "AdminMassPlantShopPlant"
            ).value === "true";
    }

    if (
        AdminMassPlantFieldEnabled(
            "BaseCost"
        )
    ) {
        Patch.BaseCost =
            Number(
                document.getElementById(
                    "AdminMassPlantBaseCost"
                ).value
            );
    }

    if (
        AdminMassPlantFieldEnabled(
            "Effects"
        )
    ) {
        Patch.Effects =
            GetAdminMassPlantEffects();
    }

    return Patch;
}


function BuildAdminMassPlantPayload(
    PlantKey,
    Patch
) {
    const Source =
        AdminMassPlantCatalogue[
            PlantKey
        ];

    const Plant = {
        Id: Number(Source.Id),
        PlantKey: PlantKey,
        Name: Source.Name ?? "",
        Description:
            Source.Description ?? "",
        Tags:
            Array.isArray(Source.Tags)
                ? [...Source.Tags]
                : [],
        GrowthTime:
            Number(Source.GrowthTime ?? 0),
        HarvestMultiplier:
            Number(
                Source.HarvestMultiplier ??
                1.5
            ),
        Effects:
            JSON.parse(
                JSON.stringify(
                    Source.Effects ?? {}
                )
            ),
        ShopPlant:
            Source.Shop?.ShopPlant === true,
        BaseCost:
            Source.Shop?.BaseCost ?? null,
        IsNew: false
    };

    Object.assign(
        Plant,
        JSON.parse(
            JSON.stringify(Patch)
        )
    );

    return Plant;
}


async function SaveAdminMassPlants(
    Event
) {
    Event.preventDefault();

    if (AdminMassPlantSavePending) {
        return;
    }

    const SelectedKeys =
        GetAdminMassPlantSelectedKeys();

    if (SelectedKeys.length === 0) {
        SetAdminMassPlantMessage(
            "Mark at least one plant first."
        );
        return;
    }

    let Patch;

    try {
        Patch = GetAdminMassPlantPatch();
    } catch (Error) {
        SetAdminMassPlantMessage(
            Error.message
        );
        return;
    }

    if (Object.keys(Patch).length === 0) {
        SetAdminMassPlantMessage(
            "Enable at least one field to update."
        );
        return;
    }

    const Payloads = [];

    try {
        for (const PlantKey of SelectedKeys) {
            const Plant =
                BuildAdminMassPlantPayload(
                    PlantKey,
                    Patch
                );

            ValidateAdminPlant(
                Plant,
                AdminMassPlantCatalogue,
                PlantKey
            );

            Payloads.push(Plant);
        }
    } catch (Error) {
        SetAdminMassPlantMessage(
            Error.message
        );
        return;
    }

    AdminMassPlantSavePending = true;

    const SaveButton =
        document.getElementById(
            "AdminMassPlantSaveButton"
        );

    SaveButton.disabled = true;

    let SavedCount = 0;

    try {
        for (const Plant of Payloads) {
            SetAdminMassPlantMessage(
                "Saving " +
                (SavedCount + 1) +
                " of " +
                Payloads.length +
                "..."
            );

            await AdminMassPlantRequest(
                "Save",
                {Plant: Plant}
            );

            SavedCount++;
        }

        localStorage.removeItem(
            "SarahtoninGardenContent"
        );

        await LoadAdminMassPlants();

        SetAdminMassPlantMessage(
            SavedCount === 1
                ? "1 plant updated."
                : SavedCount +
                    " plants updated."
        );
    } catch (Error) {
        SetAdminMassPlantMessage(
            "Saved " +
            SavedCount +
            " before stopping: " +
            (Error.message ??
                "Couldn't save plants.")
        );
    } finally {
        AdminMassPlantSavePending = false;
        SaveButton.disabled = false;
    }
}


function BindAdminMassPlantEditor() {
    document.getElementById(
        "AdminMassPlantSelectAll"
    ).addEventListener(
        "click",
        () =>
            SetAdminMassPlantSelection(
                true
            )
    );

    document.getElementById(
        "AdminMassPlantClear"
    ).addEventListener(
        "click",
        () =>
            SetAdminMassPlantSelection(
                false
            )
    );

    document.getElementById(
        "AdminMassPlantForm"
    ).addEventListener(
        "submit",
        SaveAdminMassPlants
    );

    for (
        const Apply
        of document.querySelectorAll(
            "[data-admin-mass-apply]"
        )
    ) {
        Apply.addEventListener(
            "change",
            UpdateAdminMassPlantFieldStates
        );
    }

    UpdateAdminMassPlantFieldStates();
}


async function LoadAdminMassPlants() {
    const Result =
        await AdminMassPlantRequest(
            "List"
        );

    AdminMassPlantCatalogue =
        Result.Plants ?? {};

    RenderAdminMassPlantSelection();
}


function SetAdminMassPlantMessage(
    Message
) {
    document.getElementById(
        "AdminMassPlantMessage"
    ).textContent = Message;
}


async function StartAdminMassPlantEditor() {
    try {
        const Status =
            await GetAdminStatus();

        if (
            Status.Success !== true ||
            Status.IsAdmin !== true
        ) {
            SetAdminMassPlantMessage(
                "Admin access required."
            );
            return;
        }

        BindAdminMassPlantEditor();
        await LoadAdminMassPlants();

        SetAdminMassPlantMessage(
            "Mark plants and enable the fields you want to change."
        );
    } catch (Error) {
        console.error(
            "Couldn't start Mass plant editor:",
            Error
        );

        SetAdminMassPlantMessage(
            Error.message ??
            "Couldn't load the Mass plant editor."
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartAdminMassPlantEditor
);
