let Plants = {};

const PlantDirectionCodes = {
    North: "N",
    East: "E",
    South: "S",
    West: "W"
};



async function FetchPlantsFromApi() {
    const Response =
        await fetch(
            ApiUrl + "/Plants.php",
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache: "no-store"
            }
        );


    if (!Response.ok) {
        throw new Error(
            "Plants API returned HTTP " +
            Response.status
        );
    }


    const Result =
        await Response.json();


    if (
        !Result.Success ||
        Result.Plants === null ||
        typeof Result.Plants !==
            "object" ||
        Array.isArray(
            Result.Plants
        )
    ) {
        throw new Error(
            Result.Error ??
            "Plants API returned invalid data."
        );
    }


    return Result.Plants;
}

function GetPlantImageSources(
    PlantOrKey,
    Direction = null
) {
    const PlantKey =
        typeof PlantOrKey === "string"
            ? PlantOrKey
            : Object.entries(
                Plants
            ).find(
                ([, Candidate]) =>
                    Candidate ===
                        PlantOrKey ||
                    Number(Candidate?.Id) ===
                        Number(PlantOrKey?.Id)
            )?.[0] ?? null;

    const Plant =
        typeof PlantOrKey === "string"
            ? Plants[PlantOrKey]
            : PlantOrKey;

    const StaticImages =
        PlantKey !== null &&
        typeof PlantKey === "string" &&
        Array.isArray(
            PlantImages[PlantKey]
        )
            ? PlantImages[PlantKey]
            : [];

    const ApiStages =
        Array.isArray(
            Plant?.ImageStages
        )
            ? Plant.ImageStages
            : [];

    const DirectionCode =
        typeof Direction === "string"
            ? (
                PlantDirectionCodes[
                    Direction
                ] ??
                Direction.toUpperCase()
            )
            : null;

    const DirectionalStages =
        Plant?.DirectionalSprites === true &&
        DirectionCode !== null &&
        Array.isArray(
            Plant?.DirectionalImageStages
        )
            ? Plant.DirectionalImageStages
                .filter(
                    ImageStage =>
                        String(
                            ImageStage?.Direction ??
                            ""
                        ).toUpperCase() ===
                        DirectionCode
                )
            : [];

    let HighestStage =
        StaticImages.length;

    for (
        const ImageStage
        of [
            ...ApiStages,
            ...DirectionalStages
        ]
    ) {
        const Stage = Number(
            typeof ImageStage === "object" &&
            ImageStage !== null
                ? ImageStage.Stage
                : ImageStage
        );

        if (
            Number.isInteger(Stage) &&
            Stage > HighestStage
        ) {
            HighestStage = Stage;
        }
    }

    const Images =
        Array.from(
            {length: HighestStage},
            (_, Index) =>
                StaticImages[Index] ?? null
        );

    if (Plant === undefined || Plant === null) {
        return Images;
    }

    for (const ImageStage of ApiStages) {
        const Stage = Number(
            typeof ImageStage === "object" &&
            ImageStage !== null
                ? ImageStage.Stage
                : ImageStage
        );

        if (
            !Number.isInteger(Stage) ||
            Stage < 1
        ) {
            continue;
        }

        const Revision =
            typeof ImageStage === "object" &&
            ImageStage !== null
                ? Number(
                    ImageStage.Revision ?? 0
                )
                : 0;

        const Query =
            new URLSearchParams({
                PlantId: String(Plant.Id),
                Stage: String(Stage),
                v: String(
                    Number.isFinite(Revision)
                        ? Revision
                        : 0
                )
            });

        Images[Stage - 1] =
            ApiUrl +
            "/PlantImage.php?" +
            Query.toString();
    }

    for (
        const ImageStage
        of DirectionalStages
    ) {
        const Stage = Number(
            ImageStage?.Stage
        );

        if (
            !Number.isInteger(Stage) ||
            Stage < 1
        ) {
            continue;
        }

        const Revision = Number(
            ImageStage?.Revision ?? 0
        );

        const Query =
            new URLSearchParams({
                PlantId: String(Plant.Id),
                Stage: String(Stage),
                Direction: DirectionCode,
                v: String(
                    Number.isFinite(Revision)
                        ? Revision
                        : 0
                )
            });

        Images[Stage - 1] =
            ApiUrl +
            "/PlantImage.php?" +
            Query.toString();
    }

    return Images;
}

function GetPlantMatureImageSource(
    PlantOrKey
) {
    const Images =
        GetPlantImageSources(
            PlantOrKey
        );

    for (
        let Index = Images.length - 1;
        Index >= 0;
        Index--
    ) {
        if (
            typeof Images[Index] ===
                "string" &&
            Images[Index].length > 0
        ) {
            return Images[Index];
        }
    }

    return null;
}

