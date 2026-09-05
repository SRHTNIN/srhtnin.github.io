let AdminOverviewPlants = {};
let AdminOverviewMutations = {};
let AdminOverviewToggleNumber = 0;


async function AdminOverviewRequest(
    Endpoint,
    Action = "List"
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
                Action: Action
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
            "Admin overview request failed."
        );
    }

    return Result;
}


function GetAdminOverviewPlantKeyById(
    PlantId
) {
    return Object.entries(
        AdminOverviewPlants
    ).find(
        ([, Plant]) =>
            Number(Plant.Id) ===
            Number(PlantId)
    )?.[0] ?? null;
}


function GetAdminOverviewMissingSprites(
    PlantKey,
    Plant
) {
    const StaticImages =
        Array.isArray(
            PlantImages?.[PlantKey]
        )
            ? PlantImages[PlantKey]
            : [];

    const ApiStages =
        new Set(
            (
                Array.isArray(
                    Plant.ImageStages
                )
                    ? Plant.ImageStages
                    : []
            )
                .map(
                    Stage =>
                        Number(
                            Stage?.Stage ??
                            Stage
                        )
                )
                .filter(
                    Stage =>
                        Number.isInteger(Stage) &&
                        Stage > 0
                )
        );

    const HighestApiStage =
        Math.max(
            0,
            ...ApiStages
        );

    const HighestStage =
        Math.max(
            3,
            StaticImages.length,
            HighestApiStage
        );

    const Missing = [];

    for (
        let Stage = 1;
        Stage <= HighestStage;
        Stage++
    ) {
        if (
            ApiStages.has(Stage) ||
            typeof StaticImages[
                Stage - 1
            ] === "string"
        ) {
            continue;
        }

        Missing.push(
            Stage + ".png"
        );
    }

    return Missing;
}


function CollectAdminOverviewCreatedPlants() {
    const Created = new Set();

    function AddResultValue(Value) {
        if (typeof Value === "string") {
            if (
                Value !== "Keep" &&
                Value !== "Empty" &&
                !Value.startsWith("$") &&
                AdminOverviewPlants[
                    Value
                ] !== undefined
            ) {
                Created.add(Value);
            }

            return;
        }

        if (
            Value !== null &&
            typeof Value === "object" &&
            !Array.isArray(Value) &&
            typeof Value.Plant === "string"
        ) {
            AddResultValue(
                Value.Plant
            );
        }
    }

    for (
        const Mutation
        of Object.values(
            AdminOverviewMutations
        )
    ) {
        if (Mutation.Archived === true) {
            continue;
        }

        for (
            const PlantId
            of Mutation.Relations
                ?.PlantsCreated ?? []
        ) {
            const PlantKey =
                GetAdminOverviewPlantKeyById(
                    PlantId
                );

            if (PlantKey !== null) {
                Created.add(PlantKey);
            }
        }

        for (
            const Row
            of Mutation.Success ?? []
        ) {
            if (!Array.isArray(Row)) {
                continue;
            }

            for (const Cell of Row) {
                AddResultValue(Cell);
            }
        }
    }

    return Created;
}


function GetAdminOverviewPatternPlantKeys(
    Mutation
) {
    const PlantKeys = new Set();

    for (const Row of Mutation.Pattern ?? []) {
        if (!Array.isArray(Row)) {
            continue;
        }

        for (const Cell of Row) {
            if (
                typeof Cell === "string" &&
                AdminOverviewPlants[
                    Cell
                ] !== undefined
            ) {
                PlantKeys.add(Cell);
                continue;
            }

            if (
                Cell !== null &&
                typeof Cell === "object" &&
                !Array.isArray(Cell) &&
                typeof Cell.Plant === "string" &&
                AdminOverviewPlants[
                    Cell.Plant
                ] !== undefined
            ) {
                PlantKeys.add(
                    Cell.Plant
                );
            }
        }
    }

    return PlantKeys;
}


function GetAdminOverviewResultPlantKeys(
    Mutation
) {
    const PlantKeys = new Set();

    for (const Row of Mutation.Success ?? []) {
        if (!Array.isArray(Row)) {
            continue;
        }

        for (const Cell of Row) {
            let PlantKey = null;

            if (typeof Cell === "string") {
                PlantKey = Cell;
            } else if (
                Cell !== null &&
                typeof Cell === "object" &&
                !Array.isArray(Cell) &&
                typeof Cell.Plant === "string"
            ) {
                PlantKey = Cell.Plant;
            }

            if (
                PlantKey !== null &&
                !PlantKey.startsWith("$") &&
                AdminOverviewPlants[
                    PlantKey
                ] !== undefined
            ) {
                PlantKeys.add(PlantKey);
            }
        }
    }

    return PlantKeys;
}


