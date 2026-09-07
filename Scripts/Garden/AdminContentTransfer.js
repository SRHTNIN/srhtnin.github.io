let AdminTransferPlants = {};
let AdminTransferMutations = {};
let AdminTransferImportItems = [];
let AdminTransferExportSelection = new Set();
let AdminTransferExportSearch = "";
let AdminTransferSavePending = false;


async function StartAdminContentTransfer() {
    const ImportButton =
        document.getElementById(
            "AdminMassImportButton"
        );

    if (ImportButton === null) {
        return;
    }

    try {
        const Status =
            await GetAdminStatus();

        if (
            Status.Success !== true ||
            Status.IsAdmin !== true
        ) {
            return;
        }

        BindAdminContentTransfer();
        await LoadAdminTransferCatalogues();
    } catch (Error) {
        console.error(
            "Couldn't start Admin content transfer:",
            Error
        );

        SetAdminTransferImportMessage(
            Error.message ??
            "Couldn't load mass import and export."
        );
    }
}


function BindAdminContentTransfer() {
    document.getElementById(
        "AdminMassImportButton"
    ).addEventListener(
        "click",
        () => {
            document.getElementById(
                "AdminMassImportFiles"
            ).click();
        }
    );

    document.getElementById(
        "AdminMassImportChooseButton"
    ).addEventListener(
        "click",
        () => {
            document.getElementById(
                "AdminMassImportFiles"
            ).click();
        }
    );

    document.getElementById(
        "AdminMassImportFiles"
    ).addEventListener(
        "change",
        ImportAdminContentFiles
    );

    document.getElementById(
        "AdminMassImportSaveButton"
    ).addEventListener(
        "click",
        SaveAdminImportedContent
    );

    document.getElementById(
        "AdminMassImportCloseButton"
    ).addEventListener(
        "click",
        () => HideAdminTransferPanel(
            "AdminMassImportPanel"
        )
    );

    document.getElementById(
        "AdminMassExportButton"
    ).addEventListener(
        "click",
        ShowAdminMassExport
    );

    document.getElementById(
        "AdminMassExportCloseButton"
    ).addEventListener(
        "click",
        () => HideAdminTransferPanel(
            "AdminMassExportPanel"
        )
    );

    document.getElementById(
        "AdminMassExportSearchInput"
    ).addEventListener(
        "input",
        Event => {
            AdminTransferExportSearch =
                Event.target.value;

            RenderAdminMassExport();
        }
    );

    document.getElementById(
        "AdminMassExportSelectAllButton"
    ).addEventListener(
        "click",
        () => SelectAdminTransferExport(
            "All"
        )
    );

    document.getElementById(
        "AdminMassExportSelectPlantsButton"
    ).addEventListener(
        "click",
        () => SelectAdminTransferExport(
            "Plant"
        )
    );

    document.getElementById(
        "AdminMassExportSelectMutationsButton"
    ).addEventListener(
        "click",
        () => SelectAdminTransferExport(
            "Mutation"
        )
    );

    document.getElementById(
        "AdminMassExportDeselectAllButton"
    ).addEventListener(
        "click",
        () => {
            AdminTransferExportSelection.clear();
            RenderAdminMassExport();
        }
    );

    document.getElementById(
        "AdminMassExportSaveButton"
    ).addEventListener(
        "click",
        ExportAdminSelectedContent
    );
}


async function AdminTransferRequest(
    Endpoint,
    Action = "List",
    Data = {}
) {
    const SaveKey =
        GetStoredAdminSaveKey();

    if (SaveKey === null) {
        throw new Error(
            "A valid Account Key is required."
        );
    }

    const Response = await fetch(
        AdminApiUrl + "/" + Endpoint,
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
            "Admin API returned invalid JSON."
        );
    }

    if (
        !Response.ok ||
        Result.Success !== true
    ) {
        throw new Error(
            Result.Error ??
            "Admin request failed."
        );
    }

    return Result;
}


async function LoadAdminTransferCatalogues() {
    const [
        PlantResult,
        MutationResult
    ] = await Promise.all([
        AdminTransferRequest(
            "AdminPlants.php"
        ),
        AdminTransferRequest(
            "AdminMutations.php"
        )
    ]);

    AdminTransferPlants =
        PlantResult.Plants ?? {};

    AdminTransferMutations =
        MutationResult.Mutations ?? {};

    Plants = AdminTransferPlants;
    MutationSets = AdminTransferMutations;
}


