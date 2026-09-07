let MutationEncyclopediaSave;
let MutationEncyclopediaSearchQuery = "";
let MutationEncyclopediaSortMode = "IdAsc";


async function StartMutationEncyclopedia() {
    try {
        await LoadGameContent();

        MutationEncyclopediaSave =
            await LoadGame();

        BindMutationEncyclopediaControls();
        RenderMutationEncyclopedia();
    } catch (Error) {
        console.error(
            "Couldn't load Mutation encyclopedia:",
            Error
        );

        SetMutationEncyclopediaMessage(
            "Couldn't load your discovered mutations."
        );
    }
}


function BindMutationEncyclopediaControls() {
    const SearchInput =
        document.getElementById(
            "MutationEncyclopediaSearchInput"
        );

    const SortSelect =
        document.getElementById(
            "MutationEncyclopediaSortSelect"
        );


    if (SearchInput !== null) {
        SearchInput.value =
            MutationEncyclopediaSearchQuery;

        SearchInput.addEventListener(
            "input",
            () => {
                MutationEncyclopediaSearchQuery =
                    SearchInput.value;

                RenderMutationEncyclopedia();
            }
        );
    }


    if (SortSelect !== null) {
        SortSelect.value =
            MutationEncyclopediaSortMode;

        SortSelect.addEventListener(
            "change",
            () => {
                MutationEncyclopediaSortMode =
                    SortSelect.value;

                RenderMutationEncyclopedia();
            }
        );
    }
}


function RenderMutationEncyclopedia() {
    const List =
        document.getElementById(
            "MutationEncyclopediaList"
        );

    List.replaceChildren();


    const AllMutations =
        Object.values(
            MutationSets
        )
            .sort(
                (A, B) =>
                    A.Id - B.Id
            );

    const DiscoveredMutations =
        AllMutations.filter(
            Mutation =>
                HasDiscoveredMutation(
                    MutationEncyclopediaSave,
                    Mutation.Id
                )
        );

    const AvailableHints =
        HasMutationHintsUpgrade(
            MutationEncyclopediaSave
        )
            ? AllMutations.filter(
                Mutation =>
                    !HasDiscoveredMutation(
                        MutationEncyclopediaSave,
                        Mutation.Id
                    ) &&
                    HasUsableMutationHint(
                        Mutation
                    ) &&
                    CanAttemptHintedMutation(
                        Mutation,
                        MutationEncyclopediaSave
                    )
            )
            : [];

    const HintLimit =
        GetMutationHintsDisplayLimit(
            MutationEncyclopediaSave
        );

    const DisplayedHints =
        AvailableHints.slice(
            0,
            HintLimit
        );

    const SearchQuery =
        MutationEncyclopediaSearchQuery
            .trim()
            .toLocaleLowerCase();

    const VisibleHints =
        DisplayedHints.filter(
            Mutation =>
                DoesMutationHintMatchSearch(
                    Mutation,
                    SearchQuery
                )
        );

    const VisibleMutations =
        DiscoveredMutations
            .filter(
                Mutation =>
                    DoesMutationEncyclopediaMatchSearch(
                        Mutation,
                        SearchQuery
                    )
            )
            .sort(
                CompareMutationEncyclopediaMutations
            );


    if (VisibleHints.length > 0) {
        List.appendChild(
            CreateMutationHintCard(
                VisibleHints.map(
                    Mutation =>
                        Mutation.Hint
                ),
                GetMutationHintsLevel(
                    MutationEncyclopediaSave
                )
            )
        );
    }


    for (
        const Mutation
        of VisibleMutations
    ) {
        List.appendChild(
            CreateMutationEncyclopediaCard(
                Mutation
            )
        );
    }


    if (
        DiscoveredMutations.length === 0 &&
        AvailableHints.length === 0
    ) {
        SetMutationEncyclopediaMessage(
            "No mutations discovered yet."
        );

        return;
    }


    if (
        VisibleMutations.length === 0 &&
        VisibleHints.length === 0
    ) {
        SetMutationEncyclopediaMessage(
            "No mutations or hints match your search."
        );

        return;
    }


    const MessageParts = [];

    if (SearchQuery.length > 0) {
        MessageParts.push(
            "Showing " +
            VisibleMutations.length
                .toLocaleString() +
            " of " +
            DiscoveredMutations.length
                .toLocaleString() +
            " discovered mutations."
        );
    } else {
        MessageParts.push(
            DiscoveredMutations.length === 1
                ? "1 mutation discovered."
                : DiscoveredMutations.length
                    .toLocaleString() +
                    " mutations discovered."
        );
    }

    if (AvailableHints.length > 0) {
        MessageParts.push(
            "Showing " +
            VisibleHints.length
                .toLocaleString() +
            " of " +
            AvailableHints.length
                .toLocaleString() +
            (AvailableHints.length === 1
                ? " available hint."
                : " available hints.")
        );
    }

    SetMutationEncyclopediaMessage(
        MessageParts.join(
            " "
        )
    );
}


