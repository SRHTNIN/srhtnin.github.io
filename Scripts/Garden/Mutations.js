let MutationSets = {};

let MutationsLoadPromise = null;
let GameContentLoadPromise = null;


async function LoadMutations() {
    if (MutationsLoadPromise !== null) {
        return MutationsLoadPromise;
    }


    MutationsLoadPromise =
        LoadMutationsFromApi();


    try {
        return await MutationsLoadPromise;
    } catch (Error) {
        MutationsLoadPromise = null;

        throw Error;
    }
}


async function LoadMutationsFromApi() {
    const Response =
        await fetch(
            ApiUrl + "/Mutations.php",
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


    MutationSets =
        Result.Mutations;


    return MutationSets;
}


async function LoadGameContent() {
    if (GameContentLoadPromise === null) {
        GameContentLoadPromise =
            Promise.all([
                LoadPlants(),
                LoadMutations()
            ]);
    }


    try {
        await GameContentLoadPromise;
    } catch (Error) {
        GameContentLoadPromise = null;

        throw Error;
    }


    return {
        Plants: Plants,
        Mutations: MutationSets
    };
}
