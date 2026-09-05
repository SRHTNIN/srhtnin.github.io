let PlantEncyclopediaSave;
let PlantEncyclopediaSearchQuery = "";
let PlantEncyclopediaSortMode = "IdAsc";


async function StartPlantEncyclopedia() {
    try {
        await LoadGameContent();
        PlantEncyclopediaSave =
            await LoadGame();

        BindPlantEncyclopediaControls();
        RenderPlantEncyclopedia();
    } catch (Error) {
        console.error(
            "Couldn't load Plant encyclopedia:",
            Error
        );

        SetPlantEncyclopediaMessage(
            "Couldn't load your discovered plants."
        );
    }
}


function BindPlantEncyclopediaControls() {
    const SearchInput =
        document.getElementById(
            "PlantEncyclopediaSearchInput"
        );

    const SortSelect =
        document.getElementById(
            "PlantEncyclopediaSortSelect"
        );


    if (SearchInput !== null) {
        SearchInput.value =
            PlantEncyclopediaSearchQuery;

        SearchInput.addEventListener(
            "input",
            () => {
                PlantEncyclopediaSearchQuery =
                    SearchInput.value;

                RenderPlantEncyclopedia();
            }
        );
    }


    if (SortSelect !== null) {
        SortSelect.value =
            PlantEncyclopediaSortMode;

        SortSelect.addEventListener(
            "change",
            () => {
                PlantEncyclopediaSortMode =
                    SortSelect.value;

                RenderPlantEncyclopedia();
            }
        );
    }
}


function RenderPlantEncyclopedia() {
    const List =
        document.getElementById(
            "PlantEncyclopediaList"
        );

    List.replaceChildren();


    const DiscoveredPlants =
        Object.values(Plants)
            .filter(
                Plant =>
                    HasDiscoveredPlant(
                        PlantEncyclopediaSave,
                        Plant.Id
                    )
            );

    const SearchQuery =
        PlantEncyclopediaSearchQuery
            .trim()
            .toLocaleLowerCase();

    const VisiblePlants =
        DiscoveredPlants
            .filter(
                Plant =>
                    DoesPlantEncyclopediaMatchSearch(
                        Plant,
                        SearchQuery
                    )
            )
            .sort(
                ComparePlantEncyclopediaPlants
            );


    if (DiscoveredPlants.length === 0) {
        SetPlantEncyclopediaMessage(
            "No plants discovered yet."
        );

        return;
    }


    if (VisiblePlants.length === 0) {
        SetPlantEncyclopediaMessage(
            "No discovered plants match your search."
        );

        return;
    }


    for (
        const Plant
        of VisiblePlants
    ) {
        List.appendChild(
            CreatePlantEncyclopediaCard(
                Plant
            )
        );
    }


    if (SearchQuery.length > 0) {
        SetPlantEncyclopediaMessage(
            "Showing " +
            VisiblePlants.length
                .toLocaleString() +
            " of " +
            DiscoveredPlants.length
                .toLocaleString() +
            " discovered plants."
        );

        return;
    }


    SetPlantEncyclopediaMessage(
        DiscoveredPlants.length === 1
            ? "1 plant discovered."
            : DiscoveredPlants.length
                .toLocaleString() +
                " plants discovered."
    );
}


function DoesPlantEncyclopediaMatchSearch(
    Plant,
    SearchQuery
) {
    if (SearchQuery.length === 0) {
        return true;
    }

    const SearchParts = [
        Plant.Id,
        Plant.Name,
        Plant.Description,
        ...(Array.isArray(Plant.Tags)
            ? Plant.Tags
            : [])
    ];

    for (
        const Mutation
        of GetPlantRelatedMutations(
            Plant.Id,
            "PlantsCreated"
        ).concat(
            GetPlantRelatedMutations(
                Plant.Id,
                "PlantsUsed"
            )
        )
    ) {
        if (
            HasDiscoveredMutation(
                PlantEncyclopediaSave,
                Mutation.Id
            )
        ) {
            SearchParts.push(
                Mutation.Name
            );
        }
    }

    return SearchParts
        .filter(
            Value =>
                Value !== null &&
                Value !== undefined
        )
        .join(" ")
        .toLocaleLowerCase()
        .includes(
            SearchQuery
        );
}


