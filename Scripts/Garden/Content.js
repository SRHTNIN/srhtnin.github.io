const GameContentCacheName =
    "SarahtoninGardenContent";

const GameContentCacheSchemaVersion = 1;

/*
 * Once content has been checked, page loads for the next
 * five minutes can use the local cache without any API call.
 * After that, only the tiny ContentVersion endpoint is needed
 * unless the catalogue has actually changed.
 */
const GameContentVersionCheckInterval =
    5 * 60 * 1000;


let GameContentLoadPromise = null;


async function LoadGameContent() {
    if (GameContentLoadPromise === null) {
        GameContentLoadPromise =
            LoadGameContentInternal();
    }


    try {
        return await GameContentLoadPromise;
    } catch (Error) {
        GameContentLoadPromise = null;

        throw Error;
    }
}


async function LoadGameContentInternal() {
    const Cache =
        ReadGameContentCache();

    const Now = Date.now();


    if (
        Cache !== null &&
        Now - Cache.CheckedAt <
            GameContentVersionCheckInterval
    ) {
        ApplyGameContent(
            Cache.Plants,
            Cache.Mutations
        );

        return GetLoadedGameContent();
    }


    try {
        const ContentVersion =
            await FetchGameContentVersion();


        if (
            Cache !== null &&
            Cache.ContentVersion ===
                ContentVersion
        ) {
            Cache.CheckedAt = Now;

            WriteGameContentCache(
                Cache
            );

            ApplyGameContent(
                Cache.Plants,
                Cache.Mutations
            );

            return GetLoadedGameContent();
        }


        return await RefreshGameContent(
            ContentVersion
        );
    } catch (VersionError) {
        console.warn(
            "Couldn't check Garden content version. " +
            "Refreshing the catalogues directly.",
            VersionError
        );


        try {
            return await RefreshGameContent(
                null
            );
        } catch (RefreshError) {
            if (Cache !== null) {
                console.warn(
                    "Couldn't refresh Garden content. " +
                    "Using the last cached catalogue.",
                    RefreshError
                );

                ApplyGameContent(
                    Cache.Plants,
                    Cache.Mutations
                );

                return GetLoadedGameContent();
            }

            throw RefreshError;
        }
    }
}


async function FetchGameContentVersion() {
    const Response =
        await fetch(
            ApiUrl +
            "/ContentVersion.php",
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
            "Content version API returned HTTP " +
            Response.status
        );
    }


    const Result =
        await Response.json();


    if (
        !Result.Success ||
        typeof Result.Version !==
            "string" ||
        Result.Version.length === 0
    ) {
        throw new Error(
            Result.Error ??
            "Content version API returned invalid data."
        );
    }


    return Result.Version;
}


async function RefreshGameContent(
    ContentVersion
) {
    const [
        FreshPlants,
        FreshMutations
    ] =
        await Promise.all([
            FetchPlantsFromApi(),
            FetchMutationsFromApi()
        ]);


    const Cache = {
        SchemaVersion:
            GameContentCacheSchemaVersion,

        ContentVersion:
            ContentVersion,

        CheckedAt:
            Date.now(),

        Plants:
            FreshPlants,

        Mutations:
            FreshMutations
    };


    WriteGameContentCache(
        Cache
    );

    ApplyGameContent(
        FreshPlants,
        FreshMutations
    );


    return GetLoadedGameContent();
}


function ApplyGameContent(
    LoadedPlants,
    LoadedMutations
) {
    Plants = LoadedPlants;
    MutationSets = LoadedMutations;
}


function GetLoadedGameContent() {
    return {
        Plants: Plants,
        Mutations: MutationSets
    };
}


function ReadGameContentCache() {
    let RawCache;


    try {
        RawCache =
            localStorage.getItem(
                GameContentCacheName
            );
    } catch (Error) {
        console.warn(
            "Couldn't read the Garden content cache.",
            Error
        );

        return null;
    }


    if (RawCache === null) {
        return null;
    }


    try {
        const Cache =
            JSON.parse(
                RawCache
            );


        if (
            !IsValidGameContentCache(
                Cache
            )
        ) {
            RemoveGameContentCache();

            return null;
        }


        return Cache;
    } catch (Error) {
        RemoveGameContentCache();

        return null;
    }
}


function IsValidGameContentCache(
    Cache
) {
    return (
        Cache !== null &&
        typeof Cache === "object" &&
        !Array.isArray(Cache) &&

        Cache.SchemaVersion ===
            GameContentCacheSchemaVersion &&

        Number.isFinite(
            Cache.CheckedAt
        ) &&

        Cache.CheckedAt >= 0 &&

        (
            Cache.ContentVersion ===
                null ||
            typeof Cache.ContentVersion ===
                "string"
        ) &&

        IsGameContentObject(
            Cache.Plants
        ) &&

        IsGameContentObject(
            Cache.Mutations
        )
    );
}


function IsGameContentObject(
    Value
) {
    return (
        Value !== null &&
        typeof Value === "object" &&
        !Array.isArray(Value)
    );
}


function WriteGameContentCache(
    Cache
) {
    try {
        localStorage.setItem(
            GameContentCacheName,
            JSON.stringify(
                Cache
            )
        );
    } catch (Error) {
        console.warn(
            "Couldn't write the Garden content cache.",
            Error
        );
    }
}


function RemoveGameContentCache() {
    try {
        localStorage.removeItem(
            GameContentCacheName
        );
    } catch (Error) {
        console.warn(
            "Couldn't clear the Garden content cache.",
            Error
        );
    }
}


function ClearGameContentCache() {
    RemoveGameContentCache();
    GameContentLoadPromise = null;
}
