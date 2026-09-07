const MutationRecipePreviewCycleMilliseconds = 1200;

let MutationRecipePreviewFrame = 0;
let MutationRecipePreviewTimer = null;

const MutationRecipePreviewCells = new Set();


function GetMutationRecipePreviewListReference(
    Value
) {
    let Reference = Value;

    if (
        Value !== null &&
        typeof Value === "object" &&
        !Array.isArray(Value) &&
        typeof Value.Plant === "string"
    ) {
        Reference = Value.Plant;
    }

    if (typeof Reference !== "string") {
        return null;
    }

    const Match =
        /^List:([1-9][0-9]*)$/.exec(
            Reference
        );

    return Match === null
        ? null
        : Number(Match[1]);
}


function CreateMutationRecipePreviewOffsets(
    Pattern,
    Result
) {
    const PatternOffsets =
        CreateMutationRecipePreviewOffsetMatrix(
            Pattern
        );

    const ResultOffsets =
        Array.isArray(Result)
            ? Result.map(
                Row =>
                    Array.isArray(Row)
                        ? Row.map(() => null)
                        : []
            )
            : [];

    const PatternCounts = {};

    for (
        let Y = 0;
        Y < PatternOffsets.length;
        Y++
    ) {
        for (
            let X = 0;
            X < PatternOffsets[Y].length;
            X++
        ) {
            const Offset =
                PatternOffsets[Y][X];

            if (Offset === null) {
                continue;
            }

            const ListNumber =
                GetMutationRecipePreviewListReference(
                    Pattern?.[Y]?.[X]
                );

            if (ListNumber === null) {
                continue;
            }

            PatternCounts[ListNumber] =
                Math.max(
                    PatternCounts[ListNumber] ?? 0,
                    Offset + 1
                );
        }
    }

    const UsedResultOffsets = {};

    for (
        let Y = 0;
        Y < ResultOffsets.length;
        Y++
    ) {
        for (
            let X = 0;
            X < ResultOffsets[Y].length;
            X++
        ) {
            const ListNumber =
                GetMutationRecipePreviewListReference(
                    Result?.[Y]?.[X]
                );

            if (ListNumber === null) {
                continue;
            }

            const PatternListNumber =
                GetMutationRecipePreviewListReference(
                    Pattern?.[Y]?.[X]
                );

            const PatternOffset =
                PatternOffsets?.[Y]?.[X];

            if (
                PatternListNumber !== ListNumber ||
                PatternOffset === null ||
                PatternOffset === undefined
            ) {
                continue;
            }

            ResultOffsets[Y][X] =
                PatternOffset;

            if (
                UsedResultOffsets[ListNumber] ===
                undefined
            ) {
                UsedResultOffsets[ListNumber] =
                    new Set();
            }

            UsedResultOffsets[ListNumber].add(
                PatternOffset
            );
        }
    }

    const NextOverflowOffset = {};

    for (
        let Y = 0;
        Y < ResultOffsets.length;
        Y++
    ) {
        for (
            let X = 0;
            X < ResultOffsets[Y].length;
            X++
        ) {
            if (ResultOffsets[Y][X] !== null) {
                continue;
            }

            const ListNumber =
                GetMutationRecipePreviewListReference(
                    Result?.[Y]?.[X]
                );

            if (ListNumber === null) {
                continue;
            }

            if (
                UsedResultOffsets[ListNumber] ===
                undefined
            ) {
                UsedResultOffsets[ListNumber] =
                    new Set();
            }

            const Used =
                UsedResultOffsets[ListNumber];

            const PatternCount =
                PatternCounts[ListNumber] ?? 0;

            let Offset = 0;

            while (
                Offset < PatternCount &&
                Used.has(Offset)
            ) {
                Offset++;
            }

            if (Offset >= PatternCount) {
                Offset =
                    NextOverflowOffset[
                        ListNumber
                    ] ?? PatternCount;

                NextOverflowOffset[ListNumber] =
                    Offset + 1;
            }

            Used.add(Offset);
            ResultOffsets[Y][X] = Offset;
        }
    }

    return {
        Pattern: PatternOffsets,
        Result: ResultOffsets
    };
}


function CreateMutationRecipePreviewOffsetMatrix(
    Matrix
) {
    if (!Array.isArray(Matrix)) {
        return [];
    }

    const NextOffsets = {};

    return Matrix.map(
        Row => {
            if (!Array.isArray(Row)) {
                return [];
            }

            return Row.map(
                Value => {
                    const ListNumber =
                        GetMutationRecipePreviewListReference(
                            Value
                        );

                    if (ListNumber === null) {
                        return null;
                    }

                    const Offset =
                        NextOffsets[ListNumber] ?? 0;

                    NextOffsets[ListNumber] =
                        Offset + 1;

                    return Offset;
                }
            );
        }
    );
}