function ComparePlantEncyclopediaPlants(
    A,
    B
) {
    switch (PlantEncyclopediaSortMode) {
        case "NameAsc":
            return String(A.Name ?? "")
                .localeCompare(
                    String(B.Name ?? ""),
                    undefined,
                    {sensitivity: "base"}
                ) || A.Id - B.Id;

        case "GrowthAsc":
            return ComparePlantEncyclopediaNumbers(
                A.GrowthTime,
                B.GrowthTime,
                1
            ) || A.Id - B.Id;

        case "GrowthDesc":
            return ComparePlantEncyclopediaNumbers(
                A.GrowthTime,
                B.GrowthTime,
                -1
            ) || A.Id - B.Id;

        case "CostAsc":
            return ComparePlantEncyclopediaNumbers(
                GetPlantShopCost(
                    PlantEncyclopediaSave,
                    A.Id
                ),
                GetPlantShopCost(
                    PlantEncyclopediaSave,
                    B.Id
                ),
                1
            ) || A.Id - B.Id;

        case "CostDesc":
            return ComparePlantEncyclopediaNumbers(
                GetPlantShopCost(
                    PlantEncyclopediaSave,
                    A.Id
                ),
                GetPlantShopCost(
                    PlantEncyclopediaSave,
                    B.Id
                ),
                -1
            ) || A.Id - B.Id;

        case "RewardAsc":
            return ComparePlantEncyclopediaNumbers(
                GetPlantHarvestReward(
                    PlantEncyclopediaSave,
                    A.Id
                ),
                GetPlantHarvestReward(
                    PlantEncyclopediaSave,
                    B.Id
                ),
                1
            ) || A.Id - B.Id;

        case "RewardDesc":
            return ComparePlantEncyclopediaNumbers(
                GetPlantHarvestReward(
                    PlantEncyclopediaSave,
                    A.Id
                ),
                GetPlantHarvestReward(
                    PlantEncyclopediaSave,
                    B.Id
                ),
                -1
            ) || A.Id - B.Id;

        case "DphAsc":
            return ComparePlantEncyclopediaNumbers(
                GetPlantDewPerHour(
                    PlantEncyclopediaSave,
                    A.Id
                ),
                GetPlantDewPerHour(
                    PlantEncyclopediaSave,
                    B.Id
                ),
                1
            ) || A.Id - B.Id;

        case "DphDesc":
            return ComparePlantEncyclopediaNumbers(
                GetPlantDewPerHour(
                    PlantEncyclopediaSave,
                    A.Id
                ),
                GetPlantDewPerHour(
                    PlantEncyclopediaSave,
                    B.Id
                ),
                -1
            ) || A.Id - B.Id;

        case "IdAsc":
        default:
            return A.Id - B.Id;
    }
}


function ComparePlantEncyclopediaNumbers(
    A,
    B,
    Direction
) {
    const MissingA =
        A === null ||
        A === undefined ||
        A === "";

    const MissingB =
        B === null ||
        B === undefined ||
        B === "";

    const NumberA = Number(A);
    const NumberB = Number(B);

    const ValidA =
        !MissingA &&
        Number.isFinite(NumberA);

    const ValidB =
        !MissingB &&
        Number.isFinite(NumberB);

    if (!ValidA && !ValidB) {
        return 0;
    }

    if (!ValidA) {
        return 1;
    }

    if (!ValidB) {
        return -1;
    }

    return (NumberA - NumberB) *
        Direction;
}


function CreatePlantEncyclopediaCard(
    Plant
) {
    const Card =
        document.createElement(
            "article"
        );

    Card.className =
        "Panel PlantEncyclopediaCard";

    Card.id =
        "Plant-" + Plant.Id;


    const Header =
        document.createElement(
            "header"
        );

    Header.className =
        "PanelHeader PlantEncyclopediaHeader";


    const Number =
        document.createElement(
            "span"
        );

    Number.className =
        "PlantEncyclopediaNumber";

    Number.textContent =
        String(
            Plant.Id
        ).padStart(
            3,
            "0"
        );


    const Name =
        document.createElement(
            "h2"
        );

    Name.textContent =
        Plant.Name;


    Header.append(
        Number,
        Name
    );


    const Body =
        document.createElement(
            "div"
        );

    Body.className =
        "PlantEncyclopediaBody";


    Body.append(
        CreatePlantEncyclopediaVisual(
            Plant
        ),
        CreatePlantEncyclopediaDetails(
            Plant
        ),
        CreatePlantEncyclopediaRelations(
            Plant
        )
    );


    Card.append(
        Header,
        Body
    );


    return Card;
}


function CreatePlantEncyclopediaVisual(
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
            Plant
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

        Visual.appendChild(
            Missing
        );

        return Visual;
    }


    const Image =
        document.createElement(
            "img"
        );

    Image.className =
        "PlantSprite";

    Image.src =
        MatureImage;

    Image.alt =
        Plant.Name;


    Visual.appendChild(
        Image
    );


    return Visual;
}