function ShowAdminTransferPanel(
    PanelId
) {
    for (
        const Id
        of [
            "AdminMassImportPanel",
            "AdminMassExportPanel"
        ]
    ) {
        const Panel =
            document.getElementById(Id);

        if (Panel !== null) {
            Panel.hidden =
                Id !== PanelId;
        }
    }

    document.getElementById(
        PanelId
    )?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function HideAdminTransferPanel(
    PanelId
) {
    const Panel =
        document.getElementById(
            PanelId
        );

    if (Panel !== null) {
        Panel.hidden = true;
    }
}


async function ImportAdminContentFiles(
    Event
) {
    const Input = Event.target;
    const Files = [
        ...(Input.files ?? [])
    ];

    Input.value = "";

    if (Files.length === 0) {
        return;
    }

    ShowAdminTransferPanel(
        "AdminMassImportPanel"
    );

    SetAdminTransferImportMessage(
        "Reading " +
        Files.length.toLocaleString() +
        (Files.length === 1
            ? " file..."
            : " files...")
    );

    AdminTransferImportItems = [];

    for (const File of Files) {
        AdminTransferImportItems.push(
            await ParseAdminTransferFile(
                File
            )
        );
    }

    PrepareAdminTransferImportItems();
    RenderAdminMassImport();
}


async function ParseAdminTransferFile(
    File
) {
    try {
        const DocumentData =
            await ReadAdminJsonFile(
                File
            );

        if (!IsAdminPlainObject(
            DocumentData
        )) {
            throw new Error(
                "JSON must contain an object."
            );
        }

        let Type =
            typeof DocumentData.Type ===
                "string"
                ? DocumentData.Type
                    .trim()
                : "";

        if (Type === "") {
            if (
                IsAdminPlainObject(
                    DocumentData.Plant
                ) ||
                DocumentData.PlantKey !==
                    undefined
            ) {
                Type = "Plant";
            } else if (
                IsAdminPlainObject(
                    DocumentData.Mutation
                ) ||
                DocumentData.MutationKey !==
                    undefined
            ) {
                Type = "Mutation";
            }
        }

        if (
            Type !== "Plant" &&
            Type !== "Mutation"
        ) {
            throw new Error(
                "JSON must be a Plant or Mutation export."
            );
        }

        if (
            DocumentData.Version !==
                undefined &&
            Number(
                DocumentData.Version
            ) !== 1
        ) {
            throw new Error(
                "Unsupported " +
                Type.toLowerCase() +
                " JSON version."
            );
        }

        const Imported =
            IsAdminPlainObject(
                DocumentData[Type]
            )
                ? DocumentData[Type]
                : DocumentData;

        if (!IsAdminPlainObject(
            Imported
        )) {
            throw new Error(
                Type +
                " JSON must contain a " +
                Type.toLowerCase() +
                " object."
            );
        }

        return {
            FileName: File.name,
            Type: Type,
            Raw: Imported,
            Key: String(
                Imported[
                    Type === "Plant"
                        ? "PlantKey"
                        : "MutationKey"
                ] ?? ""
            ).trim(),
            Data: null,
            Existing: false,
            Error: null,
            Saved: false,
            SaveError: null
        };
    } catch (Error) {
        return {
            FileName: File.name,
            Type: null,
            Raw: null,
            Key: "",
            Data: null,
            Existing: false,
            Error:
                Error.message ??
                "Couldn't read JSON file.",
            Saved: false,
            SaveError: null
        };
    }
}


function PrepareAdminTransferImportItems() {
    const DuplicateCounts =
        new Map();

    for (
        const Item
        of AdminTransferImportItems
    ) {
        if (
            Item.Error !== null ||
            Item.Type === null ||
            Item.Key === ""
        ) {
            continue;
        }

        const DuplicateKey =
            Item.Type + ":" +
            Item.Key;

        DuplicateCounts.set(
            DuplicateKey,
            (
                DuplicateCounts.get(
                    DuplicateKey
                ) ?? 0
            ) + 1
        );
    }

    for (
        const Item
        of AdminTransferImportItems
    ) {
        if (
            Item.Error !== null ||
            Item.Type === null
        ) {
            continue;
        }

        if (Item.Key === "") {
            Item.Error =
                Item.Type +
                " Key cannot be empty.";
            continue;
        }

        if (
            DuplicateCounts.get(
                Item.Type + ":" +
                Item.Key
            ) > 1
        ) {
            Item.Error =
                "The batch contains more than one " +
                Item.Type.toLowerCase() +
                " with key " +
                Item.Key + ".";
        }
    }

    const PlantCatalogue =
        CloneAdminTransferValue(
            AdminTransferPlants
        );

    let NextPlantId =
        GetNextAdminTransferId(
            AdminTransferPlants
        );

    for (
        const Item
        of AdminTransferImportItems
    ) {
        if (
            Item.Type !== "Plant" ||
            Item.Error !== null
        ) {
            continue;
        }

        const Existing =
            AdminTransferPlants[
                Item.Key
            ];

        Item.Existing =
            Existing !== undefined;

        try {
            const Plant =
                NormalizeAdminTransferPlant(
                    Item.Raw,
                    Item.Key,
                    Existing,
                    Existing?.Id ??
                        NextPlantId
                );

            ValidateAdminPlant(
                Plant,
                PlantCatalogue,
                Item.Existing
                    ? Item.Key
                    : null
            );

            Item.Data = Plant;
            PlantCatalogue[
                Item.Key
            ] = CloneAdminTransferValue(
                Plant
            );

            if (!Item.Existing) {
                NextPlantId++;
            }
        } catch (Error) {
            Item.Error =
                Error.message ??
                "Plant validation failed.";
        }
    }

    const MutationCatalogue =
        CloneAdminTransferValue(
            AdminTransferMutations
        );

    let NextMutationId =
        GetNextAdminTransferId(
            AdminTransferMutations
        );

    for (
        const Item
        of AdminTransferImportItems
    ) {
        if (
            Item.Type !== "Mutation" ||
            Item.Error !== null
        ) {
            continue;
        }

        const Existing =
            AdminTransferMutations[
                Item.Key
            ];

        Item.Existing =
            Existing !== undefined;

        try {
            const Mutation =
                NormalizeAdminTransferMutation(
                    Item.Raw,
                    Item.Key,
                    Existing,
                    Existing?.Id ??
                        NextMutationId,
                    PlantCatalogue
                );

            ValidateAdminMutation(
                Mutation,
                MutationCatalogue,
                PlantCatalogue,
                Item.Existing
                    ? Item.Key
                    : null
            );

            Item.Data = Mutation;
            MutationCatalogue[
                Item.Key
            ] = CloneAdminTransferValue(
                Mutation
            );

            if (!Item.Existing) {
                NextMutationId++;
            }
        } catch (Error) {
            Item.Error =
                Error.message ??
                "Mutation validation failed.";
        }
    }
}


function NormalizeAdminTransferPlant(
    Imported,
    PlantKey,
    Existing,
    PlantId
) {
    const Shop =
        IsAdminPlainObject(
            Imported.Shop
        )
            ? Imported.Shop
            : {};

    const ShopPlant =
        Shop.ShopPlant === true ||
        Imported.ShopPlant === true;

    return {
        Id: Number(PlantId),
        PlantKey: PlantKey,
        Name: String(
            Imported.Name ?? ""
        ).trim(),
        Description:
            typeof Imported.Description ===
                "string"
                ? Imported.Description.trim()
                : "",
        Tags:
            Array.isArray(
                Imported.Tags
            )
                ? Imported.Tags.map(
                    Tag =>
                        String(Tag).trim()
                )
                : [],
        GrowthTime: Number(
            Imported.GrowthTime
        ),
        HarvestMultiplier: Number(
            Imported.HarvestMultiplier ??
            1.5
        ),
        Effects:
            IsAdminPlainObject(
                Imported.Effects
            )
                ? CloneAdminTransferValue(
                    Imported.Effects
                )
                : {},
        DirectionalSprites:
            Imported.DirectionalSprites ===
            true,
        ShopPlant: ShopPlant,
        BaseCost:
            ShopPlant
                ? Number(
                    Shop.BaseCost ??
                    Imported.BaseCost
                )
                : null,
        IsNew: Existing === undefined
    };
}


function NormalizeAdminTransferMutation(
    Imported,
    MutationKey,
    Existing,
    MutationId,
    PlantCatalogue
) {
    return {
        Id: Number(MutationId),
        MutationKey: MutationKey,
        Name: String(
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
        Priority: Number(
            Imported.Priority ?? 0
        ),
        Chance: Number(
            Imported.Chance
        ),
        Cooldown: Number(
            Imported.Cooldown
        ),
        Rotation:
            Imported.Rotation ??
            "None",
        AllowImmature:
            Imported.AllowImmature ===
            true,
        Lists:
            CloneAdminTransferValue(
                Imported.Lists ?? []
            ),
        Pattern:
            CloneAdminTransferValue(
                Imported.Pattern
            ),
        Success:
            CloneAdminTransferValue(
                Imported.Success
            ),
        Failure:
            CloneAdminTransferValue(
                Imported.Failure ??
                "Keep"
            ),
        Relations:
            ConvertAdminTransferRelations(
                Imported.Relations,
                PlantCatalogue
            ),
        IsNew: Existing === undefined
    };
}


function ConvertAdminTransferRelations(
    Relations,
    PlantCatalogue
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

    if (!IsAdminPlainObject(
        Relations
    )) {
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
                PlantCatalogue[Value];

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


function GetNextAdminTransferId(
    Catalogue
) {
    return Math.max(
        0,
        ...Object.values(
            Catalogue ?? {}
        ).map(
            Item =>
                Number(
                    Item?.Id ?? 0
                )
        )
    ) + 1;
}


function GetAdminTransferPreviewCatalogues() {
    const PreviewPlants =
        CloneAdminTransferValue(
            AdminTransferPlants
        );

    const PreviewMutations =
        CloneAdminTransferValue(
            AdminTransferMutations
        );

    for (
        const Item
        of AdminTransferImportItems
    ) {
        if (
            Item.Error !== null ||
            Item.Data === null ||
            Item.Saved === true
        ) {
            continue;
        }

        if (Item.Type === "Plant") {
            PreviewPlants[Item.Key] =
                GetAdminTransferDisplayPlant(
                    Item.Key,
                    Item.Data,
                    AdminTransferPlants[
                        Item.Key
                    ]
                );
        } else if (
            Item.Type === "Mutation"
        ) {
            PreviewMutations[Item.Key] =
                GetAdminTransferDisplayMutation(
                    Item.Key,
                    Item.Data
                );
        }
    }

    for (
        const [PlantKey, Plant]
        of Object.entries(
            PreviewPlants
        )
    ) {
        PreviewPlants[PlantKey] =
            GetAdminTransferDisplayPlant(
                PlantKey,
                Plant,
                AdminTransferPlants[
                    PlantKey
                ]
            );
    }

    return {
        Plants: PreviewPlants,
        Mutations: PreviewMutations
    };
}


function GetAdminTransferDisplayPlant(
    PlantKey,
    Plant,
    Existing = null
) {
    const Shop =
        IsAdminPlainObject(
            Plant.Shop
        )
            ? Plant.Shop
            : {};

    const ShopPlant =
        Plant.ShopPlant === true ||
        Shop.ShopPlant === true;

    return {
        ...Plant,
        PlantKey: PlantKey,
        Shop: {
            ShopPlant: ShopPlant,
            BaseCost:
                ShopPlant
                    ? (
                        Plant.BaseCost ??
                        Shop.BaseCost ??
                        null
                    )
                    : null
        },
        ImageStages:
            Plant.ImageStages ??
            Existing?.ImageStages ??
            [],
        DirectionalImageStages:
            Plant.DirectionalImageStages ??
            Existing
                ?.DirectionalImageStages ??
            []
    };
}


function GetAdminTransferDisplayMutation(
    MutationKey,
    Mutation
) {
    return {
        ...Mutation,
        MutationKey: MutationKey
    };
}


function RenderAdminMassImport() {
    const List =
        document.getElementById(
            "AdminMassImportList"
        );

    List.replaceChildren();

    const Preview =
        GetAdminTransferPreviewCatalogues();

    Plants = Preview.Plants;
    MutationSets = Preview.Mutations;

    for (
        const Item
        of AdminTransferImportItems
    ) {
        if (
            Item.Error !== null ||
            Item.Data === null
        ) {
            List.appendChild(
                CreateAdminTransferErrorCard(
                    Item
                )
            );

            continue;
        }

        let Card;

        if (Item.Type === "Plant") {
            Card =
                CreateAdminTransferPlantCard(
                    Item.Key,
                    Preview.Plants[
                        Item.Key
                    ],
                    Preview.Plants,
                    Preview.Mutations
                );
        } else {
            Card =
                CreateAdminTransferMutationCard(
                    Item.Key,
                    Preview.Mutations[
                        Item.Key
                    ],
                    Preview.Plants
                );
        }

        AddAdminTransferCardStatus(
            Card,
            Item.Saved
                ? "Saved"
                : Item.Existing
                    ? "Update"
                    : "New",
            Item.FileName,
            Item.SaveError
        );

        if (Item.SaveError !== null) {
            Card.classList.add(
                "AdminTransferCardInvalid"
            );
        }

        List.appendChild(Card);
    }

    const ReadyPlants =
        AdminTransferImportItems.filter(
            Item =>
                Item.Type === "Plant" &&
                Item.Error === null &&
                Item.Data !== null &&
                Item.Saved !== true
        ).length;

    const ReadyMutations =
        AdminTransferImportItems.filter(
            Item =>
                Item.Type === "Mutation" &&
                Item.Error === null &&
                Item.Data !== null &&
                Item.Saved !== true
        ).length;

    const Valid =
        ReadyPlants +
        ReadyMutations;

    const Invalid =
        AdminTransferImportItems.filter(
            Item =>
                Item.Error !== null ||
                Item.SaveError !== null
        ).length;

    const SavedPlants =
        AdminTransferImportItems.filter(
            Item =>
                Item.Type === "Plant" &&
                Item.Saved === true
        ).length;

    const SavedMutations =
        AdminTransferImportItems.filter(
            Item =>
                Item.Type === "Mutation" &&
                Item.Saved === true
        ).length;

    const Saved =
        SavedPlants +
        SavedMutations;

    const SummaryParts = [];

    if (ReadyPlants > 0) {
        SummaryParts.push(
            ReadyPlants.toLocaleString() +
            (ReadyPlants === 1
                ? " plant ready"
                : " plants ready")
        );
    }

    if (ReadyMutations > 0) {
        SummaryParts.push(
            ReadyMutations.toLocaleString() +
            (ReadyMutations === 1
                ? " mutation ready"
                : " mutations ready")
        );
    }

    if (SavedPlants > 0) {
        SummaryParts.push(
            SavedPlants.toLocaleString() +
            (SavedPlants === 1
                ? " plant saved"
                : " plants saved")
        );
    }

    if (SavedMutations > 0) {
        SummaryParts.push(
            SavedMutations.toLocaleString() +
            (SavedMutations === 1
                ? " mutation saved"
                : " mutations saved")
        );
    }

    if (Invalid > 0) {
        SummaryParts.push(
            Invalid.toLocaleString() +
            " invalid"
        );
    }

    document.getElementById(
        "AdminMassImportSummary"
    ).textContent =
        SummaryParts.join(" · ") ||
        "No files selected";

    const SaveButton =
        document.getElementById(
            "AdminMassImportSaveButton"
        );

    SaveButton.disabled =
        AdminTransferSavePending ||
        Valid === 0;

    if (
        AdminTransferImportItems.length === 0
    ) {
        SetAdminTransferImportMessage(
            "Choose JSON files to review them here."
        );
    } else if (Invalid > 0) {
        SetAdminTransferImportMessage(
            "Invalid files are skipped. Valid files can still be saved."
        );
    } else if (Saved === 0) {
        SetAdminTransferImportMessage(
            "Review the imported content, then save when ready."
        );
    }
}


function CreateAdminTransferErrorCard(
    Item
) {
    const Card =
        document.createElement(
            "article"
        );

    Card.className =
        "Panel AdminTransferErrorCard";

    const Header =
        document.createElement(
            "div"
        );

    Header.className =
        "PanelHeader AdminTransferErrorHeader";

    const Title =
        document.createElement(
            "h2"
        );

    Title.textContent =
        Item.Key ||
        Item.FileName;

    const Status =
        document.createElement(
            "span"
        );

    Status.className =
        "AdminTransferStatus AdminTransferStatusError";

    Status.textContent =
        "Invalid";

    Header.append(
        Title,
        Status
    );

    const Body =
        document.createElement(
            "div"
        );

    Body.className =
        "AdminTransferErrorBody";

    const FileName =
        document.createElement(
            "p"
        );

    FileName.className =
        "AdminTransferFileName";

    FileName.textContent =
        Item.FileName;

    const ErrorText =
        document.createElement(
            "p"
        );

    ErrorText.textContent =
        Item.Error ??
        Item.SaveError ??
        "Unknown import error.";

    Body.append(
        FileName,
        ErrorText
    );

    Card.append(
        Header,
        Body
    );

    return Card;
}


async function SaveAdminImportedContent() {
    if (AdminTransferSavePending) {
        return;
    }

    const PlantsToSave =
        AdminTransferImportItems.filter(
            Item =>
                Item.Type === "Plant" &&
                Item.Error === null &&
                Item.Data !== null &&
                Item.Saved !== true
        );

    const MutationsToSave =
        AdminTransferImportItems.filter(
            Item =>
                Item.Type === "Mutation" &&
                Item.Error === null &&
                Item.Data !== null &&
                Item.Saved !== true
        );

    if (
        PlantsToSave.length === 0 &&
        MutationsToSave.length === 0
    ) {
        return;
    }

    AdminTransferSavePending = true;

    const SaveButton =
        document.getElementById(
            "AdminMassImportSaveButton"
        );

    SaveButton.disabled = true;
    SaveButton.textContent =
        "Saving...";

    SetAdminTransferImportMessage(
        "Saving imported content..."
    );

    let SavedCount = 0;
    let FailedCount = 0;

    for (const Item of PlantsToSave) {
        try {
            await AdminTransferRequest(
                "AdminPlants.php",
                "Save",
                {
                    Plant: Item.Data
                }
            );

            Item.Saved = true;
            Item.SaveError = null;
            SavedCount++;
        } catch (Error) {
            Item.SaveError =
                Error.message ??
                "Couldn't save plant.";
            FailedCount++;
        }
    }

    for (const Item of MutationsToSave) {
        try {
            await AdminTransferRequest(
                "AdminMutations.php",
                "Save",
                {
                    Mutation: Item.Data
                }
            );

            Item.Saved = true;
            Item.SaveError = null;
            SavedCount++;
        } catch (Error) {
            Item.SaveError =
                Error.message ??
                "Couldn't save mutation.";
            FailedCount++;
        }
    }

    try {
        localStorage.removeItem(
            "SarahtoninGardenContent"
        );

        await LoadAdminTransferCatalogues();

        if (
            typeof StartAdminOverview ===
                "function"
        ) {
            await StartAdminOverview();
        }
    } catch (Error) {
        console.error(
            "Couldn't refresh Admin content after import:",
            Error
        );
    }

    AdminTransferSavePending = false;
    SaveButton.textContent =
        "Save imported content";

    RenderAdminMassImport();

    if (FailedCount === 0) {
        SetAdminTransferImportMessage(
            SavedCount.toLocaleString() +
            (SavedCount === 1
                ? " item saved."
                : " items saved.")
        );
    } else {
        SetAdminTransferImportMessage(
            SavedCount.toLocaleString() +
            " saved, " +
            FailedCount.toLocaleString() +
            " failed. Failed items are shown above."
        );
    }
}


function ShowAdminMassExport() {
    AdminTransferExportSearch = "";

    const SearchInput =
        document.getElementById(
            "AdminMassExportSearchInput"
        );

    SearchInput.value = "";

    ShowAdminTransferPanel(
        "AdminMassExportPanel"
    );

    RenderAdminMassExport();
}


function RenderAdminMassExport() {
    const List =
        document.getElementById(
            "AdminMassExportList"
        );

    List.replaceChildren();

    Plants = AdminTransferPlants;
    MutationSets = AdminTransferMutations;

    const Query =
        AdminTransferExportSearch
            .trim()
            .toLocaleLowerCase();

    const Items =
        GetAdminTransferExportItems()
            .filter(
                Item =>
                    DoesAdminTransferItemMatch(
                        Item,
                        Query
                    )
            );

    for (const Item of Items) {
        let Card;

        if (Item.Type === "Plant") {
            Card =
                CreateAdminTransferPlantCard(
                    Item.Key,
                    Item.Data,
                    AdminTransferPlants,
                    AdminTransferMutations
                );
        } else {
            Card =
                CreateAdminTransferMutationCard(
                    Item.Key,
                    Item.Data,
                    AdminTransferPlants
                );
        }

        DecorateAdminTransferExportCard(
            Card,
            Item
        );

        List.appendChild(Card);
    }

    const PlantCount = [
        ...AdminTransferExportSelection
    ].filter(
        Key => Key.startsWith(
            "Plant:"
        )
    ).length;

    const MutationCount = [
        ...AdminTransferExportSelection
    ].filter(
        Key => Key.startsWith(
            "Mutation:"
        )
    ).length;

    document.getElementById(
        "AdminMassExportSummary"
    ).textContent =
        PlantCount.toLocaleString() +
        (PlantCount === 1
            ? " plant"
            : " plants") +
        " · " +
        MutationCount.toLocaleString() +
        (MutationCount === 1
            ? " mutation"
            : " mutations");

    document.getElementById(
        "AdminMassExportSaveButton"
    ).disabled =
        AdminTransferExportSelection
            .size === 0;

    SetAdminTransferExportMessage(
        Items.length === 0
            ? "No plants or mutations match your search."
            : AdminTransferExportSelection.size === 0
                ? "Click cards to select content for export."
                : AdminTransferExportSelection.size
                    .toLocaleString() +
                    " selected."
    );
}


function GetAdminTransferExportItems() {
    const Items = [];

    for (
        const [PlantKey, Plant]
        of Object.entries(
            AdminTransferPlants
        ).sort(
            (A, B) =>
                Number(A[1].Id) -
                    Number(B[1].Id) ||
                A[0].localeCompare(B[0])
        )
    ) {
        Items.push({
            Type: "Plant",
            Key: PlantKey,
            Data: Plant
        });
    }

    for (
        const [MutationKey, Mutation]
        of Object.entries(
            AdminTransferMutations
        ).sort(
            (A, B) =>
                Number(A[1].Id) -
                    Number(B[1].Id) ||
                A[0].localeCompare(B[0])
        )
    ) {
        Items.push({
            Type: "Mutation",
            Key: MutationKey,
            Data: Mutation
        });
    }

    return Items;
}


function DoesAdminTransferItemMatch(
    Item,
    Query
) {
    if (Query === "") {
        return true;
    }

    const SearchParts = [
        Item.Type,
        Item.Key,
        Item.Data.Id,
        Item.Data.Name,
        Item.Data.Description,
        Item.Data.Hint,
        ...(Array.isArray(
            Item.Data.Tags
        )
            ? Item.Data.Tags
            : [])
    ];

    return SearchParts
        .filter(
            Value =>
                Value !== undefined &&
                Value !== null
        )
        .join(" ")
        .toLocaleLowerCase()
        .includes(Query);
}


function DecorateAdminTransferExportCard(
    Card,
    Item
) {
    const SelectionKey =
        Item.Type + ":" +
        Item.Key;

    const Header =
        Card.querySelector(
            ".PanelHeader"
        );

    const Toggle =
        document.createElement(
            "label"
        );

    Toggle.className =
        "AdminTransferSelectToggle";

    const Checkbox =
        document.createElement(
            "input"
        );

    Checkbox.type = "checkbox";
    Checkbox.checked =
        AdminTransferExportSelection.has(
            SelectionKey
        );

    const Label =
        document.createElement(
            "span"
        );

    Label.textContent =
        Item.Type;

    Toggle.append(
        Checkbox,
        Label
    );

    Header.appendChild(Toggle);

    Card.classList.add(
        "AdminTransferSelectableCard"
    );

    Card.dataset.selected =
        String(Checkbox.checked);

    Checkbox.addEventListener(
        "change",
        () => {
            SetAdminTransferExportSelection(
                SelectionKey,
                Checkbox.checked
            );
        }
    );

    Card.addEventListener(
        "click",
        Event => {
            if (
                Event.target.closest(
                    "input, label, a, button"
                ) !== null
            ) {
                return;
            }

            Checkbox.checked =
                !Checkbox.checked;

            SetAdminTransferExportSelection(
                SelectionKey,
                Checkbox.checked
            );
        }
    );
}


function SetAdminTransferExportSelection(
    SelectionKey,
    Selected
) {
    if (Selected) {
        AdminTransferExportSelection.add(
            SelectionKey
        );
    } else {
        AdminTransferExportSelection.delete(
            SelectionKey
        );
    }

    RenderAdminMassExport();
}


function SelectAdminTransferExport(
    Type
) {
    for (
        const Item
        of GetAdminTransferExportItems()
    ) {
        if (
            Type !== "All" &&
            Item.Type !== Type
        ) {
            continue;
        }

        AdminTransferExportSelection.add(
            Item.Type + ":" +
            Item.Key
        );
    }

    RenderAdminMassExport();
}


function ExportAdminSelectedContent() {
    const Files = [];

    for (
        const SelectionKey
        of AdminTransferExportSelection
    ) {
        const Separator =
            SelectionKey.indexOf(":");

        const Type =
            SelectionKey.slice(
                0,
                Separator
            );

        const Key =
            SelectionKey.slice(
                Separator + 1
            );

        if (Type === "Plant") {
            const Plant =
                AdminTransferPlants[Key];

            if (Plant === undefined) {
                continue;
            }

            Files.push({
                Name:
                    "Plant-" +
                    Key +
                    ".json",
                Text:
                    JSON.stringify(
                        {
                            Type: "Plant",
                            Version: 1,
                            Plant:
                                GetAdminTransferPortablePlant(
                                    Key,
                                    Plant
                                )
                        },
                        null,
                        4
                    ) + "\n"
            });

            continue;
        }

        if (Type === "Mutation") {
            const Mutation =
                AdminTransferMutations[
                    Key
                ];

            if (Mutation === undefined) {
                continue;
            }

            Files.push({
                Name:
                    "Mutation-" +
                    Key +
                    ".json",
                Text:
                    JSON.stringify(
                        {
                            Type: "Mutation",
                            Version: 1,
                            Mutation:
                                GetAdminTransferPortableMutation(
                                    Key,
                                    Mutation
                                )
                        },
                        null,
                        4
                    ) + "\n"
            });
        }
    }

    if (Files.length === 0) {
        SetAdminTransferExportMessage(
            "Select at least one plant or mutation."
        );
        return;
    }

    DownloadAdminTransferZip(
        "Garden-Content-Export.zip",
        Files
    );

    SetAdminTransferExportMessage(
        Files.length.toLocaleString() +
        (Files.length === 1
            ? " JSON file exported."
            : " JSON files exported.")
    );
}


function GetAdminTransferPortablePlant(
    PlantKey,
    Plant
) {
    return {
        PlantKey: PlantKey,
        Name: Plant.Name,
        Description:
            Plant.Description ?? "",
        Tags:
            Array.isArray(Plant.Tags)
                ? [...Plant.Tags]
                : [],
        GrowthTime:
            Number(Plant.GrowthTime),
        HarvestMultiplier:
            Number(
                Plant.HarvestMultiplier ??
                1.5
            ),
        Effects:
            CloneAdminTransferValue(
                Plant.Effects ?? {}
            ),
        DirectionalSprites:
            Plant.DirectionalSprites ===
            true,
        Shop: {
            ShopPlant:
                Plant.Shop?.ShopPlant ===
                true,
            BaseCost:
                Plant.Shop?.ShopPlant ===
                    true
                    ? Plant.Shop.BaseCost
                    : null
        }
    };
}


function GetAdminTransferPortableMutation(
    MutationKey,
    Mutation
) {
    return {
        MutationKey: MutationKey,
        Name: Mutation.Name,
        Description:
            Mutation.Description ?? "",
        Hint:
            typeof Mutation.Hint ===
                "string" &&
            Mutation.Hint.length > 0
                ? Mutation.Hint
                : null,
        Priority: Number(
            Mutation.Priority ?? 0
        ),
        Chance: Number(
            Mutation.Chance
        ),
        Cooldown: Number(
            Mutation.Cooldown
        ),
        Rotation:
            Mutation.Rotation ??
            "None",
        AllowImmature:
            Mutation.AllowImmature ===
            true,
        Lists:
            CloneAdminTransferValue(
                Mutation.Lists ?? []
            ),
        Pattern:
            CloneAdminTransferValue(
                Mutation.Pattern
            ),
        Success:
            CloneAdminTransferValue(
                Mutation.Success
            ),
        Failure:
            CloneAdminTransferValue(
                Mutation.Failure ??
                "Keep"
            ),
        Relations:
            GetAdminTransferPortableRelations(
                Mutation.Relations
            )
    };
}


function GetAdminTransferPortableRelations(
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
                GetAdminTransferPlantKeyById(
                    PlantId,
                    AdminTransferPlants
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


function GetAdminTransferPlantKeyById(
    PlantId,
    PlantCatalogue
) {
    return Object.entries(
        PlantCatalogue ?? {}
    ).find(
        ([, Plant]) =>
            Number(Plant.Id) ===
            Number(PlantId)
    )?.[0] ?? null;
}


function CreateAdminTransferPlantCard(
    PlantKey,
    Plant,
    PlantCatalogue,
    MutationCatalogue
) {
    const Card =
        document.createElement(
            "article"
        );

    Card.className =
        "Panel PlantEncyclopediaCard AdminTransferCard";

    const Header =
        document.createElement(
            "header"
        );

    Header.className =
        "PanelHeader PlantEncyclopediaHeader AdminTransferCardHeader";

    const NumberElement =
        document.createElement(
            "span"
        );

    NumberElement.className =
        "PlantEncyclopediaNumber";

    NumberElement.textContent =
        String(
            Plant.Id
        ).padStart(
            3,
            "0"
        );

    const NameElement =
        document.createElement(
            "h2"
        );

    NameElement.textContent =
        Plant.Name;

    Header.append(
        NumberElement,
        NameElement
    );

    const Body =
        document.createElement(
            "div"
        );

    Body.className =
        "PlantEncyclopediaBody";

    Body.append(
        CreateAdminTransferPlantVisual(
            PlantKey,
            Plant
        ),
        CreateAdminTransferPlantDetails(
            Plant,
            PlantCatalogue,
            MutationCatalogue
        ),
        CreateAdminTransferPlantRelations(
            Plant.Id,
            MutationCatalogue
        )
    );

    Card.append(
        Header,
        Body
    );

    return Card;
}


function CreateAdminTransferPlantVisual(
    PlantKey,
    Plant
) {
    const Visual =
        document.createElement(
            "div"
        );

    Visual.className =
        "PlantTile PlantEncyclopediaVisual";

    const MatureImage =
        GetPlantMatureImageSource(
            PlantKey
        );

    if (MatureImage === null) {
        const Missing =
            document.createElement(
                "span"
            );

        Missing.className =
            "PlantEncyclopediaMissing";
        Missing.textContent =
            "No image";

        Visual.appendChild(Missing);
        return Visual;
    }

    const Image =
        document.createElement(
            "img"
        );

    Image.className =
        "PlantSprite";
    Image.src = MatureImage;
    Image.alt = Plant.Name;

    Visual.appendChild(Image);
    return Visual;
}


function CreateAdminTransferPlantDetails(
    Plant,
    PlantCatalogue,
    MutationCatalogue
) {
    const Details =
        document.createElement(
            "div"
        );

    Details.className =
        "PlantEncyclopediaDetails";

    const Description =
        document.createElement(
            "p"
        );

    Description.className =
        "PlantEncyclopediaDescription";
    Description.textContent =
        Plant.Description ||
        "No description.";

    Details.appendChild(Description);

    const Tags =
        Array.isArray(Plant.Tags)
            ? Plant.Tags
            : [];

    const Cost =
        GetCataloguePlantCostInfo(
            Plant.Id,
            PlantCatalogue,
            MutationCatalogue
        )?.Cost ?? null;

    const Multiplier =
        Number(
            Plant.HarvestMultiplier ??
            1.5
        );

    const Reward =
        Cost === null
            ? null
            : Math.ceil(
                Cost * Multiplier
            );

    const GrowthTime =
        Number(
            Plant.GrowthTime
        );

    const Dph =
        Cost === null ||
        Reward === null ||
        !Number.isFinite(GrowthTime) ||
        GrowthTime <= 0
            ? null
            : (Reward - Cost) *
                3600000 /
                GrowthTime;

    Details.append(
        CreateAdminTransferStat(
            "Plant Key",
            Plant.PlantKey ?? ""
        ),
        CreateAdminTransferStat(
            "Tags",
            Tags.length === 0
                ? "None"
                : Tags.join(", ")
        ),
        CreateAdminTransferStat(
            "Growth",
            FormatAdminTransferDuration(
                GrowthTime
            )
        ),
        CreateAdminTransferStat(
            "Cost",
            Cost === null
                ? "Unavailable"
                : Cost.toLocaleString() +
                    " Dew"
        ),
        CreateAdminTransferStat(
            "Reward",
            Reward === null
                ? "Unavailable"
                : Reward.toLocaleString() +
                    " Dew"
        ),
        CreateAdminTransferStat(
            "Dew / hour",
            Dph === null
                ? "Unavailable"
                : Dph.toLocaleString(
                    undefined,
                    {
                        maximumFractionDigits:
                            2
                    }
                )
        )
    );

    return Details;
}


function CreateAdminTransferStat(
    Name,
    Value
) {
    const Row =
        document.createElement(
            "div"
        );

    Row.className =
        "PlantEncyclopediaStat";

    const NameElement =
        document.createElement(
            "span"
        );

    NameElement.className =
        "PlantEncyclopediaStatName";
    NameElement.textContent = Name;

    const ValueElement =
        document.createElement(
            "span"
        );

    ValueElement.textContent =
        Value;

    Row.append(
        NameElement,
        ValueElement
    );

    return Row;
}


function CreateAdminTransferPlantRelations(
    PlantId,
    MutationCatalogue
) {
    const Relations =
        document.createElement(
            "div"
        );

    Relations.className =
        "PlantEncyclopediaRelations";

    const CreatedBy = [];
    const UsedIn = [];

    for (
        const [MutationKey, Mutation]
        of Object.entries(
            MutationCatalogue
        )
    ) {
        if (
            Mutation.Relations
                ?.PlantsCreated
                ?.includes(
                    Number(PlantId)
                )
        ) {
            CreatedBy.push({
                Key: MutationKey,
                Name:
                    Mutation.Name ??
                    MutationKey
            });
        }

        if (
            Mutation.Relations
                ?.PlantsUsed
                ?.includes(
                    Number(PlantId)
                )
        ) {
            UsedIn.push({
                Key: MutationKey,
                Name:
                    Mutation.Name ??
                    MutationKey
            });
        }
    }

    Relations.append(
        CreateAdminTransferRelationGroup(
            "Created by",
            CreatedBy
        ),
        CreateAdminTransferRelationGroup(
            "Used in",
            UsedIn
        )
    );

    return Relations;
}


function CreateAdminTransferRelationGroup(
    Heading,
    Entries
) {
    const Group =
        document.createElement(
            "section"
        );

    Group.className =
        "PlantEncyclopediaRelationGroup";

    const Title =
        document.createElement(
            "h3"
        );

    Title.textContent = Heading;

    const List =
        document.createElement(
            "ul"
        );

    List.className =
        "PlantEncyclopediaRelationList";

    if (Entries.length === 0) {
        const Empty =
            document.createElement(
                "li"
            );

        Empty.className =
            "PlantEncyclopediaRelationEmpty";
        Empty.textContent = "None";
        List.appendChild(Empty);
    } else {
        for (
            const Entry
            of Entries.sort(
                (A, B) =>
                    A.Name.localeCompare(
                        B.Name
                    )
            )
        ) {
            const Item =
                document.createElement(
                    "li"
                );

            Item.textContent =
                Entry.Name;

            List.appendChild(Item);
        }
    }

    Group.append(
        Title,
        List
    );

    return Group;
}


function CreateAdminTransferMutationCard(
    MutationKey,
    Mutation,
    PlantCatalogue
) {
    const Card =
        document.createElement(
            "article"
        );

    Card.className =
        "Panel MutationEncyclopediaCard AdminTransferCard";

    const Header =
        document.createElement(
            "header"
        );

    Header.className =
        "PanelHeader MutationEncyclopediaHeader AdminTransferCardHeader";

    const NumberElement =
        document.createElement(
            "span"
        );

    NumberElement.className =
        "MutationEncyclopediaNumber";
    NumberElement.textContent =
        String(
            Mutation.Id
        ).padStart(
            3,
            "0"
        );

    const NameElement =
        document.createElement(
            "h2"
        );

    NameElement.textContent =
        Mutation.Name;

    Header.append(
        NumberElement,
        NameElement
    );

    const Body =
        document.createElement(
            "div"
        );

    Body.className =
        "MutationEncyclopediaBody";

    const Description =
        document.createElement(
            "p"
        );

    Description.className =
        "MutationEncyclopediaDescription";
    Description.textContent =
        Mutation.Description ||
        "No description.";

    Body.append(
        Description,
        CreateAdminTransferMutationStats(
            MutationKey,
            Mutation
        ),
        CreateAdminTransferMutationRecipe(
            Mutation,
            PlantCatalogue
        ),
        CreateAdminTransferMutationRelations(
            Mutation,
            PlantCatalogue
        )
    );

    Card.append(
        Header,
        Body
    );

    return Card;
}


function CreateAdminTransferMutationStats(
    MutationKey,
    Mutation
) {
    const Stats =
        document.createElement(
            "div"
        );

    Stats.className =
        "MutationEncyclopediaStats";

    Stats.append(
        CreateAdminTransferStat(
            "Mutation Key",
            MutationKey
        ),
        CreateAdminTransferStat(
            "Chance",
            FormatAdminTransferChance(
                Mutation.Chance
            )
        ),
        CreateAdminTransferStat(
            "Cooldown",
            FormatAdminTransferDuration(
                Mutation.Cooldown,
                true
            )
        ),
        CreateAdminTransferStat(
            "Rotation",
            Mutation.Rotation ??
            "None"
        ),
        CreateAdminTransferStat(
            "Mature plants",
            Mutation.AllowImmature ===
                true
                ? "Not required"
                : "Required"
        )
    );

    return Stats;
}


function CreateAdminTransferMutationRecipe(
    Mutation,
    PlantCatalogue
) {
    const Section =
        document.createElement(
            "section"
        );

    Section.className =
        "MutationEncyclopediaRecipeSection";

    const Title =
        document.createElement(
            "h3"
        );

    Title.textContent = "Recipe";

    const Pattern =
        NormalizeAdminTransferMatrix(
            Mutation.Pattern,
            null,
            null,
            "Any"
        );

    if (Pattern.length === 0) {
        const Missing =
            document.createElement(
                "p"
            );

        Missing.className =
            "MutationEncyclopediaMissingRecipe";
        Missing.textContent =
            "No recipe data.";

        Section.append(
            Title,
            Missing
        );

        return Section;
    }

    const Success =
        NormalizeAdminTransferMatrix(
            Mutation.Success,
            Pattern[0].length,
            Pattern.length,
            "Keep"
        );

    const ListOffsets =
        CreateMutationRecipePreviewOffsets(
            Pattern,
            Success
        );

    const Flow =
        document.createElement(
            "div"
        );

    Flow.className =
        "MutationEncyclopediaRecipeFlow";

    const Arrow =
        document.createElement(
            "span"
        );

    Arrow.className =
        "MutationEncyclopediaRecipeArrow";
    Arrow.textContent = "→";
    Arrow.setAttribute(
        "aria-hidden",
        "true"
    );

    Flow.append(
        CreateAdminTransferMutationRecipePanel(
            "Arrange",
            Pattern,
            "Pattern",
            PlantCatalogue,
            Mutation.Lists,
            ListOffsets.Pattern
        ),
        Arrow,
        CreateAdminTransferMutationRecipePanel(
            "Result",
            Success,
            "Result",
            PlantCatalogue,
            Mutation.Lists,
            ListOffsets.Result
        )
    );

    Section.append(
        Title,
        Flow
    );

    const Lists =
        CreateAdminTransferMutationLists(
            Mutation.Lists,
            PlantCatalogue
        );

    if (Lists !== null) {
        Section.appendChild(Lists);
    }

    return Section;
}


function CreateAdminTransferMutationLists(
    Lists,
    PlantCatalogue
) {
    if (
        !Array.isArray(Lists) ||
        Lists.length === 0
    ) {
        return null;
    }

    const Container =
        document.createElement("div");

    Container.className =
        "MutationRecipeLists";

    const Heading =
        document.createElement("h4");

    Heading.textContent = "Lists";

    const OrderedList =
        document.createElement("ol");

    for (const List of Lists) {
        const ListItem =
            document.createElement("li");

        const Mode =
            document.createElement("strong");

        Mode.textContent =
            List?.Mode === "Any"
                ? "Any: "
                : "Once: ";

        const Labels =
            Array.isArray(List?.Items)
                ? List.Items.map(
                    Item => {
                        if (Item?.Type === "Plant") {
                            return PlantCatalogue?.[
                                Item.Value
                            ]?.Name ??
                                Item.Value ??
                                "Unknown plant";
                        }

                        if (Item?.Type === "Tag") {
                            return "Tag: " +
                                (Item.Value ?? "");
                        }

                        if (Item?.Type === "Empty") {
                            return "Empty";
                        }

                        return "Any";
                    }
                )
                : [];

        ListItem.append(
            Mode,
            document.createTextNode(
                Labels.length > 0
                    ? Labels.join(", ")
                    : "Empty list"
            )
        );

        OrderedList.appendChild(
            ListItem
        );
    }

    Container.append(
        Heading,
        OrderedList
    );

    return Container;
}


function CreateAdminTransferMutationRecipePanel(
    Heading,
    Matrix,
    Mode,
    PlantCatalogue,
    Lists,
    ListOffsets
) {
    const Panel =
        document.createElement(
            "div"
        );

    Panel.className =
        "MutationEncyclopediaRecipePanel";

    const Title =
        document.createElement(
            "h4"
        );

    Title.textContent = Heading;

    const Grid =
        document.createElement(
            "div"
        );

    Grid.className =
        "GuideRecipe MutationRecipeGrid";
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
            const Value =
                Matrix[Y][X];

            const Cell =
                CreateAdminTransferMutationCell(
                    Value,
                    Mode,
                    PlantCatalogue
                );

            const ListNumber =
                GetMutationRecipePreviewListReference(
                    Value
                );

            if (ListNumber !== null) {
                RegisterMutationRecipePreviewListCell(
                    Cell,
                    Lists?.[ListNumber - 1],
                    ListNumber,
                    ListOffsets?.[Y]?.[X],
                    PlantCatalogue
                );
            }

            Grid.appendChild(Cell);
        }
    }

    Panel.append(
        Title,
        Grid
    );

    return Panel;
}


function CreateAdminTransferMutationCell(
    Value,
    Mode,
    PlantCatalogue
) {
    if (Mode === "Result") {
        if (
            Value === null ||
            Value === "Keep"
        ) {
            return CreateAdminTransferTextCell(
                "Keep",
                "MutationRecipeKeep"
            );
        }

        if (Value === "Empty") {
            return CreateAdminTransferTextCell(
                "Empty",
                "GuideRecipeEmpty"
            );
        }

        const PlantValue =
            typeof Value === "string"
                ? Value
                : IsAdminPlainObject(
                    Value
                ) &&
                typeof Value.Plant ===
                    "string"
                    ? Value.Plant
                    : null;

        if (PlantValue === null) {
            return CreateAdminTransferTextCell(
                "Keep",
                "MutationRecipeKeep"
            );
        }

        if (PlantValue.startsWith("$")) {
            return CreateAdminTransferTextCell(
                PlantValue.slice(1),
                "MutationRecipeCapture"
            );
        }

        const ListMatch =
            /^List:([1-9][0-9]*)$/.exec(
                PlantValue
            );

        if (ListMatch !== null) {
            return CreateAdminTransferTextCell(
                "List " + ListMatch[1],
                "MutationRecipeMatcher"
            );
        }

        return CreateAdminTransferPlantCell(
            PlantValue,
            PlantCatalogue
        );
    }

    if (
        Value === null ||
        Value === "Any"
    ) {
        return CreateAdminTransferTextCell(
            "Any",
            "MutationRecipeAny"
        );
    }

    if (Value === "Empty") {
        return CreateAdminTransferTextCell(
            "Empty",
            "GuideRecipeEmpty"
        );
    }

    if (typeof Value === "string") {
        const ListMatch =
            /^List:([1-9][0-9]*)$/.exec(
                Value
            );

        if (ListMatch !== null) {
            return CreateAdminTransferTextCell(
                "List " + ListMatch[1],
                "MutationRecipeMatcher"
            );
        }

        return CreateAdminTransferPlantCell(
            Value,
            PlantCatalogue
        );
    }

    if (!IsAdminPlainObject(Value)) {
        return CreateAdminTransferTextCell(
            "Any",
            "MutationRecipeAny"
        );
    }

    if (typeof Value.Plant === "string") {
        return CreateAdminTransferPlantCell(
            Value.Plant,
            PlantCatalogue
        );
    }

    const Requirements = [];

    if (
        Array.isArray(Value.Tags) &&
        Value.Tags.length > 0
    ) {
        Requirements.push(
            Value.Tags.join(" + ")
        );
    }

    if (
        Array.isArray(Value.TagsAny) &&
        Value.TagsAny.length > 0
    ) {
        Requirements.push(
            "Any: " +
            Value.TagsAny.join(" / ")
        );
    }

    if (
        Array.isArray(Value.TagsNot) &&
        Value.TagsNot.length > 0
    ) {
        Requirements.push(
            "Not: " +
            Value.TagsNot.join(", ")
        );
    }

    if (Requirements.length === 0) {
        return CreateAdminTransferTextCell(
            "Any",
            "MutationRecipeAny"
        );
    }

    return CreateAdminTransferTextCell(
        Requirements.join("\n"),
        "MutationRecipeMatcher"
    );
}


function CreateAdminTransferPlantCell(
    PlantKey,
    PlantCatalogue
) {
    const Plant =
        PlantCatalogue[PlantKey];

    if (Plant === undefined) {
        return CreateAdminTransferTextCell(
            PlantKey,
            "MutationRecipeMatcher"
        );
    }

    const Element =
        document.createElement(
            "div"
        );

    Element.className =
        "PlantTile GuideRecipeCell GuideRecipePlant";

    const MatureImage =
        GetPlantMatureImageSource(
            PlantKey
        );

    if (MatureImage !== null) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite GuideRecipeImage";
        Image.src = MatureImage;
        Image.alt = "";
        Element.appendChild(Image);
    }

    const Label =
        document.createElement(
            "span"
        );

    Label.className =
        "GuideRecipeLabel";
    Label.textContent =
        Plant.Name ??
        PlantKey;

    Element.appendChild(Label);
    return Element;
}


function CreateAdminTransferTextCell(
    Text,
    ClassName
) {
    const Element =
        document.createElement(
            "div"
        );

    Element.className =
        "PlantTile GuideRecipeCell " +
        ClassName;

    const Label =
        document.createElement(
            "span"
        );

    Label.className =
        "MutationRecipeText";
    Label.textContent = Text;

    Element.appendChild(Label);
    return Element;
}


function NormalizeAdminTransferMatrix(
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

    if (
        TargetWidth <= 0 ||
        TargetHeight <= 0
    ) {
        return [];
    }

    const Result = [];

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

        Result.push(Row);
    }

    return Result;
}


function CreateAdminTransferMutationRelations(
    Mutation,
    PlantCatalogue
) {
    const Relations =
        document.createElement(
            "div"
        );

    Relations.className =
        "MutationEncyclopediaRelations";

    Relations.append(
        CreateAdminTransferMutationRelationGroup(
            "Plants used",
            Mutation.Relations
                ?.PlantsUsed ?? [],
            PlantCatalogue
        ),
        CreateAdminTransferMutationRelationGroup(
            "Plants created",
            Mutation.Relations
                ?.PlantsCreated ?? [],
            PlantCatalogue
        )
    );

    return Relations;
}


function CreateAdminTransferMutationRelationGroup(
    Heading,
    PlantIds,
    PlantCatalogue
) {
    const Group =
        document.createElement(
            "section"
        );

    Group.className =
        "MutationEncyclopediaRelationGroup";

    const Title =
        document.createElement(
            "h3"
        );

    Title.textContent = Heading;

    const List =
        document.createElement(
            "ul"
        );

    List.className =
        "MutationEncyclopediaRelationList";

    const Ids = [
        ...new Set(
            PlantIds.map(
                Value => Number(Value)
            )
        )
    ].sort(
        (A, B) => A - B
    );

    if (Ids.length === 0) {
        const Empty =
            document.createElement(
                "li"
            );

        Empty.className =
            "MutationEncyclopediaRelationEmpty";
        Empty.textContent = "None";
        List.appendChild(Empty);
    } else {
        for (const PlantId of Ids) {
            const PlantKey =
                GetAdminTransferPlantKeyById(
                    PlantId,
                    PlantCatalogue
                );

            const Item =
                document.createElement(
                    "li"
                );

            Item.textContent =
                PlantKey === null
                    ? "Plant " +
                        PlantId
                    : PlantCatalogue[
                        PlantKey
                    ]?.Name ??
                        PlantKey;

            List.appendChild(Item);
        }
    }

    Group.append(
        Title,
        List
    );

    return Group;
}


function AddAdminTransferCardStatus(
    Card,
    StatusText,
    FileName,
    ErrorText = null
) {
    const Header =
        Card.querySelector(
            ".PanelHeader"
        );

    const Meta =
        document.createElement(
            "div"
        );

    Meta.className =
        "AdminTransferCardMeta";

    const Status =
        document.createElement(
            "span"
        );

    Status.className =
        "AdminTransferStatus";
    Status.textContent =
        StatusText;

    const File =
        document.createElement(
            "span"
        );

    File.className =
        "AdminTransferFileName";
    File.textContent =
        FileName;

    Meta.append(
        Status,
        File
    );

    Header.appendChild(Meta);

    if (ErrorText !== null) {
        const Error =
            document.createElement(
                "p"
            );

        Error.className =
            "AdminTransferInlineError";
        Error.textContent =
            ErrorText;

        Card.appendChild(Error);
    }
}


function FormatAdminTransferChance(
    Chance
) {
    const Percent =
        Math.max(
            0,
            Math.min(
                Number(Chance ?? 1),
                1
            )
        ) * 100;

    return Percent.toLocaleString(
        undefined,
        {
            maximumFractionDigits: 2
        }
    ) + "%";
}


function FormatAdminTransferDuration(
    Milliseconds,
    AllowNone = false
) {
    let TotalSeconds =
        Math.max(
            0,
            Math.ceil(
                Number(
                    Milliseconds ?? 0
                ) /
                1000
            )
        );

    if (
        TotalSeconds === 0 &&
        AllowNone
    ) {
        return "None";
    }

    const Hours =
        Math.floor(
            TotalSeconds / 3600
        );

    TotalSeconds %= 3600;

    const Minutes =
        Math.floor(
            TotalSeconds / 60
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


function CloneAdminTransferValue(
    Value
) {
    if (Value === undefined) {
        return undefined;
    }

    return JSON.parse(
        JSON.stringify(Value)
    );
}


function SetAdminTransferImportMessage(
    Message
) {
    const Element =
        document.getElementById(
            "AdminMassImportMessage"
        );

    if (Element !== null) {
        Element.textContent = Message;
    }
}


function SetAdminTransferExportMessage(
    Message
) {
    const Element =
        document.getElementById(
            "AdminMassExportMessage"
        );

    if (Element !== null) {
        Element.textContent = Message;
    }
}


function DownloadAdminTransferZip(
    FileName,
    Files
) {
    const Encoder =
        new TextEncoder();

    const LocalParts = [];
    const CentralParts = [];
    let Offset = 0;

    const Now = new Date();
    const DosTime =
        (
            Now.getHours() << 11
        ) |
        (
            Now.getMinutes() << 5
        ) |
        Math.floor(
            Now.getSeconds() / 2
        );

    const DosDate =
        (
            Math.max(
                0,
                Now.getFullYear() - 1980
            ) << 9
        ) |
        (
            (Now.getMonth() + 1) << 5
        ) |
        Now.getDate();

    for (const File of Files) {
        const NameBytes =
            Encoder.encode(
                File.Name
            );

        const DataBytes =
            Encoder.encode(
                File.Text
            );

        const Crc =
            GetAdminTransferCrc32(
                DataBytes
            );

        const LocalHeader =
            new Uint8Array(
                30 + NameBytes.length
            );

        const LocalView =
            new DataView(
                LocalHeader.buffer
            );

        LocalView.setUint32(
            0,
            0x04034b50,
            true
        );
        LocalView.setUint16(
            4,
            20,
            true
        );
        LocalView.setUint16(
            6,
            0x0800,
            true
        );
        LocalView.setUint16(
            8,
            0,
            true
        );
        LocalView.setUint16(
            10,
            DosTime,
            true
        );
        LocalView.setUint16(
            12,
            DosDate,
            true
        );
        LocalView.setUint32(
            14,
            Crc,
            true
        );
        LocalView.setUint32(
            18,
            DataBytes.length,
            true
        );
        LocalView.setUint32(
            22,
            DataBytes.length,
            true
        );
        LocalView.setUint16(
            26,
            NameBytes.length,
            true
        );
        LocalHeader.set(
            NameBytes,
            30
        );

        LocalParts.push(
            LocalHeader,
            DataBytes
        );

        const CentralHeader =
            new Uint8Array(
                46 + NameBytes.length
            );

        const CentralView =
            new DataView(
                CentralHeader.buffer
            );

        CentralView.setUint32(
            0,
            0x02014b50,
            true
        );
        CentralView.setUint16(
            4,
            20,
            true
        );
        CentralView.setUint16(
            6,
            20,
            true
        );
        CentralView.setUint16(
            8,
            0x0800,
            true
        );
        CentralView.setUint16(
            10,
            0,
            true
        );
        CentralView.setUint16(
            12,
            DosTime,
            true
        );
        CentralView.setUint16(
            14,
            DosDate,
            true
        );
        CentralView.setUint32(
            16,
            Crc,
            true
        );
        CentralView.setUint32(
            20,
            DataBytes.length,
            true
        );
        CentralView.setUint32(
            24,
            DataBytes.length,
            true
        );
        CentralView.setUint16(
            28,
            NameBytes.length,
            true
        );
        CentralView.setUint32(
            42,
            Offset,
            true
        );
        CentralHeader.set(
            NameBytes,
            46
        );

        CentralParts.push(
            CentralHeader
        );

        Offset +=
            LocalHeader.length +
            DataBytes.length;
    }

    const CentralOffset = Offset;
    const CentralSize =
        CentralParts.reduce(
            (Total, Part) =>
                Total + Part.length,
            0
        );

    const End =
        new Uint8Array(22);

    const EndView =
        new DataView(
            End.buffer
        );

    EndView.setUint32(
        0,
        0x06054b50,
        true
    );
    EndView.setUint16(
        8,
        Files.length,
        true
    );
    EndView.setUint16(
        10,
        Files.length,
        true
    );
    EndView.setUint32(
        12,
        CentralSize,
        true
    );
    EndView.setUint32(
        16,
        CentralOffset,
        true
    );

    const BlobData =
        new Blob(
            [
                ...LocalParts,
                ...CentralParts,
                End
            ],
            {
                type: "application/zip"
            }
        );

    const Url =
        URL.createObjectURL(
            BlobData
        );

    const Link =
        document.createElement(
            "a"
        );

    Link.href = Url;
    Link.download = FileName;
    Link.click();

    URL.revokeObjectURL(Url);
}


function GetAdminTransferCrc32(
    Data
) {
    let Crc = 0xffffffff;

    for (const Byte of Data) {
        Crc ^= Byte;

        for (
            let Bit = 0;
            Bit < 8;
            Bit++
        ) {
            Crc =
                (
                    Crc >>> 1
                ) ^
                (
                    -(Crc & 1) &
                    0xedb88320
                );
        }
    }

    return (
        Crc ^ 0xffffffff
    ) >>> 0;
}


document.addEventListener(
    "DOMContentLoaded",
    StartAdminContentTransfer
);