function DoesMutationHintMatchSearch(
    Mutation,
    SearchQuery
) {
    if (SearchQuery.length === 0) {
        return true;
    }

    return String(
        Mutation.Hint ?? ""
    )
        .toLocaleLowerCase()
        .includes(
            SearchQuery
        );
}


function DoesMutationEncyclopediaMatchSearch(
    Mutation,
    SearchQuery
) {
    if (SearchQuery.length === 0) {
        return true;
    }

    const SearchParts = [
        Mutation.Id,
        Mutation.Name,
        Mutation.Description,
        Mutation.Hint,
        FormatMutationChance(
            Mutation.Chance
        ),
        FormatMutationEncyclopediaTime(
            Mutation.Cooldown
        ),
        Mutation.Rotation
    ];

    const RelationPlantIds = [
        ...(Mutation.Relations
            ?.PlantsUsed ?? []),
        ...(Mutation.Relations
            ?.PlantsCreated ?? [])
    ];

    for (
        const PlantId
        of RelationPlantIds
    ) {
        if (
            !HasDiscoveredPlant(
                MutationEncyclopediaSave,
                PlantId
            )
        ) {
            continue;
        }

        const Plant =
            GetPlantById(
                PlantId
            );

        if (Plant !== null) {
            SearchParts.push(
                Plant.Name
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


function CompareMutationEncyclopediaMutations(
    A,
    B
) {
    switch (MutationEncyclopediaSortMode) {
        case "NameAsc":
            return String(A.Name ?? "")
                .localeCompare(
                    String(B.Name ?? ""),
                    undefined,
                    {sensitivity: "base"}
                ) || A.Id - B.Id;

        case "ChanceAsc":
            return CompareMutationEncyclopediaNumbers(
                A.Chance,
                B.Chance,
                1
            ) || A.Id - B.Id;

        case "ChanceDesc":
            return CompareMutationEncyclopediaNumbers(
                A.Chance,
                B.Chance,
                -1
            ) || A.Id - B.Id;

        case "CooldownAsc":
            return CompareMutationEncyclopediaNumbers(
                A.Cooldown,
                B.Cooldown,
                1
            ) || A.Id - B.Id;

        case "CooldownDesc":
            return CompareMutationEncyclopediaNumbers(
                A.Cooldown,
                B.Cooldown,
                -1
            ) || A.Id - B.Id;

        case "IdAsc":
        default:
            return A.Id - B.Id;
    }
}


function CompareMutationEncyclopediaNumbers(
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


function HasUsableMutationHint(
    Mutation
) {
    return (
        typeof Mutation.Hint ===
            "string" &&
        Mutation.Hint.trim().length > 0
    );
}


function CanAttemptHintedMutation(
    Mutation,
    SaveData
) {
    if (
        !CanMutationPatternFitGarden(
            Mutation,
            SaveData
        )
    ) {
        return false;
    }


    if (!Array.isArray(Mutation.Pattern)) {
        return false;
    }


    const ListReferenceCounts = {};

    for (const Row of Mutation.Pattern) {
        if (!Array.isArray(Row)) {
            return false;
        }

        for (const Matcher of Row) {
            const ListNumber =
                GetMutationDisplayListReference(
                    Matcher
                );

            if (ListNumber !== null) {
                ListReferenceCounts[
                    ListNumber
                ] =
                    (ListReferenceCounts[
                        ListNumber
                    ] ?? 0) + 1;

                continue;
            }

            if (
                !IsHintMatcherAvailable(
                    Matcher,
                    SaveData
                )
            ) {
                return false;
            }
        }
    }

    for (
        const [ListNumberText, Count]
        of Object.entries(
            ListReferenceCounts
        )
    ) {
        const List =
            Mutation.Lists?.[
                Number(ListNumberText) - 1
            ];

        if (
            List === undefined ||
            !Array.isArray(List.Items)
        ) {
            return false;
        }

        const AvailableItems =
            List.Items.filter(
                Item =>
                    IsHintListItemAvailable(
                        Item,
                        SaveData
                    )
            ).length;

        if (
            AvailableItems === 0 ||
            (
                List.Mode === "Once" &&
                AvailableItems < Count
            )
        ) {
            return false;
        }
    }

    return true;
}


function IsHintListItemAvailable(
    Item,
    SaveData
) {
    if (
        Item?.Type === "Any" ||
        Item?.Type === "Empty"
    ) {
        return true;
    }

    if (Item?.Type === "Plant") {
        const Plant =
            Plants[Item.Value];

        return (
            Plant !== undefined &&
            HasDiscoveredPlant(
                SaveData,
                Plant.Id
            )
        );
    }

    if (Item?.Type === "Tag") {
        return Object.values(
            Plants
        ).some(
            Plant =>
                HasDiscoveredPlant(
                    SaveData,
                    Plant.Id
                ) &&
                Array.isArray(Plant.Tags) &&
                Plant.Tags.includes(
                    Item.Value
                )
        );
    }

    return false;
}


function GetMutationDisplayListReference(
    Value
) {
    if (typeof Value !== "string") {
        return null;
    }

    const Match =
        /^List:([1-9][0-9]*)$/.exec(
            Value
        );

    return Match === null
        ? null
        : Number(Match[1]);
}


function CanMutationPatternFitGarden(
    Mutation,
    SaveData
) {
    const Pattern =
        Mutation.Pattern;

    if (
        !Array.isArray(Pattern) ||
        Pattern.length === 0
    ) {
        return false;
    }


    const PatternHeight =
        Pattern.length;

    const PatternWidth =
        Math.max(
            0,
            ...Pattern.map(
                Row =>
                    Array.isArray(Row)
                        ? Row.length
                        : 0
            )
        );

    if (PatternWidth === 0) {
        return false;
    }


    const GardenWidth =
        Number(
            SaveData.Garden?.Width ?? 0
        );

    const GardenHeight =
        Number(
            SaveData.Garden?.Height ?? 0
        );

    const FitsNormally =
        PatternWidth <= GardenWidth &&
        PatternHeight <= GardenHeight;

    if (FitsNormally) {
        return true;
    }


    return (
        Mutation.Rotation === "Any" &&
        PatternHeight <= GardenWidth &&
        PatternWidth <= GardenHeight
    );
}


function IsHintMatcherAvailable(
    Matcher,
    SaveData
) {
    if (
        Matcher === null ||
        Matcher === "Any" ||
        Matcher === "Empty"
    ) {
        return true;
    }


    if (typeof Matcher === "string") {
        const Plant =
            Plants[Matcher];

        return (
            Plant !== undefined &&
            HasDiscoveredPlant(
                SaveData,
                Plant.Id
            )
        );
    }


    if (
        Matcher === null ||
        typeof Matcher !== "object" ||
        Array.isArray(Matcher)
    ) {
        return false;
    }


    return Object.entries(
        Plants
    ).some(
        ([PlantKey, Plant]) =>
            HasDiscoveredPlant(
                SaveData,
                Plant.Id
            ) &&
            DoesPlantMatchHintMatcher(
                PlantKey,
                Plant,
                Matcher
            )
    );
}


function DoesPlantMatchHintMatcher(
    PlantKey,
    Plant,
    Matcher
) {
    if (
        typeof Matcher.Plant ===
            "string" &&
        Matcher.Plant !== PlantKey
    ) {
        return false;
    }


    const Tags =
        Array.isArray(Plant.Tags)
            ? Plant.Tags
            : [];


    if (
        Array.isArray(
            Matcher.Tags
        ) &&
        !Matcher.Tags.every(
            Tag =>
                Tags.includes(Tag)
        )
    ) {
        return false;
    }


    if (
        Array.isArray(
            Matcher.TagsAny
        ) &&
        Matcher.TagsAny.length > 0 &&
        !Matcher.TagsAny.some(
            Tag =>
                Tags.includes(Tag)
        )
    ) {
        return false;
    }


    if (
        Array.isArray(
            Matcher.TagsNot
        ) &&
        Matcher.TagsNot.some(
            Tag =>
                Tags.includes(Tag)
        )
    ) {
        return false;
    }


    return true;
}


function CreateMutationHintCard(
    Hints,
    Level
) {
    const Card =
        document.createElement(
            "article"
        );

    Card.className =
        "Panel MutationEncyclopediaCard MutationHintCard";


    const Header =
        document.createElement(
            "header"
        );

    Header.className =
        "PanelHeader MutationEncyclopediaHeader";


    const Name =
        document.createElement(
            "h2"
        );

    Name.textContent =
        Level >= MutationHintsMaximumLevel
            ? "Mutation hints"
            : "Mutation hint";

    Header.appendChild(Name);


    const Body =
        document.createElement(
            "div"
        );

    Body.className =
        "MutationEncyclopediaBody";


    if (
        Level < MutationHintsMaximumLevel
    ) {
        const HintText =
            document.createElement(
                "p"
            );

        HintText.className =
            "MutationEncyclopediaDescription";

        HintText.textContent =
            String(
                Hints[0] ?? ""
            ).trim();

        Body.appendChild(
            HintText
        );
    } else {
        const HintList =
            document.createElement(
                "ul"
            );

        HintList.className =
            "MutationHintList";

        for (const Hint of Hints) {
            const Item =
                document.createElement(
                    "li"
                );

            Item.textContent =
                "- " +
                String(Hint).trim();

            HintList.appendChild(
                Item
            );
        }

        Body.appendChild(
            HintList
        );
    }


    Card.append(
        Header,
        Body
    );


    return Card;
}


function CreateMutationEncyclopediaCard(
    Mutation
) {
    const Card =
        document.createElement(
            "article"
        );

    Card.className =
        "Panel MutationEncyclopediaCard";

    Card.id =
        "Mutation-" +
        Mutation.Id;


    const Header =
        document.createElement(
            "header"
        );

    Header.className =
        "PanelHeader MutationEncyclopediaHeader";


    const Number =
        document.createElement(
            "span"
        );

    Number.className =
        "MutationEncyclopediaNumber";

    Number.textContent =
        String(
            Mutation.Id
        ).padStart(
            3,
            "0"
        );


    const Name =
        document.createElement(
            "h2"
        );

    Name.textContent =
        Mutation.Name;


    Header.append(
        Number,
        Name
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
        CreateMutationEncyclopediaStats(
            Mutation
        ),
        CreateMutationRecipeFlow(
            Mutation
        ),
        CreateMutationEncyclopediaRelations(
            Mutation
        )
    );


    Card.append(
        Header,
        Body
    );


    return Card;
}


function CreateMutationEncyclopediaStats(
    Mutation
) {
    const Stats =
        document.createElement(
            "div"
        );

    Stats.className =
        "MutationEncyclopediaStats";


    Stats.append(
        CreateMutationEncyclopediaStat(
            "Chance",
            FormatMutationChance(
                Mutation.Chance
            )
        ),
        CreateMutationEncyclopediaStat(
            "Cooldown",
            FormatMutationEncyclopediaTime(
                Mutation.Cooldown
            )
        ),
        CreateMutationEncyclopediaStat(
            "Rotation",
            Mutation.Rotation ??
            "None"
        ),
        CreateMutationEncyclopediaStat(
            "Mature plants",
            Mutation.AllowImmature === true
                ? "Not required"
                : "Required"
        )
    );


    return Stats;
}


function CreateMutationEncyclopediaStat(
    Name,
    Value
) {
    const Stat =
        document.createElement(
            "div"
        );

    Stat.className =
        "MutationEncyclopediaStat";


    const NameElement =
        document.createElement(
            "span"
        );

    NameElement.className =
        "MutationEncyclopediaStatName";

    NameElement.textContent =
        Name;


    const ValueElement =
        document.createElement(
            "span"
        );

    ValueElement.textContent =
        Value;


    Stat.append(
        NameElement,
        ValueElement
    );


    return Stat;
}


function CreateMutationRecipeFlow(
    Mutation
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

    Title.textContent =
        "Recipe";


    const Pattern =
        NormalizeMutationDisplayMatrix(
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


    const PatternWidth =
        Pattern[0].length;

    const Success =
        NormalizeMutationDisplayMatrix(
            Mutation.Success,
            PatternWidth,
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


    const Input =
        CreateMutationRecipePanel(
            "Arrange",
            Pattern,
            "Pattern",
            Mutation.Lists,
            ListOffsets.Pattern
        );

    const Arrow =
        document.createElement(
            "span"
        );

    Arrow.className =
        "MutationEncyclopediaRecipeArrow";

    Arrow.setAttribute(
        "aria-hidden",
        "true"
    );

    Arrow.textContent =
        "→";


    const Output =
        CreateMutationRecipePanel(
            "Result",
            Success,
            "Result",
            Mutation.Lists,
            ListOffsets.Result
        );


    Flow.append(
        Input,
        Arrow,
        Output
    );


    Section.append(
        Title,
        Flow
    );

    const Lists =
        CreateMutationRecipeLists(
            Mutation.Lists
        );

    if (Lists !== null) {
        Section.appendChild(Lists);
    }


    return Section;
}


function CreateMutationRecipeLists(
    Lists
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
        const Item =
            document.createElement("li");

        const Mode =
            document.createElement("strong");

        Mode.textContent =
            List?.Mode === "Any"
                ? "Any: "
                : "Once: ";

        Item.appendChild(Mode);

        const Labels =
            Array.isArray(List?.Items)
                ? List.Items.map(
                    GetMutationRecipeListItemLabel
                )
                : [];

        Item.append(
            document.createTextNode(
                Labels.length > 0
                    ? Labels.join(", ")
                    : "Empty list"
            )
        );

        OrderedList.appendChild(Item);
    }

    Container.append(
        Heading,
        OrderedList
    );

    return Container;
}


function GetMutationRecipeListItemLabel(
    Item
) {
    if (Item?.Type === "Plant") {
        return Plants[Item.Value]?.Name ??
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


function CreateMutationRecipePanel(
    Heading,
    Matrix,
    Mode,
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

    Title.textContent =
        Heading;


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


    const Labels = [];


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
                CreateMutationRecipeCell(
                    Value,
                    Mode,
                    Lists,
                    ListOffsets?.[Y]?.[X]
                );

            Grid.appendChild(
                Cell.Element
            );

            Labels.push(
                Cell.Label
            );
        }
    }


    Grid.setAttribute(
        "aria-label",
        Labels.join(
            ", "
        )
    );


    Panel.append(
        Title,
        Grid
    );


    return Panel;
}


function CreateMutationRecipeCell(
    Value,
    Mode,
    Lists,
    ListOffset
) {
    if (Mode === "Result") {
        return CreateMutationResultCell(
            Value,
            Lists,
            ListOffset
        );
    }

    return CreateMutationPatternCell(
        Value,
        Lists,
        ListOffset
    );
}


function CreateMutationPatternCell(
    Matcher,
    Lists,
    ListOffset
) {
    if (
        Matcher === null ||
        Matcher === "Any"
    ) {
        return CreateMutationTextCell(
            "Any",
            "MutationRecipeAny"
        );
    }


    if (Matcher === "Empty") {
        return CreateMutationTextCell(
            "Empty",
            "GuideRecipeEmpty"
        );
    }


    if (
        typeof Matcher ===
        "string"
    ) {
        const ListNumber =
            GetMutationDisplayListReference(
                Matcher
            );

        if (ListNumber !== null) {
            const Cell =
                CreateMutationTextCell(
                "List " + ListNumber,
                "MutationRecipeMatcher"
            );

            RegisterMutationRecipePreviewListCell(
                Cell.Element,
                Lists?.[ListNumber - 1],
                ListNumber,
                ListOffset,
                Plants
            );

            return Cell;
        }

        return CreateMutationPlantCell(
            Matcher
        );
    }


    if (
        Matcher === null ||
        typeof Matcher !==
            "object"
    ) {
        return CreateMutationTextCell(
            "Any",
            "MutationRecipeAny"
        );
    }


    if (
        typeof Matcher.Plant ===
        "string"
    ) {
        return CreateMutationPlantCell(
            Matcher.Plant
        );
    }


    const Requirements = [];


    if (
        Array.isArray(
            Matcher.Tags
        ) &&
        Matcher.Tags.length > 0
    ) {
        Requirements.push(
            Matcher.Tags.join(
                " + "
            )
        );
    }


    if (
        Array.isArray(
            Matcher.TagsAny
        ) &&
        Matcher.TagsAny.length > 0
    ) {
        Requirements.push(
            "Any: " +
            Matcher.TagsAny.join(
                " / "
            )
        );
    }


    if (
        Array.isArray(
            Matcher.TagsNot
        ) &&
        Matcher.TagsNot.length > 0
    ) {
        Requirements.push(
            "Not: " +
            Matcher.TagsNot.join(
                ", "
            )
        );
    }


    if (Requirements.length === 0) {
        return CreateMutationTextCell(
            "Any",
            "MutationRecipeAny"
        );
    }


    return CreateMutationTextCell(
        Requirements.join(
            "\n"
        ),
        "MutationRecipeMatcher"
    );
}


function CreateMutationResultCell(
    Result,
    Lists,
    ListOffset
) {
    if (
        Result === null ||
        Result === "Keep"
    ) {
        return CreateMutationTextCell(
            "Keep",
            "MutationRecipeKeep"
        );
    }


    if (Result === "Empty") {
        return CreateMutationTextCell(
            "Empty",
            "GuideRecipeEmpty"
        );
    }


    if (
        typeof Result ===
        "string"
    ) {
        if (
            Result.startsWith(
                "$"
            )
        ) {
            return CreateMutationTextCell(
                Result.slice(1),
                "MutationRecipeCapture"
            );
        }

        const ListNumber =
            GetMutationDisplayListReference(
                Result
            );

        if (ListNumber !== null) {
            const Cell =
                CreateMutationTextCell(
                "List " + ListNumber,
                "MutationRecipeMatcher"
            );

            RegisterMutationRecipePreviewListCell(
                Cell.Element,
                Lists?.[ListNumber - 1],
                ListNumber,
                ListOffset,
                Plants
            );

            return Cell;
        }

        return CreateMutationPlantCell(
            Result
        );
    }


    if (
        Result !== null &&
        typeof Result ===
            "object" &&
        typeof Result.Plant ===
            "string"
    ) {
        if (
            Result.Plant.startsWith(
                "$"
            )
        ) {
            return CreateMutationTextCell(
                Result.Plant.slice(1),
                "MutationRecipeCapture"
            );
        }

        const ListNumber =
            GetMutationDisplayListReference(
                Result.Plant
            );

        if (ListNumber !== null) {
            const Cell =
                CreateMutationTextCell(
                    "List " + ListNumber,
                    "MutationRecipeMatcher"
                );

            RegisterMutationRecipePreviewListCell(
                Cell.Element,
                Lists?.[ListNumber - 1],
                ListNumber,
                ListOffset,
                Plants
            );

            return Cell;
        }

        return CreateMutationPlantCell(
            Result.Plant
        );
    }


    return CreateMutationTextCell(
        "Keep",
        "MutationRecipeKeep"
    );
}


function CreateMutationPlantCell(
    PlantKey
) {
    const Plant =
        Plants[PlantKey];


    if (Plant === undefined) {
        return CreateMutationTextCell(
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
            Plant
        );


    if (MatureImage !== null) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite GuideRecipeImage";

        Image.src =
            MatureImage;

        Image.alt =
            "";

        Element.appendChild(
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
        Plant.Name;


    Element.appendChild(
        Label
    );


    return {
        Element: Element,
        Label: Plant.Name
    };
}


function CreateMutationTextCell(
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

    Label.textContent =
        Text;


    Element.appendChild(
        Label
    );


    return {
        Element: Element,
        Label: Text.replaceAll(
            "\n",
            " "
        )
    };
}


function NormalizeMutationDisplayMatrix(
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


    const Normalized = [];


    for (
        let Y = 0;
        Y < TargetHeight;
        Y++
    ) {
        const SourceRow =
            Array.isArray(
                Matrix[Y]
            )
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


        Normalized.push(
            Row
        );
    }


    return Normalized;
}


function CreateMutationEncyclopediaRelations(
    Mutation
) {
    const Relations =
        document.createElement(
            "div"
        );

    Relations.className =
        "MutationEncyclopediaRelations";


    Relations.append(
        CreateMutationPlantRelationGroup(
            "Plants used",
            Mutation.Relations
                ?.PlantsUsed ?? []
        ),
        CreateMutationPlantRelationGroup(
            "Plants created",
            Mutation.Relations
                ?.PlantsCreated ?? []
        )
    );


    return Relations;
}


function CreateMutationPlantRelationGroup(
    Heading,
    PlantIds
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

    Title.textContent =
        Heading;


    const List =
        document.createElement(
            "ul"
        );

    List.className =
        "MutationEncyclopediaRelationList";


    const SortedPlantIds = [
        ...new Set(
            PlantIds.map(
                PlantId =>
                    Number(PlantId)
            )
        )
    ].sort(
        (A, B) => A - B
    );


    if (SortedPlantIds.length === 0) {
        const Empty =
            document.createElement(
                "li"
            );

        Empty.className =
            "MutationEncyclopediaRelationEmpty";

        Empty.textContent =
            "None";

        List.appendChild(
            Empty
        );
    } else {
        for (
            const PlantId
            of SortedPlantIds
        ) {
            List.appendChild(
                CreateMutationPlantRelation(
                    PlantId
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


function CreateMutationPlantRelation(
    PlantId
) {
    const Item =
        document.createElement(
            "li"
        );


    if (
        !HasDiscoveredPlant(
            MutationEncyclopediaSave,
            PlantId
        )
    ) {
        Item.className =
            "MutationEncyclopediaRelationUnknown";

        Item.textContent =
            "????????";

        return Item;
    }


    const Plant =
        GetPlantById(
            PlantId
        );


    if (Plant === null) {
        Item.textContent =
            "Plant " +
            PlantId;

        return Item;
    }


    const Link =
        document.createElement(
            "a"
        );

    Link.href =
        "/Pages/Plants.html#Plant-" +
        PlantId;

    Link.textContent =
        Plant.Name;


    Item.appendChild(
        Link
    );


    return Item;
}


function FormatMutationChance(
    Chance
) {
    const Percent =
        Math.max(
            0,
            Math.min(
                Number(
                    Chance ?? 1
                ),
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


function FormatMutationEncyclopediaTime(
    Milliseconds
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


    if (TotalSeconds === 0) {
        return "None";
    }


    const Hours =
        Math.floor(
            TotalSeconds /
            3600
        );

    TotalSeconds %= 3600;

    const Minutes =
        Math.floor(
            TotalSeconds /
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

    if (Seconds > 0) {
        Parts.push(
            Seconds + "s"
        );
    }


    return Parts.join(
        " "
    );
}


function SetMutationEncyclopediaMessage(
    Message
) {
    const Element =
        document.getElementById(
            "MutationEncyclopediaMessage"
        );


    if (Element !== null) {
        Element.textContent =
            Message;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartMutationEncyclopedia
);
