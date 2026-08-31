let Plants = {};

let PlantsLoadPromise = null;


async function LoadPlants() {
    if (PlantsLoadPromise !== null) {
        return PlantsLoadPromise;
    }


    PlantsLoadPromise =
        LoadPlantsFromApi();


    try {
        return await PlantsLoadPromise;
    } catch (Error) {
        PlantsLoadPromise = null;

        throw Error;
    }
}


async function LoadPlantsFromApi() {
    const Response =
        await fetch(
            ApiUrl + "/Plants.php",
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }
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


    Plants =
        Result.Plants;


    return Plants;
}
