let AdminMassMutationCatalogue = {};
let AdminMassMutationPlantCatalogue = {};
let AdminMassMutationSavePending = false;


async function AdminMassMutationRequest(
    Endpoint,
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
        ApiUrl + "/" + Endpoint,
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
            "Mutation admin request failed."
        );
    }

    return Result;
}


function GetSortedAdminMassMutationKeys() {
    return Object.keys(
        AdminMassMutationCatalogue
    ).sort(
        (A, B) =>
            Number(
                AdminMassMutationCatalogue[A]
                    ?.Id ?? 0
            ) -
                Number(
                    AdminMassMutationCatalogue[B]
                        ?.Id ?? 0
                ) ||
            A.localeCompare(B)
    );
}


function RenderAdminMassMutationSelection() {
    const Container =
        document.getElementById(
            "AdminMassMutationSelection"
        );

    Container.replaceChildren();

    for (
        const MutationKey
        of GetSortedAdminMassMutationKeys()
    ) {
        const Mutation =
            AdminMassMutationCatalogue[
                MutationKey
            ];

        const Label =
            document.createElement("label");
        Label.className =
            "AdminPlantChecklistItem";

        const Input =
            document.createElement("input");
        Input.type = "checkbox";
        Input.value = MutationKey;
        Input.dataset.adminMassTarget =
            "mutation";

        const Text =
            document.createElement("span");
        Text.textContent =
            String(Mutation.Id).padStart(
                3,
                "0"
            ) +
            " — " +
            (Mutation.Name ?? MutationKey) +
            (
                Mutation.Archived === true
                    ? " (archived)"
                    : ""
            );

        Label.append(Input, Text);
        Container.appendChild(Label);
    }
}


function SetAdminMassMutationSelection(
    Checked
) {
    for (
        const Input
        of document.querySelectorAll(
            '[data-admin-mass-target="mutation"]'
        )
    ) {
        Input.checked = Checked;
    }
}