function HasAdminOverviewMissingRelations(
    Mutation,
    RelationName,
    ExpectedPlantKeys
) {
    const RelationValues =
        Mutation.Relations?.[
            RelationName
        ];

    if (
        !Array.isArray(RelationValues) ||
        RelationValues.length === 0
    ) {
        return true;
    }

    const RelationIds =
        new Set(
            RelationValues.map(
                Value => Number(Value)
            )
        );

    for (const PlantKey of ExpectedPlantKeys) {
        const PlantId = Number(
            AdminOverviewPlants[
                PlantKey
            ]?.Id
        );

        if (
            Number.isInteger(PlantId) &&
            !RelationIds.has(PlantId)
        ) {
            return true;
        }
    }

    return false;
}


function HasAdminOverviewSuccessChange(
    Mutation
) {
    if (!Array.isArray(Mutation.Success)) {
        return true;
    }

    for (const Row of Mutation.Success) {
        if (!Array.isArray(Row)) {
            return true;
        }

        for (const Cell of Row) {
            if (
                Cell !== null &&
                Cell !== "Keep"
            ) {
                return true;
            }
        }
    }

    return false;
}


function CreateAdminOverviewNestedToggle(
    Label,
    NestedList
) {
    AdminOverviewToggleNumber++;

    const ContentId =
        "AdminOverviewNested" +
        AdminOverviewToggleNumber;

    NestedList.id = ContentId;
    NestedList.hidden = true;

    const Toggle =
        document.createElement("button");

    Toggle.className =
        "ShopSectionToggle";
    Toggle.type = "button";
    Toggle.setAttribute(
        "aria-expanded",
        "false"
    );
    Toggle.setAttribute(
        "aria-controls",
        ContentId
    );

    const Arrow =
        document.createElement("span");

    Arrow.className =
        "ShopSectionArrow";
    Arrow.setAttribute(
        "aria-hidden",
        "true"
    );
    Arrow.textContent = ">";

    const Text =
        document.createElement("span");

    Text.textContent = Label;

    Toggle.append(
        Arrow,
        Text
    );

    Toggle.addEventListener(
        "click",
        () => {
            const IsExpanded =
                Toggle.getAttribute(
                    "aria-expanded"
                ) === "true";

            Toggle.setAttribute(
                "aria-expanded",
                String(!IsExpanded)
            );

            NestedList.hidden =
                IsExpanded;
        }
    );

    return Toggle;
}


function CreateAdminOverviewIssueList(
    Items,
    NestedValues = null,
    CollapseNested = false
) {
    const List =
        document.createElement("ul");

    List.className =
        "AdminOverviewList";

    for (const Item of Items) {
        const ListItem =
            document.createElement("li");

        const Nested =
            NestedValues?.(Item) ?? [];

        if (Nested.length === 0) {
            const Label =
                document.createElement(
                    "span"
                );

            Label.textContent = Item.Label;
            ListItem.appendChild(Label);
            List.appendChild(ListItem);
            continue;
        }

        const NestedList =
            document.createElement("ul");

        for (const Value of Nested) {
            const NestedItem =
                document.createElement("li");

            NestedItem.textContent =
                Value;
            NestedList.appendChild(
                NestedItem
            );
        }

        if (CollapseNested) {
            ListItem.append(
                CreateAdminOverviewNestedToggle(
                    Item.Label,
                    NestedList
                ),
                NestedList
            );
        } else {
            const Label =
                document.createElement(
                    "span"
                );

            Label.textContent = Item.Label;
            ListItem.append(
                Label,
                NestedList
            );
        }

        List.appendChild(ListItem);
    }

    return List;
}


function RenderAdminOverviewSection(
    ContainerId,
    Title,
    Items,
    NestedValues = null,
    CollapseNested = false
) {
    const Container =
        document.getElementById(
            ContainerId
        );

    Container.replaceChildren();

    const Heading =
        document.createElement("h3");

    Heading.textContent = Title;
    Container.appendChild(Heading);

    if (Items.length === 0) {
        const Empty =
            document.createElement("p");

        Empty.className =
            "AdminOverviewEmpty";
        Empty.textContent = "None";
        Container.appendChild(Empty);
        return;
    }

    Container.appendChild(
        CreateAdminOverviewIssueList(
            Items,
            NestedValues,
            CollapseNested
        )
    );
}