function RegisterMutationRecipePreviewListCell(
    Element,
    List,
    ListNumber,
    Offset,
    PlantCatalogue,
    TextClassName = "MutationRecipeText"
) {
    const Entry = {
        Element: Element,
        List: List,
        ListNumber: ListNumber,
        Offset:
            Number.isInteger(Offset)
                ? Offset
                : 0,
        PlantCatalogue:
            PlantCatalogue ?? {},
        TextClassName: TextClassName
    };

    MutationRecipePreviewCells.add(
        Entry
    );

    RenderMutationRecipePreviewListCell(
        Entry,
        MutationRecipePreviewFrame
    );

    StartMutationRecipePreviewTimer();
}


function StartMutationRecipePreviewTimer() {
    if (
        MutationRecipePreviewTimer !== null ||
        MutationRecipePreviewCells.size === 0
    ) {
        return;
    }

    if (
        window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches === true
    ) {
        return;
    }

    MutationRecipePreviewTimer =
        window.setInterval(
            AdvanceMutationRecipePreviewFrame,
            MutationRecipePreviewCycleMilliseconds
        );
}


function AdvanceMutationRecipePreviewFrame() {
    MutationRecipePreviewFrame++;

    for (
        const Entry
        of Array.from(
            MutationRecipePreviewCells
        )
    ) {
        if (!Entry.Element.isConnected) {
            MutationRecipePreviewCells.delete(
                Entry
            );
            continue;
        }

        RenderMutationRecipePreviewListCell(
            Entry,
            MutationRecipePreviewFrame
        );
    }

    if (
        MutationRecipePreviewCells.size === 0 &&
        MutationRecipePreviewTimer !== null
    ) {
        window.clearInterval(
            MutationRecipePreviewTimer
        );

        MutationRecipePreviewTimer = null;
    }
}


function RenderMutationRecipePreviewListCell(
    Entry,
    Frame
) {
    const Items =
        Array.isArray(Entry.List?.Items)
            ? Entry.List.Items
            : [];

    if (Items.length === 0) {
        ApplyMutationRecipePreviewCellDisplay(
            Entry,
            {
                Label:
                    "List " +
                    Entry.ListNumber,
                Image: null,
                ClassName:
                    "MutationRecipeMatcher"
            }
        );

        return;
    }

    const ItemIndex =
        (
            Frame +
            Entry.Offset
        ) % Items.length;

    ApplyMutationRecipePreviewCellDisplay(
        Entry,
        GetMutationRecipePreviewItemDisplay(
            Items[ItemIndex],
            Entry.PlantCatalogue
        )
    );
}


function GetMutationRecipePreviewItemDisplay(
    Item,
    PlantCatalogue
) {
    if (Item?.Type === "Plant") {
        const Plant =
            PlantCatalogue?.[
                Item.Value
            ];

        if (Plant === undefined) {
            return {
                Label:
                    Item.Value ??
                    "Unknown plant",
                Image: null,
                ClassName:
                    "MutationRecipeMatcher"
            };
        }

        return {
            Label:
                Plant.Name ??
                Item.Value,
            Image:
                GetPlantMatureImageSource(
                    Plant
                ),
            ClassName:
                "GuideRecipePlant"
        };
    }

    if (Item?.Type === "Tag") {
        return {
            Label:
                Item.Value ?? "",
            Image: null,
            ClassName:
                "MutationRecipeMatcher"
        };
    }

    if (Item?.Type === "Empty") {
        return {
            Label: "Empty",
            Image: null,
            ClassName:
                "GuideRecipeEmpty"
        };
    }

    return {
        Label: "Any",
        Image: null,
        ClassName:
            "MutationRecipeAny"
    };
}


function ApplyMutationRecipePreviewCellDisplay(
    Entry,
    Display
) {
    const Element = Entry.Element;

    Element.classList.remove(
        "GuideRecipePlant",
        "GuideRecipeEmpty",
        "MutationRecipeAny",
        "MutationRecipeMatcher"
    );

    Element.classList.add(
        Display.ClassName
    );

    Element.replaceChildren();

    if (Display.Image !== null) {
        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "PlantSprite GuideRecipeImage";

        Image.src = Display.Image;
        Image.alt = "";

        Element.appendChild(Image);
    }

    const Label =
        document.createElement(
            "span"
        );

    Label.className =
        Display.Image === null
            ? Entry.TextClassName
            : "GuideRecipeLabel";

    Label.textContent =
        Display.Label;

    Element.appendChild(Label);

    Element.title =
        "List " +
        Entry.ListNumber +
        ": " +
        Display.Label;
}
