let SocialCurrentUsername = null;
let GardenerSearchRequest = 0;
let GardenerSearchTimer = null;


async function StartSocial() {
    try {
        await LoadGameContent();
    } catch (Error) {
        console.error(
            "Couldn't load Garden content for Social:",
            Error
        );
    }

    try {
        const Profile = await GetProfile();

        if (
            Profile.Success &&
            Profile.Username !== null
        ) {
            SocialCurrentUsername =
                Profile.Username;
        }
    } catch (Error) {
        console.error(
            "Couldn't load current profile:",
            Error
        );
    }

    BindGardenerSearch();

    await RenderLeaderboard(
        SocialCurrentUsername
    );
}


function BindGardenerSearch() {
    const Form =
        document.getElementById(
            "GardenerSearchForm"
        );

    const Input =
        document.getElementById(
            "GardenerSearchInput"
        );

    if (
        Form === null ||
        Input === null
    ) {
        return;
    }

    Form.addEventListener(
        "submit",
        Event => {
            Event.preventDefault();

            SearchGardeners(
                Input.value
            );
        }
    );

    Input.addEventListener(
        "input",
        () => {
            if (GardenerSearchTimer !== null) {
                clearTimeout(
                    GardenerSearchTimer
                );
            }

            const Search =
                Input.value.trim();

            if (Search.length === 0) {
                ClearGardenerSearch();
                return;
            }

            GardenerSearchTimer =
                setTimeout(
                    () => {
                        SearchGardeners(
                            Search
                        );
                    },
                    250
                );
        }
    );

    const Query =
        new URLSearchParams(
            window.location.search
        );

    const InitialSearch =
        Query.get("Search")?.trim() ?? "";

    if (InitialSearch.length > 0) {
        Input.value = InitialSearch;
        SearchGardeners(
            InitialSearch
        );
    }
}


function ClearGardenerSearch() {
    GardenerSearchRequest++;

    const Results =
        document.getElementById(
            "GardenerSearchResults"
        );

    Results?.replaceChildren();

    SetGardenerSearchMessage(
        "Search for a gardener by username."
    );
}


async function SearchGardeners(
    SearchValue
) {
    const Search =
        String(SearchValue ?? "")
            .trim();

    if (Search.length === 0) {
        ClearGardenerSearch();
        return;
    }

    const RequestId =
        ++GardenerSearchRequest;

    SetGardenerSearchMessage(
        "Searching..."
    );

    try {
        const Query =
            new URLSearchParams({
                Search: Search
            });

        const Response = await fetch(
            ApiUrl +
            "/Gardeners.php?" +
            Query.toString(),
            {
                cache: "no-store"
            }
        );

        const Result =
            await Response.json();

        if (RequestId !== GardenerSearchRequest) {
            return;
        }

        if (!Result.Success) {
            throw new Error(
                Result.Error ??
                "Couldn't search gardeners."
            );
        }

        RenderGardenerSearchResults(
            Array.isArray(Result.Gardeners)
                ? Result.Gardeners
                : []
        );
    } catch (Error) {
        if (RequestId !== GardenerSearchRequest) {
            return;
        }

        console.error(
            "Couldn't search gardeners:",
            Error
        );

        document.getElementById(
            "GardenerSearchResults"
        )?.replaceChildren();

        SetGardenerSearchMessage(
            "Couldn't search gardeners."
        );
    }
}


function RenderGardenerSearchResults(
    Gardeners
) {
    const Results =
        document.getElementById(
            "GardenerSearchResults"
        );

    if (Results === null) {
        return;
    }

    Results.replaceChildren();

    if (Gardeners.length === 0) {
        SetGardenerSearchMessage(
            "No gardeners matched that search."
        );

        return;
    }

    for (const Gardener of Gardeners) {
        Results.appendChild(
            CreateGardenerSearchResult(
                Gardener
            )
        );
    }

    SetGardenerSearchMessage(
        Gardeners.length === 1
            ? "1 gardener found."
            : Gardeners.length
                .toLocaleString() +
                " gardeners found."
    );
}


function CreateGardenerSearchResult(
    Gardener
) {
    const Link =
        document.createElement(
            "a"
        );

    Link.className =
        "PlantTile GardenerSearchResult";

    Link.href =
        GetGardenerPageUrl(
            Gardener.Username
        );

    const Avatar =
        CreateGardenerAvatar(
            Gardener.ProfilePicture,
            Gardener.Username,
            "GardenerAvatarLarge"
        );

    const Details =
        document.createElement(
            "span"
        );

    Details.className =
        "GardenerSearchResultDetails";

    const Name =
        document.createElement(
            "strong"
        );

    Name.className =
        "GardenerSearchResultName";

    Name.textContent =
        Gardener.Username;

    ApplyPlayerColour(
        Name,
        Gardener.Colour
    );

    const Description =
        document.createElement(
            "span"
        );

    Description.className =
        "GardenerSearchResultDescription";

    Description.textContent =
        typeof Gardener.Description ===
            "string" &&
        Gardener.Description.length > 0
            ? Gardener.Description
            : "No description.";

    Details.append(
        Name,
        Description
    );

    Link.append(
        Avatar,
        Details
    );

    return Link;
}


function SetGardenerSearchMessage(
    Text
) {
    const Message =
        document.getElementById(
            "GardenerSearchMessage"
        );

    if (Message !== null) {
        Message.textContent = Text;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    StartSocial
);
