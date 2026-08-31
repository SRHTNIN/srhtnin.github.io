async function StartGuide() {
    try {
        await LoadGameContent();
        RenderGuideRecipePlants();
    } catch (Error) {
        console.error(
            "Couldn't load Guide plant images:",
            Error
        );
    }
}


function RenderGuideRecipePlants() {
    const Cells =
        document.querySelectorAll(
            ".GuideRecipePlant[data-plant-key]"
        );


    for (
        const Cell
        of Cells
    ) {
        const PlantKey =
            Cell.dataset.plantKey;

        const Plant =
            Plants[PlantKey];

        const Images =
            PlantImages[PlantKey] ?? [];


        if (
            Plant === undefined ||
            Images.length === 0
        ) {
            continue;
        }


        const Image =
            document.createElement(
                "img"
            );

        Image.className =
            "GuideRecipeImage";

        Image.src =
            Images[
                Images.length - 1
            ];

        Image.alt = "";


        const Label =
            Cell.querySelector(
                ".GuideRecipeLabel"
            );


        if (Label !== null) {
            Label.textContent =
                Plant.Name;
        }


        Cell.prepend(
            Image
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartGuide
);