function RenderAdminOverview() {
    AdminOverviewToggleNumber = 0;

    const CreatedPlants =
        CollectAdminOverviewCreatedPlants();

    const PlantEntries =
        Object.entries(
            AdminOverviewPlants
        )
            .filter(
                ([, Plant]) =>
                    Plant.Archived !== true
            )
            .sort(
                ([KeyA, PlantA], [KeyB, PlantB]) =>
                    Number(PlantA.Id) -
                        Number(PlantB.Id) ||
                    KeyA.localeCompare(KeyB)
            );

    const MissingSprites = [];
    const PlantNoDescription = [];
    const PlantNoTags = [];
    const NoWaysToObtain = [];

    for (
        const [PlantKey, Plant]
        of PlantEntries
    ) {
        const Label =
            Plant.Name?.trim() ||
            PlantKey;

        const Missing =
            GetAdminOverviewMissingSprites(
                PlantKey,
                Plant
            );

        if (Missing.length > 0) {
            MissingSprites.push({
                Label: Label,
                Missing: Missing
            });
        }

        if (
            typeof Plant.Description !==
                "string" ||
            Plant.Description.trim() === ""
        ) {
            PlantNoDescription.push({
                Label: Label
            });
        }

        if (
            !Array.isArray(Plant.Tags) ||
            Plant.Tags.length === 0
        ) {
            PlantNoTags.push({
                Label: Label
            });
        }

        if (
            Plant.Shop?.ShopPlant !== true &&
            !CreatedPlants.has(PlantKey)
        ) {
            NoWaysToObtain.push({
                Label: Label
            });
        }
    }

    const MutationEntries =
        Object.entries(
            AdminOverviewMutations
        )
            .filter(
                ([, Mutation]) =>
                    Mutation.Archived !== true
            )
            .sort(
                ([KeyA, MutationA], [KeyB, MutationB]) =>
                    Number(MutationA.Id) -
                        Number(MutationB.Id) ||
                    KeyA.localeCompare(KeyB)
            );

    const NoDescription = [];
    const NoHint = [];
    const MissingParents = [];
    const MissingChildren = [];
    const NoChance = [];
    const NoSuccessChange = [];

    for (
        const [MutationKey, Mutation]
        of MutationEntries
    ) {
        const Label =
            Mutation.Name?.trim() ||
            MutationKey;

        if (
            typeof Mutation.Description !==
                "string" ||
            Mutation.Description.trim() === ""
        ) {
            NoDescription.push({
                Label: Label
            });
        }

        if (
            typeof Mutation.Hint !==
                "string" ||
            Mutation.Hint.trim() === ""
        ) {
            NoHint.push({
                Label: Label
            });
        }

        if (
            HasAdminOverviewMissingRelations(
                Mutation,
                "PlantsUsed",
                GetAdminOverviewPatternPlantKeys(
                    Mutation
                )
            )
        ) {
            MissingParents.push({
                Label: Label
            });
        }

        if (
            HasAdminOverviewMissingRelations(
                Mutation,
                "PlantsCreated",
                GetAdminOverviewResultPlantKeys(
                    Mutation
                )
            )
        ) {
            MissingChildren.push({
                Label: Label
            });
        }

        if (Number(Mutation.Chance) === 0) {
            NoChance.push({
                Label: Label
            });
        }

        if (
            !HasAdminOverviewSuccessChange(
                Mutation
            )
        ) {
            NoSuccessChange.push({
                Label: Label
            });
        }
    }

    RenderAdminOverviewSection(
        "AdminOverviewMissingSprites",
        "Missing sprites",
        MissingSprites,
        Item => Item.Missing,
        true
    );

    RenderAdminOverviewSection(
        "AdminOverviewPlantNoDescription",
        "No description",
        PlantNoDescription
    );

    RenderAdminOverviewSection(
        "AdminOverviewPlantNoTags",
        "No tags",
        PlantNoTags
    );

    RenderAdminOverviewSection(
        "AdminOverviewNoObtain",
        "No ways to obtain",
        NoWaysToObtain
    );

    RenderAdminOverviewSection(
        "AdminOverviewNoDescription",
        "No description",
        NoDescription
    );

    RenderAdminOverviewSection(
        "AdminOverviewNoHint",
        "No hint",
        NoHint
    );

    RenderAdminOverviewSection(
        "AdminOverviewMissingParents",
        "Missing parents",
        MissingParents
    );

    RenderAdminOverviewSection(
        "AdminOverviewMissingChildren",
        "Missing children",
        MissingChildren
    );

    RenderAdminOverviewSection(
        "AdminOverviewNoChance",
        "No chance",
        NoChance
    );

    RenderAdminOverviewSection(
        "AdminOverviewNoSuccessChange",
        "No success change",
        NoSuccessChange
    );
}


async function StartAdminOverview() {
    const Overview =
        document.getElementById(
            "AdminOverview"
        );

    if (Overview === null) {
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

        const [
            PlantResult,
            MutationResult
        ] = await Promise.all([
            AdminOverviewRequest(
                "AdminPlants.php"
            ),
            AdminOverviewRequest(
                "AdminMutations.php"
            )
        ]);

        AdminOverviewPlants =
            PlantResult.Plants ?? {};
        AdminOverviewMutations =
            MutationResult.Mutations ?? {};

        RenderAdminOverview();
        Overview.hidden = false;
    } catch (Error) {
        console.error(
            "Couldn't load admin overview:",
            Error
        );

        const Message =
            document.getElementById(
                "AdminOverviewMessage"
            );

        Message.textContent =
            Error.message ??
            "Couldn't load admin overview.";
        Overview.hidden = false;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartAdminOverview
);
