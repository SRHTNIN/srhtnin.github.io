let AdminOverviewPlants = {};
let AdminOverviewMutations = {};


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


function CreateAdminOverviewIssueList(
    Items,
    NestedValues = null
) {
    const List =
        document.createElement("ul");

    List.className =
        "AdminOverviewList";

    for (const Item of Items) {
        const ListItem =
            document.createElement("li");

        const Label =
            document.createElement("span");

        Label.textContent = Item.Label;
        ListItem.appendChild(Label);

        const Nested =
            NestedValues?.(Item) ?? [];

        if (Nested.length > 0) {
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

            ListItem.appendChild(
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
    NestedValues = null
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
            NestedValues
        )
    );
}


function RenderAdminOverview() {
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
    const NoWaysToObtain = [];

    for (
        const [PlantKey, Plant]
        of PlantEntries
    ) {
        const Missing =
            GetAdminOverviewMissingSprites(
                PlantKey,
                Plant
            );

        if (Missing.length > 0) {
            MissingSprites.push({
                Label:
                    Plant.Name ?? PlantKey,
                Missing: Missing
            });
        }

        if (
            Plant.Shop?.ShopPlant !== true &&
            !CreatedPlants.has(PlantKey)
        ) {
            NoWaysToObtain.push({
                Label:
                    Plant.Name ?? PlantKey
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
    }

    RenderAdminOverviewSection(
        "AdminOverviewMissingSprites",
        "Missing sprites",
        MissingSprites,
        Item => Item.Missing
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
