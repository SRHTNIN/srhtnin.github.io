let PlantEncyclopediaSave;


async function StartPlantEncyclopedia() {
    try {
        await LoadGameContent();
        PlantEncyclopediaSave =
            await LoadGame();

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
            )
            .sort(
                (A, B) =>
                    A.Id - B.Id
            );


    if (
        DiscoveredPlants.length === 0
    ) {
        SetPlantEncyclopediaMessage(
            "No plants discovered yet."
        );

        return;
    }


    for (
        const Plant
        of DiscoveredPlants
    ) {
        List.appendChild(
            CreatePlantEncyclopediaCard(
                Plant
            )
        );
    }


    SetPlantEncyclopediaMessage(
        DiscoveredPlants.length === 1
            ? "1 plant discovered."
            : DiscoveredPlants.length
                .toLocaleString() +
                " plants discovered."
    );
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
        "PlantEncyclopediaHeader";


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


    const PlantKey =
        GetPlantKeyById(
            Plant.Id
        );

    const Images =
        PlantKey === null
            ? []
            : PlantImages[
                PlantKey
            ] ?? [];


    if (Images.length === 0) {
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
        Images[
            Images.length - 1
        ];

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


    const Reward =
        GetPlantHarvestReward(
            PlantEncyclopediaSave,
            Plant.Id
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
