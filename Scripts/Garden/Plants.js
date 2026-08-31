let Plants = {};


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