function CreatePlantEncyclopediaDetails(
    Plant
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


    Details.appendChild(
        Description
    );


    const Tags =
        Array.isArray(
            Plant.Tags
        )
            ? Plant.Tags
            : [];

    Details.appendChild(
        CreatePlantEncyclopediaStat(
            "Tags",
            Tags.length === 0
                ? "None"
                : Tags.join(", ")
        )
    );


    Details.appendChild(
        CreatePlantEncyclopediaStat(
            "Growth",
            FormatPlantEncyclopediaTime(
                Plant.GrowthTime
            )
        )
    );


    const Cost =
        GetPlantShopCost(
            PlantEncyclopediaSave,
            Plant.Id
        );

    const Reward =
        GetPlantHarvestReward(
            PlantEncyclopediaSave,
            Plant.Id
        );

    const DewPerHour =
        GetPlantDewPerHour(
            PlantEncyclopediaSave,
            Plant.Id
        );

    Details.appendChild(
        CreatePlantEncyclopediaStat(
            "Cost",
            Cost === null
                ? "Unavailable"
                : Cost.toLocaleString() +
                    " Dew"
        )
    );

    Details.appendChild(
        CreatePlantEncyclopediaStat(
            "Reward",
            Reward === null
                ? "Unavailable"
                : Reward.toLocaleString() +
                    " Dew"
        )
    );

    Details.appendChild(
        CreatePlantEncyclopediaStat(
            "Dew / hour",
            FormatDewPerHour(
                DewPerHour
            )
        )
    );


    const RecipeProgress =
        GetPlantRecipeProgress(
            Plant.Id
        );

    Details.appendChild(
        CreatePlantEncyclopediaStat(
            "Found recipes",
            RecipeProgress.Found
                .toLocaleString() +
                "/" +
                RecipeProgress.Total
                    .toLocaleString()
        )
    );


    return Details;
}


function CreatePlantEncyclopediaStat(
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

    NameElement.textContent =
        Name;


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


function CreatePlantEncyclopediaRelations(
    Plant
) {
    const Relations =
        document.createElement(
            "div"
        );

    Relations.className =
        "PlantEncyclopediaRelations";


    Relations.append(
        CreatePlantMutationRelationGroup(
            "Created by",
            GetPlantRelatedMutations(
                Plant.Id,
                "PlantsCreated"
            )
        ),
        CreatePlantMutationRelationGroup(
            "Used in",
            GetPlantRelatedMutations(
                Plant.Id,
                "PlantsUsed"
            )
        )
    );


    return Relations;
}


function CreatePlantMutationRelationGroup(
    Heading,
    Mutations
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

    Title.textContent =
        Heading;


    const List =
        document.createElement(
            "ul"
        );

    List.className =
        "PlantEncyclopediaRelationList";


    if (Mutations.length === 0) {
        const Empty =
            document.createElement(
                "li"
            );

        Empty.className =
            "PlantEncyclopediaRelationEmpty";

        Empty.textContent =
            "None";

        List.appendChild(
            Empty
        );
    } else {
        for (
            const Mutation
            of Mutations
        ) {
            List.appendChild(
                CreatePlantMutationRelation(
                    Mutation
                )
            );
        }
    }


    Group.append(
        Title,
        List
    );


    return Group;
}


function CreatePlantMutationRelation(
    Mutation
) {
    const Item =
        document.createElement(
            "li"
        );


    if (
        !HasDiscoveredMutation(
            PlantEncyclopediaSave,
            Mutation.Id
        )
    ) {
        Item.className =
            "PlantEncyclopediaRelationUnknown";

        Item.textContent =
            "????????";

        return Item;
    }


    const Link =
        document.createElement(
            "a"
        );

    Link.href =
        "/Pages/Mutations.html#Mutation-" +
        Mutation.Id;

    Link.textContent =
        Mutation.Name;


    Item.appendChild(
        Link
    );


    return Item;
}


function GetPlantRelatedMutations(
    PlantId,
    RelationName
) {
    return Object.values(
        MutationSets
    )
        .filter(
            Mutation =>
                Mutation.Relations?.[
                    RelationName
                ]?.includes(
                    Number(PlantId)
                )
        )
        .sort(
            (A, B) =>
                A.Id - B.Id
        );
}


function GetPlantRecipeProgress(
    PlantId
) {
    const RelatedMutationIds =
        new Set();


    for (
        const Mutation
        of Object.values(
            MutationSets
        )
    ) {
        const Relations =
            Mutation.Relations ?? {};

        const IsRelated =
            Relations.PlantsCreated
                ?.includes(
                    Number(PlantId)
                ) ||
            Relations.PlantsUsed
                ?.includes(
                    Number(PlantId)
                );

        if (IsRelated) {
            RelatedMutationIds.add(
                Mutation.Id
            );
        }
    }


    let Found = 0;

    for (
        const MutationId
        of RelatedMutationIds
    ) {
        if (
            HasDiscoveredMutation(
                PlantEncyclopediaSave,
                MutationId
            )
        ) {
            Found++;
        }
    }


    return {
        Found: Found,
        Total: RelatedMutationIds.size
    };
}


function FormatPlantEncyclopediaTime(
    Milliseconds
) {
    const TotalMinutes =
        Math.max(
            1,
            Math.ceil(
                Number(
                    Milliseconds
                ) /
                60000
            )
        );

    const Hours =
        Math.floor(
            TotalMinutes /
            60
        );

    const Minutes =
        TotalMinutes %
        60;


    if (
        Hours > 0 &&
        Minutes > 0
    ) {
        return (
            Hours +
            "h " +
            Minutes +
            "m"
        );
    }

    if (Hours > 0) {
        return Hours + "h";
    }

    return Minutes + "m";
}


function SetPlantEncyclopediaMessage(
    Message
) {
    const Element =
        document.getElementById(
            "PlantEncyclopediaMessage"
        );

    if (Element !== null) {
        Element.textContent =
            Message;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartPlantEncyclopedia
);
