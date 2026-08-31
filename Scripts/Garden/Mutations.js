let MutationSets = {};


async function FetchMutationsFromApi() {
    const Response =
        await fetch(
            ApiUrl + "/Mutations.php",
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
            "Mutations API returned HTTP " +
            Response.status
        );
    }


    const Result =
        await Response.json();


    if (
        !Result.Success ||
        Result.Mutations === null ||
        typeof Result.Mutations !==
            "object" ||
        Array.isArray(
            Result.Mutations
        )
    ) {
        throw new Error(
            Result.Error ??
            "Mutations API returned invalid data."
        );
    }


    return Result.Mutations;
}