function UpdateAdminMassMutationFieldStates() {
    const FieldMap = {
        Name: ["AdminMassMutationName"],
        Description: [
            "AdminMassMutationDescription"
        ],
        Hint: ["AdminMassMutationHint"],
        Priority: [
            "AdminMassMutationPriority"
        ],
        Chance: ["AdminMassMutationChance"],
        Cooldown: [
            "AdminMassMutationCooldownHours",
            "AdminMassMutationCooldownMinutes",
            "AdminMassMutationCooldownSeconds"
        ],
        Rotation: [
            "AdminMassMutationRotation"
        ],
        AllowImmature: [
            "AdminMassMutationAllowImmature"
        ],
        Pattern: [
            "AdminMassMutationPattern"
        ],
        Success: [
            "AdminMassMutationSuccess"
        ],
        Failure: [
            "AdminMassMutationFailure"
        ],
        PlantsUsed: [
            "AdminMassMutationPlantsUsed"
        ],
        PlantsCreated: [
            "AdminMassMutationPlantsCreated"
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


function AdminMassMutationFieldEnabled(
    FieldName
) {
    return document.querySelector(
        '[data-admin-mass-apply="' +
        FieldName +
        '"]'
    )?.checked === true;
}


function GetAdminMassMutationSelectedKeys() {
    return [
        ...document.querySelectorAll(
            '[data-admin-mass-target="mutation"]:checked'
        )
    ].map(Input => Input.value);
}


function GetAdminMassMutationCooldown() {
    const Hours = Number(
        document.getElementById(
            "AdminMassMutationCooldownHours"
        ).value
    );
    const Minutes = Number(
        document.getElementById(
            "AdminMassMutationCooldownMinutes"
        ).value
    );
    const Seconds = Number(
        document.getElementById(
            "AdminMassMutationCooldownSeconds"
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
            "Cooldown is invalid."
        );
    }

    return (
        Hours * 3600000 +
        Minutes * 60000 +
        Seconds * 1000
    );
}


function ParseAdminMassMutationJson(
    ElementId,
    Name
) {
    const Raw =
        document.getElementById(
            ElementId
        ).value.trim();

    try {
        return JSON.parse(Raw);
    } catch (Error) {
        throw new Error(
            Name + " is not valid JSON."
        );
    }
}


function ParseAdminMassMutationPlantKeys(
    ElementId,
    Name
) {
    const Keys = [
        ...new Set(
            document.getElementById(
                ElementId
            ).value
                .split(",")
                .map(Value => Value.trim())
                .filter(Value => Value !== "")
        )
    ];

    return Keys.map(
        PlantKey => {
            const Plant =
                AdminMassMutationPlantCatalogue[
                    PlantKey
                ];

            if (Plant === undefined) {
                throw new Error(
                    Name +
                    " references unknown Plant Key: " +
                    PlantKey
                );
            }

            return Number(Plant.Id);
        }
    ).sort((A, B) => A - B);
}


function GetAdminMassMutationPatch() {
    const Patch = {};

    if (AdminMassMutationFieldEnabled("Name")) {
        Patch.Name =
            document.getElementById(
                "AdminMassMutationName"
            ).value.trim();
    }

    if (
        AdminMassMutationFieldEnabled(
            "Description"
        )
    ) {
        Patch.Description =
            document.getElementById(
                "AdminMassMutationDescription"
            ).value.trim();
    }

    if (AdminMassMutationFieldEnabled("Hint")) {
        Patch.Hint =
            document.getElementById(
                "AdminMassMutationHint"
            ).value.trim();
    }

    if (
        AdminMassMutationFieldEnabled(
            "Priority"
        )
    ) {
        Patch.Priority =
            Number(
                document.getElementById(
                    "AdminMassMutationPriority"
                ).value
            );
    }

    if (
        AdminMassMutationFieldEnabled(
            "Chance"
        )
    ) {
        Patch.Chance =
            Number(
                document.getElementById(
                    "AdminMassMutationChance"
                ).value
            ) / 100;
    }

    if (
        AdminMassMutationFieldEnabled(
            "Cooldown"
        )
    ) {
        Patch.Cooldown =
            GetAdminMassMutationCooldown();
    }

    if (
        AdminMassMutationFieldEnabled(
            "Rotation"
        )
    ) {
        Patch.Rotation =
            document.getElementById(
                "AdminMassMutationRotation"
            ).value;
    }

    if (
        AdminMassMutationFieldEnabled(
            "AllowImmature"
        )
    ) {
        Patch.AllowImmature =
            document.getElementById(
                "AdminMassMutationAllowImmature"
            ).value === "true";
    }

    if (
        AdminMassMutationFieldEnabled(
            "Pattern"
        )
    ) {
        Patch.Pattern =
            ParseAdminMassMutationJson(
                "AdminMassMutationPattern",
                "Pattern JSON"
            );
    }

    if (
        AdminMassMutationFieldEnabled(
            "Success"
        )
    ) {
        Patch.Success =
            ParseAdminMassMutationJson(
                "AdminMassMutationSuccess",
                "Success result JSON"
            );
    }

    if (
        AdminMassMutationFieldEnabled(
            "Failure"
        )
    ) {
        Patch.Failure =
            ParseAdminMassMutationJson(
                "AdminMassMutationFailure",
                "Failure result JSON"
            );
    }

    if (
        AdminMassMutationFieldEnabled(
            "PlantsUsed"
        )
    ) {
        Patch.PlantsUsed =
            ParseAdminMassMutationPlantKeys(
                "AdminMassMutationPlantsUsed",
                "Plants used"
            );
    }

    if (
        AdminMassMutationFieldEnabled(
            "PlantsCreated"
        )
    ) {
        Patch.PlantsCreated =
            ParseAdminMassMutationPlantKeys(
                "AdminMassMutationPlantsCreated",
                "Plants created"
            );
    }

    return Patch;
}


function BuildAdminMassMutationPayload(
    MutationKey,
    Patch
) {
    const Source =
        AdminMassMutationCatalogue[
            MutationKey
        ];

    const Mutation = {
        Id: Number(Source.Id),
        MutationKey: MutationKey,
        Name: Source.Name ?? "",
        Description:
            Source.Description ?? "",
        Hint: Source.Hint ?? "",
        Priority:
            Number(Source.Priority ?? 0),
        Chance:
            Number(Source.Chance ?? 0),
        Cooldown:
            Number(Source.Cooldown ?? 0),
        Rotation:
            Source.Rotation ?? "None",
        AllowImmature:
            Source.AllowImmature === true,
        Pattern:
            JSON.parse(
                JSON.stringify(
                    Source.Pattern ?? []
                )
            ),
        Success:
            JSON.parse(
                JSON.stringify(
                    Source.Success ?? []
                )
            ),
        Failure:
            JSON.parse(
                JSON.stringify(
                    Source.Failure ?? "Keep"
                )
            ),
        Relations: {
            PlantsUsed: [
                ...(Source.Relations
                    ?.PlantsUsed ?? [])
            ],
            PlantsCreated: [
                ...(Source.Relations
                    ?.PlantsCreated ?? [])
            ]
        },
        IsNew: false
    };

    for (
        const [Key, Value]
        of Object.entries(Patch)
    ) {
        if (
            Key === "PlantsUsed" ||
            Key === "PlantsCreated"
        ) {
            Mutation.Relations[Key] = [
                ...Value
            ];
            continue;
        }

        Mutation[Key] =
            Value !== null &&
            typeof Value === "object"
                ? JSON.parse(
                    JSON.stringify(Value)
                )
                : Value;
    }

    return Mutation;
}


async function SaveAdminMassMutations(
    Event
) {
    Event.preventDefault();

    if (AdminMassMutationSavePending) {
        return;
    }

    const SelectedKeys =
        GetAdminMassMutationSelectedKeys();

    if (SelectedKeys.length === 0) {
        SetAdminMassMutationMessage(
            "Mark at least one mutation first."
        );
        return;
    }

    let Patch;

    try {
        Patch =
            GetAdminMassMutationPatch();
    } catch (Error) {
        SetAdminMassMutationMessage(
            Error.message
        );
        return;
    }

    if (Object.keys(Patch).length === 0) {
        SetAdminMassMutationMessage(
            "Enable at least one field to update."
        );
        return;
    }

    const Payloads = [];

    try {
        for (
            const MutationKey
            of SelectedKeys
        ) {
            const Mutation =
                BuildAdminMassMutationPayload(
                    MutationKey,
                    Patch
                );

            ValidateAdminMutation(
                Mutation,
                AdminMassMutationCatalogue,
                AdminMassMutationPlantCatalogue,
                MutationKey
            );

            Payloads.push(Mutation);
        }
    } catch (Error) {
        SetAdminMassMutationMessage(
            Error.message
        );
        return;
    }

    AdminMassMutationSavePending = true;

    const SaveButton =
        document.getElementById(
            "AdminMassMutationSaveButton"
        );

    SaveButton.disabled = true;

    let SavedCount = 0;

    try {
        for (const Mutation of Payloads) {
            SetAdminMassMutationMessage(
                "Saving " +
                (SavedCount + 1) +
                " of " +
                Payloads.length +
                "..."
            );

            await AdminMassMutationRequest(
                "AdminMutations.php",
                "Save",
                {Mutation: Mutation}
            );

            SavedCount++;
        }

        localStorage.removeItem(
            "SarahtoninGardenContent"
        );

        await LoadAdminMassMutationData();

        SetAdminMassMutationMessage(
            SavedCount === 1
                ? "1 mutation updated."
                : SavedCount +
                    " mutations updated."
        );
    } catch (Error) {
        SetAdminMassMutationMessage(
            "Saved " +
            SavedCount +
            " before stopping: " +
            (Error.message ??
                "Couldn't save mutations.")
        );
    } finally {
        AdminMassMutationSavePending = false;
        SaveButton.disabled = false;
    }
}


function BindAdminMassMutationEditor() {
    document.getElementById(
        "AdminMassMutationSelectAll"
    ).addEventListener(
        "click",
        () =>
            SetAdminMassMutationSelection(
                true
            )
    );

    document.getElementById(
        "AdminMassMutationClear"
    ).addEventListener(
        "click",
        () =>
            SetAdminMassMutationSelection(
                false
            )
    );

    document.getElementById(
        "AdminMassMutationForm"
    ).addEventListener(
        "submit",
        SaveAdminMassMutations
    );

    for (
        const Apply
        of document.querySelectorAll(
            "[data-admin-mass-apply]"
        )
    ) {
        Apply.addEventListener(
            "change",
            UpdateAdminMassMutationFieldStates
        );
    }

    UpdateAdminMassMutationFieldStates();
}


async function LoadAdminMassMutationData() {
    const [MutationResult, PlantResult] =
        await Promise.all([
            AdminMassMutationRequest(
                "AdminMutations.php",
                "List"
            ),
            AdminMassMutationRequest(
                "AdminPlants.php",
                "List"
            )
        ]);

    AdminMassMutationCatalogue =
        MutationResult.Mutations ?? {};
    AdminMassMutationPlantCatalogue =
        PlantResult.Plants ?? {};

    RenderAdminMassMutationSelection();
}


function SetAdminMassMutationMessage(
    Message
) {
    document.getElementById(
        "AdminMassMutationMessage"
    ).textContent = Message;
}


async function StartAdminMassMutationEditor() {
    try {
        const Status =
            await GetAdminStatus();

        if (
            Status.Success !== true ||
            Status.IsAdmin !== true
        ) {
            SetAdminMassMutationMessage(
                "Admin access required."
            );
            return;
        }

        BindAdminMassMutationEditor();
        await LoadAdminMassMutationData();

        SetAdminMassMutationMessage(
            "Mark mutations and enable the fields you want to change."
        );
    } catch (Error) {
        console.error(
            "Couldn't start Mass mutation editor:",
            Error
        );

        SetAdminMassMutationMessage(
            Error.message ??
            "Couldn't load the Mass mutation editor."
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartAdminMassMutationEditor
);
